import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  // constructor(
  //   @InjectRepository(Course)
  //   private readonly courseRepo: Repository<Course>,
  // ) {}

  async create(dto: CreateCourseDto): Promise<any> {
    // const course = this.courseRepo.create(dto);
    // return this.courseRepo.save(course);
    return { id: 1, ...dto };
  }

  async findAll(): Promise<any[]> {
    // return this.courseRepo.find({ relations: ['category', 'instructor'] });
    return [];
  }

  async findOne(id: number): Promise<any> {
    // const course = await this.courseRepo.findOne({
    //   where: { id },
    //   relations: ['category', 'instructor'],
    // });
    // if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    // return course;
    return { id, title: 'Test Course' };
  }

  async update(id: number, dto: UpdateCourseDto): Promise<any> {
    // const course = await this.findOne(id);
    // Object.assign(course, dto);
    // return this.courseRepo.save(course);
    return { id, ...dto };
  }

  async remove(id: number): Promise<void> {
    // const course = await this.findOne(id);
    // await this.courseRepo.remove(course);
  }

  async updateRating(id: number): Promise<void> {
    // 리뷰 관계가 주석 처리됨, 임시로 비활성화
    // const reviews = await this.courseRepo.findOne({
    //   where: { id },
    //   relations: ['reviews'],
    // });
    // if (reviews && reviews.reviews.length > 0) {
    //   const avgRating = reviews.reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.reviews.length;
    //   await this.courseRepo.update(id, { rating: avgRating, reviewCount: reviews.reviews.length });
    // }
  }
}