# Definition of Done (DoD)

CertificatEdu 프로젝트에서 하나의 기능/이슈를 "완료"로 간주하기 위한 공통 기준입니다.

---

## 코드 품질

- [ ] 모든 PR은 최소 1명의 리뷰어 승인을 받는다
- [ ] 린트 오류가 없다 (`npm run lint` 통과)
- [ ] 타입스크립트 컴파일 오류가 없다 (`npm run build` 통과)
- [ ] 불필요한 `console.log`, 주석 아웃된 코드가 없다

## 테스트

- [ ] 새 로직에 대한 유닛 또는 통합 테스트가 최소 1개 작성되었다
- [ ] 기존 테스트가 모두 통과한다 (`npm test` 통과)
- [ ] 인증/권한 관련 변경은 e2e 시나리오가 포함된다

## API / 백엔드

- [ ] 새 엔드포인트는 Swagger `@ApiTags`, `@ApiOperation` 데코레이터가 붙어있다
- [ ] 입력값 유효성 검증(`class-validator`)이 적용되어 있다
- [ ] 에러 응답이 `docs/p1/error-codes.md` 규격을 따른다
- [ ] DB 스키마 변경 시 마이그레이션 파일이 포함된다 (`npm run migration:generate`)

## 프론트엔드

- [ ] 반응형 레이아웃이 모바일(≥375px) 및 데스크톱(≥1024px)에서 깨지지 않는다
- [ ] 로딩 상태와 에러 상태 UI가 처리되어 있다
- [ ] 보호 라우트가 필요한 페이지는 `RequireAuth` / `RequireRole`을 사용한다

## 보안

- [ ] 민감 정보(비밀번호, 토큰, API 키)가 코드에 하드코딩되지 않는다
- [ ] SQL/XSS 취약점이 새로 발생하지 않는다 (TypeORM 파라미터 바인딩 사용)
- [ ] 새 API에 적절한 인증 Guard가 적용된다

## CI/CD

- [ ] PR을 열면 GitHub Actions CI가 자동 실행된다
- [ ] CI가 통과해야 merge할 수 있다 (build / test / lint)
- [ ] main 브랜치 merge 후 CD가 자동으로 EC2에 배포된다

## 문서

- [ ] 복잡한 기술 결정은 `docs/adr/`에 ADR이 작성된다
- [ ] API 변경이 있으면 `docs/p2/openapi.yaml`이 업데이트된다
- [ ] README의 실행 방법이 여전히 유효하다

---

> 위 항목 중 하나라도 충족하지 못하면 "완료"가 아닙니다.  
> 예외가 필요한 경우 PR description에 이유를 명시해야 합니다.
