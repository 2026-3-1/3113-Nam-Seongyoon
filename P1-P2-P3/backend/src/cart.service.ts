import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartItem } from './entities/cart-item.entity';
import { Course } from './entities/course.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from './entities/user.entity';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(CartItem)
    private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    private readonly notification: NotificationService,
  ) {}

  async findAll(currentUser: CurrentUser) {
    const items = await this.cartItems.find({
      where: { user: { id: currentUser.id } },
      relations: { course: { reviews: true, teacher: true } },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => this.serializeCartItem(item));
  }

  async add(dto: AddCartItemDto, currentUser: CurrentUser) {
    const course = await this.courses.findOne({
      where: { id: dto.courseId },
      relations: { reviews: true, teacher: true },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const exists = await this.cartItems.findOne({
      where: { user: { id: currentUser.id }, course: { id: dto.courseId } },
      relations: { course: { reviews: true, teacher: true } },
    });
    if (exists) {
      exists.selected = true;
      return this.serializeCartItem(await this.cartItems.save(exists));
    }

    const user = await this.users.findOne({ where: { id: currentUser.id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const item = this.cartItems.create({ user, course, selected: true });
    return this.serializeCartItem(await this.cartItems.save(item));
  }

  async update(id: number, dto: UpdateCartItemDto, currentUser: CurrentUser) {
    const item = await this.findOwnedItem(id, currentUser);
    if (dto.selected !== undefined) item.selected = dto.selected;
    return this.serializeCartItem(await this.cartItems.save(item));
  }

  async remove(id: number, currentUser: CurrentUser) {
    const item = await this.findOwnedItem(id, currentUser);
    await this.cartItems.remove(item);
    return { ok: true };
  }

  async clear(currentUser: CurrentUser) {
    await this.cartItems
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId: currentUser.id })
      .execute();
    return { ok: true };
  }

  /**
   * 1단계: 결제 초기화 — PENDING 주문/결제 레코드 생성 후 Toss SDK에 넘길 정보 반환
   */
  async initiateCheckout(currentUser: CurrentUser) {
    const selectedItems = await this.cartItems.find({
      where: { user: { id: currentUser.id }, selected: true },
      relations: { course: true },
    });
    if (selectedItems.length === 0) {
      return { ok: false, message: '선택된 강의가 없습니다.' };
    }

    const user = await this.users.findOne({ where: { id: currentUser.id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const totalPrice = selectedItems.reduce(
      (sum, item) => sum + item.course.price,
      0,
    );
    // Toss orderId: 영숫자·하이픈만 허용 (최대 64자)
    const tossOrderId = `cert-${currentUser.id}-${Date.now()}`;
    const orderName =
      selectedItems.length === 1
        ? selectedItems[0].course.title
        : `${selectedItems[0].course.title} 외 ${selectedItems.length - 1}건`;

    // PENDING 결제 레코드 생성 (idempotencyKey = tossOrderId)
    const existing = await this.payments.findOne({
      where: { idempotencyKey: tossOrderId },
    });
    if (!existing) {
      await this.payments.save(
        this.payments.create({
          idempotencyKey: tossOrderId,
          status: PaymentStatus.PENDING,
          amount: totalPrice,
          user,
        }),
      );
    }

    return {
      ok: true,
      tossOrderId,
      orderName,
      amount: totalPrice,
      customerEmail: user.email,
      customerName: user.name,
    };
  }

  /**
   * 2단계: Toss 결제 확인 — Toss API 승인 후 주문·결제 완료 처리
   */
  async confirmCheckout(
    currentUser: CurrentUser,
    paymentKey: string,
    tossOrderId: string,
    amount: number,
  ) {
    const payment = await this.payments.findOne({
      where: { idempotencyKey: tossOrderId, user: { id: currentUser.id } },
    });
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    if (payment.status === PaymentStatus.PAID)
      throw new ConflictException('이미 처리된 결제입니다.');
    if (payment.amount !== amount)
      throw new ConflictException('결제 금액이 일치하지 않습니다.');

    const user = await this.users.findOne({ where: { id: currentUser.id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    try {
      const tossResult = await this.callTossConfirm(
        paymentKey,
        tossOrderId,
        amount,
      );

      const selectedItems = await this.cartItems.find({
        where: { user: { id: currentUser.id }, selected: true },
        relations: { course: true },
      });

      const order = await this.orders.save(
        this.orders.create({
          user,
          totalPrice: amount,
          status: 'PAID',
          items: selectedItems.map((item) =>
            this.orderItems.create({
              course: item.course,
              price: item.course.price,
            }),
          ),
        }),
      );

      payment.status = PaymentStatus.PAID;
      payment.pgTransactionId = tossResult.paymentKey;
      payment.receiptUrl = tossResult.receipt?.url ?? null;
      payment.order = order;
      await this.payments.save(payment);

      await this.cartItems.remove(selectedItems);

      this.notification
        .sendPurchaseConfirm(
          user.email,
          user.name,
          selectedItems.map((i) => i.course.title).join(', '),
          amount,
        )
        .catch((err) =>
          this.logger.warn(`[알림 실패] ${(err as Error).message}`),
        );

      return {
        ok: true,
        orderId: order.id,
        receiptUrl: payment.receiptUrl,
        message: '결제가 완료되었습니다.',
      };
    } catch (err) {
      payment.status = PaymentStatus.FAILED;
      payment.failReason = (err as Error).message;
      await this.payments.save(payment);
      throw err;
    }
  }

  /** Toss Payments 승인 API 호출 (Exponential Backoff 재시도) */
  private async callTossConfirm(
    paymentKey: string,
    orderId: string,
    amount: number,
    maxRetries = 3,
  ) {
    const secretKey = process.env.TOSS_SECRET_KEY ?? '';
    const encoded = Buffer.from(`${secretKey}:`).toString('base64');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${encoded}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentKey, orderId, amount }),
          },
        );
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(err.message ?? `Toss API 오류 (${res.status})`);
        }
        return res.json() as Promise<{
          paymentKey: string;
          receipt?: { url: string };
        }>;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise((r) => setTimeout(r, 100 * 2 ** (attempt - 1)));
        this.logger.warn(`[Toss 재시도] ${attempt}/${maxRetries}`);
      }
    }
    throw new Error('Toss 결제 승인에 실패했습니다.');
  }

  private async findOwnedItem(id: number, currentUser: CurrentUser) {
    const item = await this.cartItems.findOne({
      where: { id, user: { id: currentUser.id } },
      relations: { course: { reviews: true, teacher: true } },
    });
    if (!item) throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    return item;
  }

  private serializeCartItem(item: CartItem) {
    const reviews = item.course.reviews ?? [];
    const rating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length;

    return {
      id: item.id,
      selected: item.selected,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      course: {
        ...item.course,
        reviews: undefined,
        teacher: item.course.teacher
          ? {
              id: item.course.teacher.id,
              email: item.course.teacher.email,
              name: item.course.teacher.name,
              role: item.course.teacher.role,
            }
          : null,
        rating: Number(rating.toFixed(1)),
        reviewCount: reviews.length,
        duration: this.resolveDuration(item.course),
        curriculum: item.course.curriculum ?? [],
      },
    };
  }

  private resolveDuration(course: Course) {
    const lessonCount = course.curriculum?.length ?? 0;
    return lessonCount > 0 ? `총 ${lessonCount}강` : course.duration;
  }
}
