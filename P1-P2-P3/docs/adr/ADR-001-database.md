# ADR-001: 데이터베이스 선택

**날짜**: 2026-03-10  
**상태**: 확정

## 배경

P1 단계에서 로컬 개발 편의를 위해 SQLite를 사용했으나, P1 요구사항에서 MySQL/PostgreSQL을 명시하고 있음.

## 결정

**MySQL 8.0** 채택 (Docker 컨테이너로 실행)

## 근거

| 항목 | SQLite | MySQL | PostgreSQL |
|------|--------|-------|------------|
| 설치 복잡도 | 없음 | Docker 필요 | Docker 필요 |
| 운영 환경 적합성 | 낮음 | 높음 | 높음 |
| TypeORM 지원 | 제한적 | 완전 지원 | 완전 지원 |
| 팀 경험 | 보통 | 높음 | 낮음 |

- MySQL이 팀 내 경험 및 국내 취업 시장에서 더 널리 사용됨
- Docker Compose로 로컬 환경 표준화 가능

## 결과

- 로컬 개발: `DB_TYPE=sqlite` (선택적) 또는 Docker MySQL
- Docker 배포: MySQL 8.0 컨테이너
- CI: `DB_TYPE=sqlite` (테스트용 인메모리 대체)
