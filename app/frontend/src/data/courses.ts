import type { Category, Course, Review } from "../types";

export const CATEGORIES: Category[] = [
  { id: "all", label: "전체", icon: "•" },
  { id: "IT/개발", label: "IT/개발", icon: "⌘" },
  { id: "경영/회계", label: "경영/회계", icon: "₩" },
  { id: "어학", label: "어학", icon: "A" },
  { id: "전기/전자", label: "전기/전자", icon: "⚡" },
  { id: "안전/환경", label: "안전/환경", icon: "✓" },
];

export const COURSES: Course[] = [
  {
    id: 1,
    title: "정보처리기사 필기 완성반",
    category: "IT/개발",
    description: "기출 흐름과 핵심 개념을 함께 잡는 정보처리기사 입문 강의입니다.",
    teacher: { id: 2, name: "김서호", email: "teacher@example.com", role: "TEACHER" },
    rating: 4.9,
    reviewCount: 1240,
    price: 89000,
    originalPrice: 130000,
    tag: "BEST",
    thumbnail: "📘",
    badge: "인증 강사",
    duration: "총 48강",
  },
  {
    id: 2,
    title: "AWS SAA 합격 로드맵",
    category: "IT/개발",
    description: "클라우드 기본기부터 실전 문제 풀이까지 단계적으로 학습합니다.",
    teacher: { id: 3, name: "이서연", email: "aws@example.com", role: "TEACHER" },
    rating: 4.8,
    reviewCount: 876,
    price: 120000,
    originalPrice: 160000,
    tag: "NEW",
    thumbnail: "☁",
    badge: "인증 강사",
    duration: "총 36강",
  },
  {
    id: 3,
    title: "전산회계 1급 단기 합격",
    category: "경영/회계",
    description: "회계가 처음이어도 따라올 수 있도록 분개와 원가 계산을 촘촘히 다룹니다.",
    teacher: { id: 4, name: "박민준", email: "tax@example.com", role: "TEACHER" },
    rating: 4.7,
    reviewCount: 532,
    price: 150000,
    originalPrice: 200000,
    tag: "HOT",
    thumbnail: "₩",
    badge: "인증 강사",
    duration: "총 72강",
  },
];

export const REVIEWS: Review[] = [
  {
    id: 1,
    rating: 5,
    createdAt: "2026-02-14T00:00:00.000Z",
    content: "커리큘럼이 체계적이라 처음 공부하는 과목도 끝까지 따라갈 수 있었습니다.",
    user: { id: 10, name: "김민지", email: "student1@example.com", role: "STUDENT" },
  },
  {
    id: 2,
    rating: 5,
    createdAt: "2026-02-01T00:00:00.000Z",
    content: "설명이 명확하고 실전 문제 풀이가 많아서 시험 직전에 도움이 됐어요.",
    user: { id: 11, name: "오지훈", email: "student2@example.com", role: "STUDENT" },
  },
];
