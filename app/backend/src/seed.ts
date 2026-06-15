/**
 * 개발용 시드 데이터 스크립트
 * 실행: npx ts-node -r tsconfig-paths/register src/seed.ts
 */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Course } from './entities/course.entity';

const DB_TYPE = (process.env.DB_TYPE ?? 'sqlite') as 'sqlite' | 'mysql';

const ds = new DataSource(
  DB_TYPE === 'mysql'
    ? {
        type: 'mysql',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        username: process.env.DB_USER ?? 'certificatedu',
        password: process.env.DB_PASSWORD ?? 'certificatedu_pass',
        database: process.env.DB_DATABASE ?? 'certificatedu',
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
      }
    : {
        type: 'sqlite',
        database: process.env.DB_DATABASE ?? 'certificatedu.sqlite',
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: true,
      },
);

async function seed() {
  await ds.initialize();
  console.log('DB 연결 완료');

  const userRepo = ds.getRepository(User);
  const courseRepo = ds.getRepository(Course);

  // 기존 데이터 초기화
  await ds.query('DELETE FROM courses');
  await ds.query('DELETE FROM users');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // 유저 생성
  const admin = userRepo.create({
    email: 'admin@certificatedu.kr',
    name: '관리자',
    passwordHash: await hash('Admin1234!'),
    role: UserRole.ADMIN,
  });

  const teacher1 = userRepo.create({
    email: 'teacher1@certificatedu.kr',
    name: '김강사',
    passwordHash: await hash('Teacher1234!'),
    role: UserRole.TEACHER,
  });

  const teacher2 = userRepo.create({
    email: 'teacher2@certificatedu.kr',
    name: '이선생',
    passwordHash: await hash('Teacher1234!'),
    role: UserRole.TEACHER,
  });

  const student = userRepo.create({
    email: 'student@certificatedu.kr',
    name: '홍길동',
    passwordHash: await hash('Student1234!'),
    role: UserRole.STUDENT,
  });

  await userRepo.save([admin, teacher1, teacher2, student]);
  console.log('유저 4명 생성 완료');

  // 강의 생성
  const courses = courseRepo.create([
    {
      title: 'NestJS 완전 정복 — 백엔드 입문부터 실전까지',
      category: 'backend',
      description: 'NestJS + TypeORM + JWT 인증을 단계별로 학습합니다.',
      thumbnail: 'https://placehold.co/320x180?text=NestJS',
      price: 49000,
      originalPrice: 79000,
      badge: '베스트셀러',
      duration: '총 32강',
      tag: 'HOT',
      curriculum: [
        {
          title: '1강. NestJS 소개 및 설치',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        { title: '2강. 모듈·컨트롤러·서비스 구조', videoUrl: '' },
        { title: '3강. TypeORM 연동', videoUrl: '' },
      ],
      isPublished: true,
      teacher: teacher1,
    },
    {
      title: 'React 19 + TypeScript 실전 프로젝트',
      category: 'frontend',
      description:
        'Vite + React 19 + TypeScript로 인강 사이트를 직접 만들어봅니다.',
      thumbnail: 'https://placehold.co/320x180?text=React',
      price: 55000,
      originalPrice: 89000,
      badge: '신규',
      duration: '총 28강',
      tag: 'NEW',
      curriculum: [
        { title: '1강. Vite 프로젝트 초기화', videoUrl: '' },
        { title: '2강. 라우팅 설정', videoUrl: '' },
      ],
      isPublished: true,
      teacher: teacher1,
    },
    {
      title: 'MySQL 8 & 쿼리 최적화 실습',
      category: 'database',
      description: 'MySQL 기초부터 인덱스·슬로우 쿼리 분석까지 다룹니다.',
      thumbnail: 'https://placehold.co/320x180?text=MySQL',
      price: 39000,
      originalPrice: null,
      badge: '인증 강사',
      duration: '총 20강',
      tag: null,
      curriculum: [
        { title: '1강. MySQL 설치 및 기본 SQL', videoUrl: '' },
        { title: '2강. 인덱스 원리', videoUrl: '' },
      ],
      isPublished: true,
      teacher: teacher2,
    },
    {
      title: 'Docker & CI/CD 파이프라인 구축',
      category: 'devops',
      description:
        'Docker Compose + GitHub Actions를 이용한 자동 배포를 실습합니다.',
      thumbnail: 'https://placehold.co/320x180?text=Docker',
      price: 45000,
      originalPrice: 65000,
      badge: '인기',
      duration: '총 18강',
      tag: 'HOT',
      curriculum: [
        { title: '1강. Docker 기초', videoUrl: '' },
        { title: '2강. Docker Compose', videoUrl: '' },
        { title: '3강. GitHub Actions CI', videoUrl: '' },
      ],
      isPublished: true,
      teacher: teacher2,
    },
    {
      title: '정보처리기사 실기 단기 완성',
      category: 'cert',
      description:
        '정보처리기사 실기 핵심 이론 + 기출 풀이를 8주 안에 완성합니다.',
      thumbnail: 'https://placehold.co/320x180?text=Cert',
      price: 35000,
      originalPrice: 59000,
      badge: '합격률 1위',
      duration: '총 40강',
      tag: 'BEST',
      curriculum: [
        { title: '1강. 데이터베이스 개요', videoUrl: '' },
        { title: '2강. 운영체제 핵심', videoUrl: '' },
      ],
      isPublished: true,
      teacher: teacher1,
    },
  ]);

  await courseRepo.save(courses);
  console.log(`강의 ${courses.length}개 생성 완료`);

  console.log('\n=== 시드 계정 ===');
  console.log('admin@certificatedu.kr / Admin1234!  (관리자)');
  console.log('teacher1@certificatedu.kr / Teacher1234!  (강사)');
  console.log('teacher2@certificatedu.kr / Teacher1234!  (강사)');
  console.log('student@certificatedu.kr / Student1234!  (학생)');

  await ds.destroy();
  console.log('\n시드 완료!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
