import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM CLI 전용 DataSource — migration:generate / migration:run / migration:revert 에서 사용
 * 애플리케이션 런타임은 app.module.ts 의 TypeOrmModule.forRootAsync 를 사용함
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER ?? 'certificatedu',
  password: process.env.DB_PASSWORD ?? 'certificatedu_pass',
  database: process.env.DB_DATABASE ?? 'certificatedu',
  charset: 'utf8mb4',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
