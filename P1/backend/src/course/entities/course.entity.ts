import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Chapter } from '../../chapter/entities/chapter.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'instructor_name' })
  instructorName: string;

  @Column({ type: 'real', default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column()
  price: number;

  @Column({ name: 'original_price', nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  tag: string;

  @Column({ default: '' })
  thumbnail: string;

  @Column({ default: '' })
  badge: string;

  @Column({ default: '' })
  duration: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.courses, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Chapter, (chapter) => chapter.course)
  chapters: Chapter[];

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
