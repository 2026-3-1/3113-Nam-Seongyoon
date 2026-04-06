import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  findByCourse(courseId: number): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { course: { id: courseId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    return review;
  }

  create(courseId: number, dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create({
      rating: dto.rating,
      content: dto.content,
      course: { id: courseId } as any,
      user: { id: dto.userId } as any,
    });
    return this.reviewRepo.save(review);
  }

  async update(id: number, dto: Partial<CreateReviewDto>): Promise<Review> {
    await this.findOne(id);
    await this.reviewRepo.update(id, {
      rating: dto.rating,
      content: dto.content,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.reviewRepo.delete(id);
  }
}
