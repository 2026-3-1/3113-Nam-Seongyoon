import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { OrderItem } from './entities/order-item.entity';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, OrderItem]),
    UserModule,
    SubscriptionModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
