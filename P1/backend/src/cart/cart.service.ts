import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
  ) {}

  async getCart(userId: number): Promise<CartItem[]> {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async addItem(userId: number, courseId: number): Promise<CartItem[]> {
    const existing = await this.cartRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (existing) throw new ConflictException('Already in cart');

    const item = this.cartRepo.create({
      user: { id: userId } as any,
      course: { id: courseId } as any,
    });
    await this.cartRepo.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: number, courseId: number): Promise<CartItem[]> {
    const item = await this.cartRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepo.delete(item.id);
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepo.delete({ user: { id: userId } as any });
  }
}
