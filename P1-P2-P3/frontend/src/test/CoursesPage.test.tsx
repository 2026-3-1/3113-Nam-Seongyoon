import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CoursesPage from '../pages/CoursesPage';
import * as apiModule from '../lib/api';

const mockCourse = {
  id: 1,
  title: 'NestJS 완전 정복',
  category: 'backend',
  description: '설명',
  thumbnail: '',
  price: 49000,
  originalPrice: 79000,
  badge: '베스트셀러',
  duration: '총 32강',
  tag: 'HOT',
  rating: 4.5,
  reviewCount: 120,
  teacher: { id: 2, email: 'teacher@test.com', name: '김강사', role: 'TEACHER' as const },
};

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.spyOn(apiModule.api, 'courses').mockResolvedValue({
      data: [mockCourse],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('강의 목록을 불러와 카드를 렌더링한다', async () => {
    render(
      <MemoryRouter>
        <CoursesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('NestJS 완전 정복')).toBeInTheDocument();
    });

    expect(screen.getByText('김강사 · 총 32강')).toBeInTheDocument();
    expect(screen.getByText('49,000원')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지를 표시한다', async () => {
    vi.spyOn(apiModule.api, 'courses').mockRejectedValue(new Error('네트워크 오류'));

    render(
      <MemoryRouter>
        <CoursesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('강의 목록을 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });
});
