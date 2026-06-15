import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Course } from './entities/course.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { User } from './entities/user.entity';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Course,
      Order,
      OrderItem,
      User,
      Payment,
    ]),
    NotificationModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
