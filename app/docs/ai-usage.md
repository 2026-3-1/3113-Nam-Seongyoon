# AI 활용 기록 (ai-usage.md)

본 프로젝트(P1~P3)는 개발 과정에서 AI 도구를 아래와 같이 활용하였습니다.

## 사용 도구

| 도구 | 용도 |
|------|------|
| Claude Code (Anthropic) | 코드 생성, 디버깅, 문서 초안 작성 |

## 활용 내역

### P1 (기초 구현)
- NestJS 모듈·컨트롤러·서비스 보일러플레이트 초안 생성
- TypeORM 엔티티 설계 초안 작성
- Dockerfile / docker-compose.yml 초안 작성

### P2 (인증·권한)
- JWT Guard, Roles Decorator 코드 초안 생성
- bcrypt 암호화 적용 방법 질의
- OWASP Top 10 체크리스트 정리

### P3 (외부 연동·운영)
- Nodemailer 연동 코드 초안 생성
- @nestjs/schedule cron job 구조 설계
- Sentry 초기화 코드 작성

## AI 사용 원칙

1. AI가 생성한 코드는 반드시 직접 검토 후 적용
2. 보안 민감 코드(인증, 암호화)는 추가 검증 필수
3. 최종 구현 책임은 개발자에게 있음
