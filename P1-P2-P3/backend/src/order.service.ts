import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  async findMine(currentUser: CurrentUser) {
    const orders = await this.orders.find({
      where: { user: { id: currentUser.id } },
      relations: { items: { course: { teacher: true } } },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => ({
      id: order.id,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        price: item.price,
        course: {
          ...item.course,
          teacher: item.course.teacher
            ? {
                id: item.course.teacher.id,
                email: item.course.teacher.email,
                name: item.course.teacher.name,
                role: item.course.teacher.role,
              }
            : null,
          rating: 0,
          reviewCount: 0,
          curriculum: item.course.curriculum ?? [],
        },
      })),
    }));
  }
}
