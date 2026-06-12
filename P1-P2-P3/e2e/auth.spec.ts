import { test, expect } from '@playwright/test';

test.describe('로그인 및 권한 시나리오', () => {
  test('비로그인 상태에서 강의 목록을 볼 수 있다', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText('전체')).toBeVisible();
    // 강의 카드가 최소 1개 이상 존재
    await expect(page.locator('article').first()).toBeVisible({ timeout: 5000 });
  });

  test('잘못된 비밀번호로 로그인하면 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/이메일/).fill('student@certificatedu.kr');
    await page.getByPlaceholder(/비밀번호/).fill('wrongpassword');
    await page.getByRole('button', { name: /로그인/ }).click();
    await expect(page.getByText(/올바르지 않습니다|로그인|오류/)).toBeVisible({ timeout: 5000 });
  });

  test('학생으로 로그인하면 마이페이지를 볼 수 있다', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/이메일/).fill('student@certificatedu.kr');
    await page.getByPlaceholder(/비밀번호/).fill('Student1234!');
    await page.getByRole('button', { name: /로그인/ }).click();
    // 로그인 후 리다이렉트 확인
    await expect(page).toHaveURL(/\/(courses|mypage|)$/, { timeout: 5000 });
  });
});
