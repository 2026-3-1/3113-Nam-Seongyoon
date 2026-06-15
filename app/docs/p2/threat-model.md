# P2 위협 모델 (STRIDE)

## 자산

1. 사용자 인증 정보 (이메일, 비밀번호 해시)
2. JWT 토큰 (Access + Refresh)
3. 강의 콘텐츠
4. 결제/주문 데이터

## STRIDE 분석

### S — Spoofing (위장)
| 위협 | 대응 |
|------|------|
| 타인의 JWT 도용 | 짧은 만료 시간(1h) + Refresh Token Rotation |
| 비밀번호 추측 공격 | bcrypt + Rate Limiting |

### T — Tampering (변조)
| 위협 | 대응 |
|------|------|
| JWT payload 변조 | HS256 서명 + 서버 비밀키 |
| API 요청 변조 | DTO 유효성 검사 (class-validator) |

### R — Repudiation (부인)
| 위협 | 대응 |
|------|------|
| 행위 부인 | 구조화 로그 (userId, timestamp, action) |

### I — Information Disclosure (정보 유출)
| 위협 | 대응 |
|------|------|
| 비밀번호 평문 노출 | bcrypt 해시만 저장 |
| 토큰 XSS 탈취 | Helmet CSP 헤더 |
| 환경변수 노출 | .env → .gitignore, GitHub Secrets |

### D — Denial of Service (서비스 거부)
| 위협 | 대응 |
|------|------|
| API 과부하 | ThrottlerGuard (100/60s) |
| 대용량 페이로드 | body-parser limit 10mb |

### E — Elevation of Privilege (권한 상승)
| 위협 | 대응 |
|------|------|
| STUDENT가 강의 등록 시도 | RolesGuard (TEACHER/ADMIN만 허용) |
| 타인 강의 수정 | 소유자 확인 로직 (course.teacher.id === currentUser.id) |
| ADMIN 역할 자가 부여 | 회원가입 시 ADMIN role 강제 차단 |
