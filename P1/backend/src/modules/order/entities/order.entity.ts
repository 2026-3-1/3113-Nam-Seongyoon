import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// import { User } from '../../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'date' })
  orderDate: string;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'userId' })
  // user: User;

  @Column()
  userId: number;

  @OneToMany(() => Course, course => course.id) // Many-to-many simplified
  courses: Course[];
}