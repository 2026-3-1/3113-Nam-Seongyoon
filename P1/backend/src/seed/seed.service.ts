import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Course } from '../course/entities/course.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Chapter)
    private readonly chapterRepo: Repository<Chapter>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.categoryRepo.count();
    if (count > 0) return; // 이미 시드됨

    // 카테고리 생성
    const categories = await this.categoryRepo.save([
      { label: 'IT/개발', icon: '💻' },
      { label: '경영/회계', icon: '📊' },
      { label: '언어', icon: '🗣' },
      { label: '전기/전자', icon: '⚡' },
      { label: '안전/환경', icon: '🛡' },
    ]);

    const [it, business, language, electric, safety] = categories;

    // 강좌 생성
    const courses = await this.courseRepo.save([
      {
        title: '정보처리기사 완전정복',
        instructorName: '김태호',
        price: 89000,
        originalPrice: 130000,
        tag: 'BEST',
        thumbnail: '💻',
        badge: '인증강사',
        duration: '총 48강',
        rating: 4.9,
        reviewCount: 1240,
        category: it,
        description: '정보처리기사 자격증 취득을 위한 완벽한 커리큘럼. 필기부터 실기까지 한 번에!',
      },
      {
        title: '전산세무 2급 핵심정리',
        instructorName: '박지수',
        price: 72000,
        originalPrice: 100000,
        tag: 'HOT',
        thumbnail: '📊',
        badge: '인증강사',
        duration: '총 36강',
        rating: 4.7,
        reviewCount: 856,
        category: business,
        description: '전산세무 2급 합격을 위한 핵심 이론 및 기출 문제 총정리.',
      },
      {
        title: 'TOEIC 900점 달성 전략',
        instructorName: '이수진',
        price: 65000,
        originalPrice: 90000,
        tag: 'NEW',
        thumbnail: '🗣',
        badge: '인증강사',
        duration: '총 60강',
        rating: 4.8,
        reviewCount: 2100,
        category: language,
        description: 'TOEIC 고득점을 위한 전략적 학습 방법과 최신 기출 유형 분석.',
      },
      {
        title: '전기기사 필기 + 실기',
        instructorName: '최민준',
        price: 95000,
        originalPrice: 140000,
        tag: 'BEST',
        thumbnail: '⚡',
        badge: '인증강사',
        duration: '총 72강',
        rating: 4.9,
        reviewCount: 1890,
        category: electric,
        description: '전기기사 필기와 실기를 한 번에 준비하는 통합 강의.',
      },
      {
        title: '산업안전기사 합격 전략',
        instructorName: '한지우',
        price: 78000,
        originalPrice: 110000,
        tag: 'HOT',
        thumbnail: '🛡',
        badge: '인증강사',
        duration: '총 42강',
        rating: 4.6,
        reviewCount: 743,
        category: safety,
        description: '산업안전기사 최단기 합격을 위한 핵심 이론 정리.',
      },
      {
        title: '정보보안기사 심화과정',
        instructorName: '김태호',
        price: 110000,
        originalPrice: 160000,
        tag: 'NEW',
        thumbnail: '🔒',
        badge: '인증강사',
        duration: '총 54강',
        rating: 4.8,
        reviewCount: 562,
        category: it,
        description: '정보보안기사 취득을 위한 심화 이론 및 실전 문제 풀이.',
      },
    ]);

    // 각 강좌에 챕터 추가
    const chapterData = [
      // 정보처리기사
      [
        { title: 'OT - 정보처리기사 소개', duration: '08:20', isFree: true },
        { title: '데이터베이스 기초', duration: '22:15', isFree: true },
        { title: '운영체제 핵심', duration: '31:40' },
        { title: '소프트웨어 공학', duration: '28:55' },
        { title: '네트워크 기초', duration: '25:30' },
        { title: '알고리즘 & 자료구조', duration: '35:10' },
      ],
      // 전산세무 2급
      [
        { title: 'OT - 전산세무 소개', duration: '06:00', isFree: true },
        { title: '재무회계 기초', duration: '28:00', isFree: true },
        { title: '원가회계', duration: '32:00' },
        { title: '부가가치세', duration: '40:00' },
        { title: '소득세', duration: '35:00' },
      ],
      // TOEIC
      [
        { title: 'OT - TOEIC 고득점 전략', duration: '10:00', isFree: true },
        { title: 'Part 1 & 2 공략', duration: '20:00', isFree: true },
        { title: 'Part 3 & 4 청해 훈련', duration: '30:00' },
        { title: 'Part 5 문법 총정리', duration: '25:00' },
        { title: 'Part 6 & 7 독해 전략', duration: '35:00' },
      ],
      // 전기기사
      [
        { title: 'OT - 전기기사 시험 안내', duration: '07:30', isFree: true },
        { title: '전기이론 기초', duration: '40:00', isFree: true },
        { title: '전력공학', duration: '45:00' },
        { title: '전기기기', duration: '38:00' },
        { title: '회로이론', duration: '42:00' },
        { title: '실기 문제풀이', duration: '50:00' },
      ],
      // 산업안전기사
      [
        { title: 'OT - 산업안전 개요', duration: '09:00', isFree: true },
        { title: '안전관리론', duration: '30:00', isFree: true },
        { title: '인간공학', duration: '25:00' },
        { title: '기계 위험방지', duration: '35:00' },
        { title: '전기 위험방지', duration: '28:00' },
      ],
      // 정보보안기사
      [
        { title: 'OT - 정보보안 개요', duration: '08:00', isFree: true },
        { title: '시스템 보안', duration: '35:00', isFree: true },
        { title: '네트워크 보안', duration: '40:00' },
        { title: '애플리케이션 보안', duration: '38:00' },
        { title: '정보보안 관리', duration: '30:00' },
        { title: '암호학', duration: '32:00' },
      ],
    ];

    for (let i = 0; i < courses.length; i++) {
      const chapters = chapterData[i].map((c, idx) => ({
        ...c,
        sortOrder: idx + 1,
        course: courses[i],
      }));
      await this.chapterRepo.save(chapters);
    }

    // 기본 유저 생성
    await this.userRepo.save([
      { name: '홍길동', email: 'user1@example.com', role: 'LEARNER' },
      { name: '김영희', email: 'user2@example.com', role: 'LEARNER' },
    ]);

    console.log('✅ Seed data initialized');
  }
}
