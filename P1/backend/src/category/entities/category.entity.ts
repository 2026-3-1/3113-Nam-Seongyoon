import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from '../../course/entities/course.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  icon: string;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
