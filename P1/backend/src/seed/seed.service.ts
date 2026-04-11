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
    const courseCount = await this.courseRepo.count();
    if (courseCount >= 18) return; // 이미 시드됨

    // 카테고리 upsert
    const existing = await this.categoryRepo.find();
    let categories = existing;
    if (existing.length === 0) {
      categories = await this.categoryRepo.save([
        { label: 'IT/개발', icon: '💻' },
        { label: '경영/회계', icon: '📊' },
        { label: '언어', icon: '🗣' },
        { label: '전기/전자', icon: '⚡' },
        { label: '안전/환경', icon: '🛡' },
      ]);
    }

    const it       = categories.find(c => c.label === 'IT/개발');
    const business = categories.find(c => c.label === '경영/회계');
    const language = categories.find(c => c.label === '언어');
    const electric = categories.find(c => c.label === '전기/전자');
    const safety   = categories.find(c => c.label === '안전/환경');

    // 강좌 전체 재생성 (FK 체크 비활성화 후 삭제)
    await this.chapterRepo.query('PRAGMA foreign_keys = OFF');
    await this.chapterRepo.query('DELETE FROM chapters');
    await this.courseRepo.query('DELETE FROM courses');
    await this.chapterRepo.query('PRAGMA foreign_keys = ON');

    const courses = await this.courseRepo.save([
      // ── IT/개발 ──────────────────────────────────────────
      {
        title: '정보처리기사 완전정복',
        instructorName: '김태호',
        price: 89000, originalPrice: 130000,
        tag: 'BEST', thumbnail: '💻', badge: '인증강사', duration: '총 48강',
        rating: 4.9, reviewCount: 1240, category: it,
        description: '필기부터 실기까지 한 번에 준비하는 정보처리기사 완전 정복 강의.',
      },
      {
        title: '정보보안기사 심화과정',
        instructorName: '김태호',
        price: 110000, originalPrice: 160000,
        tag: 'NEW', thumbnail: '🔒', badge: '인증강사', duration: '총 54강',
        rating: 4.8, reviewCount: 562, category: it,
        description: '시스템·네트워크·암호학까지 정보보안기사 심화 이론 및 실전 문제풀이.',
      },
      {
        title: '리눅스마스터 1급 속성반',
        instructorName: '오동현',
        price: 68000, originalPrice: 95000,
        tag: 'HOT', thumbnail: '🐧', badge: '인증강사', duration: '총 40강',
        rating: 4.7, reviewCount: 430, category: it,
        description: '리눅스 서버 관리의 핵심만 골라 단기 합격을 노리는 속성 커리큘럼.',
      },
      {
        title: '네트워크관리사 2급 합격반',
        instructorName: '서재원',
        price: 55000, originalPrice: 80000,
        tag: null, thumbnail: '🌐', badge: '인증강사', duration: '총 32강',
        rating: 4.5, reviewCount: 318, category: it,
        description: '네트워크관리사 2급 필기·실기를 빠르게 통과하기 위한 핵심 강의.',
      },
      {
        title: 'AWS SAA 자격증 취득반',
        instructorName: '박준영',
        price: 120000, originalPrice: 170000,
        tag: 'NEW', thumbnail: '☁️', badge: '인증강사', duration: '총 58강',
        rating: 4.9, reviewCount: 894, category: it,
        description: 'AWS Solutions Architect Associate 시험 대비 실습 중심 강의.',
      },
      // ── 경영/회계 ─────────────────────────────────────────
      {
        title: '전산세무 2급 핵심정리',
        instructorName: '박지수',
        price: 72000, originalPrice: 100000,
        tag: 'HOT', thumbnail: '📊', badge: '인증강사', duration: '총 36강',
        rating: 4.7, reviewCount: 856, category: business,
        description: '전산세무 2급 합격을 위한 핵심 이론 및 기출 문제 총정리.',
      },
      {
        title: '전산회계 1급 실전반',
        instructorName: '박지수',
        price: 58000, originalPrice: 82000,
        tag: null, thumbnail: '🧾', badge: '인증강사', duration: '총 28강',
        rating: 4.6, reviewCount: 617, category: business,
        description: '전산회계 1급 KcLep 프로그램 실습과 기출 완전 분석.',
      },
      {
        title: '재경관리사 단기 합격반',
        instructorName: '임소연',
        price: 85000, originalPrice: 120000,
        tag: 'BEST', thumbnail: '💼', badge: '인증강사', duration: '총 44강',
        rating: 4.8, reviewCount: 1020, category: business,
        description: '재무회계·원가관리·세무회계 3과목을 한 번에 정리하는 통합 강의.',
      },
      {
        title: 'ERP 정보관리사 회계 2급',
        instructorName: '임소연',
        price: 49000, originalPrice: 70000,
        tag: null, thumbnail: '📈', badge: '인증강사', duration: '총 24강',
        rating: 4.4, reviewCount: 211, category: business,
        description: 'ERP 회계 모듈 실무 기반의 정보관리사 2급 자격증 취득 강의.',
      },
      // ── 언어 ─────────────────────────────────────────────
      {
        title: 'TOEIC 900점 달성 전략',
        instructorName: '이수진',
        price: 65000, originalPrice: 90000,
        tag: 'NEW', thumbnail: '🗣', badge: '인증강사', duration: '총 60강',
        rating: 4.8, reviewCount: 2100, category: language,
        description: 'TOEIC 고득점을 위한 전략적 학습법과 최신 기출 유형 완전 분석.',
      },
      {
        title: 'OPIc IH 달성 집중반',
        instructorName: '최유리',
        price: 72000, originalPrice: 100000,
        tag: 'HOT', thumbnail: '🎤', badge: '인증강사', duration: '총 30강',
        rating: 4.7, reviewCount: 780, category: language,
        description: 'OPIc IH 이상 목표! 롤플레이·서베이·돌발 유형 완벽 대비.',
      },
      {
        title: 'JLPT N2 합격 전략',
        instructorName: '정하은',
        price: 60000, originalPrice: 85000,
        tag: null, thumbnail: '🇯🇵', badge: '인증강사', duration: '총 38강',
        rating: 4.6, reviewCount: 493, category: language,
        description: '어휘·문법·독해·청해 4영역을 체계적으로 정복하는 JLPT N2 강의.',
      },
      // ── 전기/전자 ─────────────────────────────────────────
      {
        title: '전기기사 필기 + 실기 통합',
        instructorName: '최민준',
        price: 95000, originalPrice: 140000,
        tag: 'BEST', thumbnail: '⚡', badge: '인증강사', duration: '총 72강',
        rating: 4.9, reviewCount: 1890, category: electric,
        description: '전기기사 필기와 실기를 한 번에 준비하는 최강 통합 커리큘럼.',
      },
      {
        title: '전기산업기사 핵심이론',
        instructorName: '최민준',
        price: 75000, originalPrice: 105000,
        tag: null, thumbnail: '🔌', badge: '인증강사', duration: '총 52강',
        rating: 4.7, reviewCount: 634, category: electric,
        description: '전기산업기사 4과목 핵심이론 정리와 단원별 기출 문제 집중 공략.',
      },
      {
        title: '전기공사기사 실기 완성',
        instructorName: '윤성호',
        price: 88000, originalPrice: 125000,
        tag: 'HOT', thumbnail: '🔧', badge: '인증강사', duration: '총 46강',
        rating: 4.6, reviewCount: 402, category: electric,
        description: '전기공사기사 실기 시험 합격을 위한 설계·시공 실전 완성 강의.',
      },
      // ── 안전/환경 ─────────────────────────────────────────
      {
        title: '산업안전기사 합격 전략',
        instructorName: '한지우',
        price: 78000, originalPrice: 110000,
        tag: 'HOT', thumbnail: '🛡', badge: '인증강사', duration: '총 42강',
        rating: 4.6, reviewCount: 743, category: safety,
        description: '산업안전기사 최단기 합격을 위한 핵심 이론 정리 및 기출 분석.',
      },
      {
        title: '건설안전기사 필기 완전정복',
        instructorName: '강민서',
        price: 82000, originalPrice: 115000,
        tag: 'NEW', thumbnail: '🏗', badge: '인증강사', duration: '총 48강',
        rating: 4.7, reviewCount: 521, category: safety,
        description: '건설안전기사 필기 5과목을 체계적으로 정리하는 합격 보장 강의.',
      },
      {
        title: '환경기사 기출 완전분석',
        instructorName: '강민서',
        price: 70000, originalPrice: 98000,
        tag: null, thumbnail: '🌿', badge: '인증강사', duration: '총 36강',
        rating: 4.5, reviewCount: 287, category: safety,
        description: '10개년 기출 문제 완전 분석으로 환경기사 합격률을 높이는 강의.',
      },
    ]);

    // 챕터 데이터 (강좌 순서와 동일)
    const chapterData = [
      // 정보처리기사
      [
        { title: 'OT - 시험 안내 및 학습 전략', duration: '08:20', isFree: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: '데이터베이스 기초', duration: '22:15', isFree: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: '운영체제 핵심', duration: '31:40', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: '소프트웨어 공학', duration: '28:55', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: '네트워크 기초', duration: '25:30', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: '알고리즘 & 자료구조', duration: '35:10', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ],
      // 정보보안기사
      [
        { title: 'OT - 정보보안 개요', duration: '08:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '시스템 보안', duration: '35:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '네트워크 보안', duration: '40:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '애플리케이션 보안', duration: '38:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '정보보안 관리', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '암호학', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 리눅스마스터
      [
        { title: 'OT - 리눅스 개요', duration: '07:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '파일시스템 & 권한', duration: '25:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '프로세스 관리', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '네트워크 설정', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '쉘 스크립트', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 네트워크관리사
      [
        { title: 'OT - 시험 구성 안내', duration: '06:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'TCP/IP 기초', duration: '20:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '라우팅 프로토콜', duration: '25:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '스위칭 & VLAN', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '실기 실습', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // AWS SAA
      [
        { title: 'OT - AWS 클라우드 개념', duration: '10:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'EC2 & VPC', duration: '35:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'S3 & 스토리지', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'RDS & DynamoDB', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'IAM & 보안', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '모의고사 풀이', duration: '40:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 전산세무 2급
      [
        { title: 'OT - 전산세무 소개', duration: '06:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '재무회계 기초', duration: '28:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '원가회계', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '부가가치세', duration: '40:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '소득세', duration: '35:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 전산회계 1급
      [
        { title: 'OT - KcLep 설치 및 설정', duration: '05:30', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '일반전표 입력', duration: '20:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '매입매출전표', duration: '25:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '결산 처리', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '기출 문제 풀이', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 재경관리사
      [
        { title: 'OT - 재경관리사 전략', duration: '09:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '재무회계 핵심', duration: '35:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '원가·관리회계', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '세무회계', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '최종 모의고사', duration: '40:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // ERP 정보관리사
      [
        { title: 'OT - ERP 개요', duration: '07:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '회계 모듈 기초', duration: '22:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '매입·매출 관리', duration: '20:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '결산·재무제표', duration: '18:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // TOEIC
      [
        { title: 'OT - TOEIC 고득점 전략', duration: '10:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'Part 1 & 2 공략', duration: '20:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'Part 3 & 4 청해 훈련', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'Part 5 문법 총정리', duration: '25:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: 'Part 6 & 7 독해 전략', duration: '35:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // OPIc
      [
        { title: 'OT - OPIc 등급 체계', duration: '08:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '서베이 전략', duration: '15:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '롤플레이 공략', duration: '20:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '돌발 주제 대비', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '실전 모의 연습', duration: '25:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // JLPT N2
      [
        { title: 'OT - N2 시험 구성', duration: '07:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '필수 어휘 1000', duration: '25:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '핵심 문법 정리', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '독해 전략', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '청해 집중 훈련', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 전기기사
      [
        { title: 'OT - 전기기사 시험 안내', duration: '07:30', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전기이론 기초', duration: '40:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전력공학', duration: '45:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전기기기', duration: '38:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '회로이론', duration: '42:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '실기 문제풀이', duration: '50:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 전기산업기사
      [
        { title: 'OT - 전기산업기사 안내', duration: '07:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전기이론', duration: '35:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전기기기', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전력공학', duration: '38:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '기출 문제 분석', duration: '40:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 전기공사기사
      [
        { title: 'OT - 실기 출제 기준', duration: '08:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '배관 배선 설계', duration: '30:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '수변전 설비', duration: '35:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '동력 설비', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '최종 실기 모의', duration: '38:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 산업안전기사
      [
        { title: 'OT - 산업안전 개요', duration: '09:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '안전관리론', duration: '30:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '인간공학', duration: '25:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '기계 위험방지', duration: '35:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '전기 위험방지', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 건설안전기사
      [
        { title: 'OT - 건설안전 시험 안내', duration: '08:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '산업안전관리론', duration: '28:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '건설공사 안전', duration: '32:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '건설기계·가시설', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '기출 완전 분석', duration: '35:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
      ],
      // 환경기사
      [
        { title: 'OT - 환경기사 출제 경향', duration: '07:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '대기환경', duration: '25:00', isFree: true, videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '수질환경', duration: '28:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '폐기물·소음·진동', duration: '22:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
        { title: '10개년 기출 풀이', duration: '30:00', videoUrl: 'https://www.youtube.com/embed/M4pBG8O5uro' },
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

    // 기본 유저
    const userCount = await this.userRepo.count();
    if (userCount === 0) {
      await this.userRepo.save([
        { name: '홍길동', email: 'user1@example.com', role: 'LEARNER' },
        { name: '김영희', email: 'user2@example.com', role: 'LEARNER' },
      ]);
    }

    console.log('✅ Seed data initialized');
  }
}
