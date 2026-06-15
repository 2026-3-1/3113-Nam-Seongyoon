import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { User } from './user.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  thumbnail: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int', nullable: true })
  originalPrice: number | null;

  @Column({ default: '인증 강사' })
  badge: string;

  @Column({ default: '총 0강' })
  duration: string;

  @Column({ type: 'text', nullable: true })
  tag: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  curriculum: Array<{
    title: string;
    videoUrl: string;
  }>;

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.courses, {
    eager: true,
    nullable: true,
  })
  teacher: User | null;

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
