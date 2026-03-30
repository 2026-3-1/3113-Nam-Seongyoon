import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/course/course.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ReviewModule } from './modules/review/review.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { InstructorModule } from './modules/instructor/instructor.module';

@Module({
  imports: [
    // 환경변수
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM — MySQL 연결
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'certificatedu'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,   // Flyway가 스키마 관리 — 절대 true 금지
        logging: config.get('NODE_ENV') === 'development',
        timezone: 'Z',
      }),
    }),

    // 도메인 모듈
    UserModule,
    AuthModule,
    CategoryModule,
    CourseModule,
    ChapterModule,
    EnrollmentModule,
    ReviewModule,
    CartModule,
    OrderModule,
    InstructorModule,
  ],
})
export class AppModule {}
