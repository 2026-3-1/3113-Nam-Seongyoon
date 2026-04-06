import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const cartItems = await this.cartService.getCart(dto.userId);
    const selectedItems = cartItems.filter((item) =>
      dto.courseIds.includes(item.course.id),
    );

    if (selectedItems.length === 0) {
      throw new NotFoundException('No valid cart items found');
    }

    const total = selectedItems.reduce(
      (sum, item) => sum + item.course.price,
      0,
    );

    const order = this.orderRepo.create({
      total,
      status: 'COMPLETED',
      user: { id: dto.userId } as any,
    });
    const savedOrder = await this.orderRepo.save(order);

    const orderItems = selectedItems.map((item) =>
      this.orderItemRepo.create({
        price: item.course.price,
        order: { id: savedOrder.id } as any,
        course: { id: item.course.id } as any,
      }),
    );
    await this.orderItemRepo.save(orderItems);

    // Enroll user in purchased courses
    for (const item of selectedItems) {
      await this.enrollmentService.enroll(dto.userId, item.course.id);
    }

    // Clear purchased items from cart
    for (const item of selectedItems) {
      await this.cartService.removeItem(dto.userId, item.course.id);
    }

    return this.findOne(savedOrder.id);
  }
}
