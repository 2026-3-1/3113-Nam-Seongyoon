import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
// import { Chapter } from '../../chapter/entities/chapter.entity';
// import { Review } from '../../review/entities/review.entity';
// import { Enrollment } from '../../enrollment/entities/enrollment.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  duration: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ nullable: true })
  tag: string; // BEST, NEW, HOT

  @Column({ nullable: true })
  badge: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @Column()
  instructorId: number;

  // @OneToMany(() => Chapter, chapter => chapter.course)
  // chapters: Chapter[];

  // @OneToMany(() => Review, review => review.course)
  // reviews: Review[];

  // @OneToMany(() => Enrollment, enrollment => enrollment.course)
  // enrollments: Enrollment[];
}