import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category/entities/category.entity';
import { Course } from './course/entities/course.entity';
import { Chapter } from './chapter/entities/chapter.entity';
import { Review } from './review/entities/review.entity';
import { User } from './user/entities/user.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { InstructorApplication } from './instructor/entities/instructor-application.entity';

import { CategoryModule } from './category/category.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { InstructorModule } from './instructor/instructor.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'certificatedu'),
        entities: [
          Category,
          Course,
          Chapter,
          Review,
          User,
          CartItem,
          Order,
          OrderItem,
          Enrollment,
          InstructorApplication,
        ],
        synchronize: true,
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    CategoryModule,
    CourseModule,
    ChapterModule,
    ReviewModule,
    UserModule,
    CartModule,
    OrderModule,
    EnrollmentModule,
    InstructorModule,
    SeedModule,
  ],
})
export class AppModule {}
