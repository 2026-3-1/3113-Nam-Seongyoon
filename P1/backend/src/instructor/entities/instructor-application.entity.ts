import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('instructor_applications')
export class InstructorApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  category: string;

  @Column({ name: 'career_years' })
  careerYears: string;

  @Column({ name: 'pass_count' })
  passCount: string;

  @Column({ type: 'text' })
  intro: string;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
