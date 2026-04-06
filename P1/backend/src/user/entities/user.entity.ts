import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Order } from '../../order/entities/order.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'LEARNER' })
  role: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
