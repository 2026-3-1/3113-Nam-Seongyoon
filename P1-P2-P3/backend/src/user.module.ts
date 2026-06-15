import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Bookmark } from './entities/bookmark.entity';
import { Course } from './entities/course.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Order } from './entities/order.entity';
import { Review } from './entities/review.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Bookmark,
      Course,
      CourseProgress,
      Order,
      Review,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
