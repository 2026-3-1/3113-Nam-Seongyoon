import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth.module';
import { BookmarkModule } from './bookmark.module';
import { CartModule } from './cart.module';
import { CourseModule } from './course.module';
import { NotificationModule } from './notification/notification.module';
import { OrderModule } from './order.module';
import { ProgressModule } from './progress.module';
import { ReviewModule } from './review.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user.module';
import { UploadController } from './upload.controller';

@Module({
  controllers: [AppController, UploadController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        const isProd = config.get('NODE_ENV') === 'production';
        // production: synchronize=false + 마이그레이션 자동 실행
        // development/test: 환경변수 DB_SYNC 로 제어 (기본 true)
        const sync = isProd ? false : config.get('DB_SYNC', 'true') === 'true';
        const logging = !isProd;
        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: config.get('DB_HOST', 'localhost'),
            port: Number(config.get('DB_PORT', '3306')),
            username: config.get('DB_USER', 'certificatedu'),
            password: config.get('DB_PASSWORD', 'certificatedu_pass'),
            database: config.get('DB_DATABASE', 'certificatedu'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
            migrationsRun: isProd,
            synchronize: sync,
            logging,
            charset: 'utf8mb4',
          } as const;
        }
        return {
          type: 'sqlite',
          database: config.get('DB_DATABASE', 'certificatedu.sqlite'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: isProd,
          synchronize: sync,
          logging,
        } as const;
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TerminusModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    AdminModule,
    CourseModule,
    BookmarkModule,
    CartModule,
    OrderModule,
    ProgressModule,
    ReviewModule,
    NotificationModule,
    SchedulerModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
