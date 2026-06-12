import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuth, setAuth, clearAuth } from '../lib/api';

describe('auth 로컬스토리지 유틸', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setAuth 후 getAuth 하면 동일한 값을 반환한다', () => {
    const auth = {
      accessToken: 'access-token-test',
      refreshToken: 'refresh-token-test',
      user: { id: 1, email: 'test@test.com', name: '홍길동', role: 'STUDENT' as const },
    };
    setAuth(auth);
    expect(getAuth()).toEqual(auth);
  });

  it('clearAuth 후 getAuth 하면 null을 반환한다', () => {
    const auth = {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 1, email: 'a@b.com', name: '테스트', role: 'STUDENT' as const },
    };
    setAuth(auth);
    clearAuth();
    expect(getAuth()).toBeNull();
  });

  it('localStorage에 깨진 JSON이 있으면 null을 반환한다', () => {
    localStorage.setItem('certificatedu_auth', 'invalid-json{{{');
    expect(getAuth()).toBeNull();
  });
});
