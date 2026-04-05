import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
// import { User } from '../../../user/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  rating: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'date' })
  date: string;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'userId' })
  // user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;
}