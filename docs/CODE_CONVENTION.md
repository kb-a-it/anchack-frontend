# Frontend 코드 컨벤션

안착 Frontend Repository에 적용하는 규칙입니다.

브랜치·커밋·PR·보안 등 협업 규칙은 조직의 [CONTRIBUTING.md](https://github.com/kb-a-it/.github/blob/main/CONTRIBUTING.md)를 따릅니다.

---

## 1. 스택과 제약

- **사용 기술**: Vue 3.5, Vite 8, JavaScript, Pinia 4, Vue Router 5
- **Node 버전**: `22.18.0` 이상, 또는 `24.12.0` 이상 (`package.json`의 `engines` 참고 — 23.x, 24.0~24.11은 지원 범위 밖입니다)

React 활용은 평가 감점 대상입니다. AI 도구로 코드를 생성하면 React 패턴이나 Vue 2 문법이 섞여 들어오는 경우가 많으니, 다음은 이 프로젝트에서 쓰지 않습니다.

- React·Next.js 문법과 라이브러리
- Options API (`export default { data() {}, methods: {} }`) — Composition API `<script setup>`을 씁니다
- Vuex — 상태 관리는 Pinia를 씁니다
- TypeScript (`lang="ts"`, `.ts` 파일) — 이 프로젝트는 JavaScript로 작성합니다

## 2. 폴더 구조

`src` 하위는 **기능 기준**으로 나누고, 각 기능 안에서 유형을 구분합니다. — Backend와 같은 기준이라 담당 기능의 코드를 양쪽에서 같은 방식으로 찾을 수 있습니다.

```text
src                              recommendation
├── assets                       ├── api
├── common                       ├── components
│   ├── api                      ├── stores
│   ├── components               └── views
│   └── utils
├── router
├── user
├── condition
├── recommendation
├── region
├── route
└── review
```

- 특정 기능에서만 쓰는 컴포넌트는 해당 기능 폴더에 둡니다.
- `common`에는 **실제로 두 개 이상의 기능이 함께 쓰는 코드만** 둡니다. 재사용할 것 같다는 예상만으로 옮기지 않습니다.
- import는 상대 경로 대신 `@/` 별칭을 씁니다. (`@/recommendation/api/recommendationApi`)

> 현재 `src/views/HomeView.vue` 구조이므로, 기능 기준으로 옮길 때 라우터의 import 경로를 함께 수정합니다.

## 3. 컴포넌트 규칙

- 컴포넌트는 `<script setup>`으로 작성하고, 블록 순서는 `<script setup>` → `<template>` → `<style scoped>`로 통일합니다.
- `<style>`에는 항상 `scoped`를 붙입니다. — 전역 스타일이 다른 기능 화면을 깨뜨리지 않도록 하기 위함입니다.
- props는 `defineProps`, 이벤트는 `defineEmits`로 선언합니다. props를 직접 수정하지 않고 이벤트로 상위에 알립니다.
- 반응형 상태는 `ref`를 기본으로 쓰고, 여러 값을 하나로 묶어야 할 때만 `reactive`를 씁니다.
- 파생 값은 `computed`로 만듭니다. `watch`로 값을 다시 대입하지 않습니다. — 갱신 시점이 흩어져 추적이 어려워집니다.
- 페이지 컴포넌트(`~View.vue`)는 데이터를 불러와 하위 컴포넌트에 내려주고, 표시 로직은 하위 컴포넌트가 담당합니다.

## 4. 이름

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase, 두 단어 이상 | `RecommendationCard.vue` |
| 페이지 컴포넌트 | `~View.vue` | `RecommendationView.vue` |
| 일반 모듈·유틸 | camelCase | `formatCurrency.js` |
| Pinia store | `use~Store` | `useRecommendationStore` |
| 상수 | UPPER_SNAKE_CASE | `MAX_COMPARE_COUNT` |
| CSS 클래스 | kebab-case | `recommendation-card` |

- 컴포넌트 이름은 한 단어로 짓지 않습니다. — HTML 기본 요소와 충돌합니다. (`Card.vue` 지양)
- 널리 쓰이는 약어가 아니면 줄이지 않습니다. (`req`, `cnt`, `rec` 지양)
- Boolean은 `is`·`has`·`can`으로 시작합니다. (`isLoading`, `hasNextPage`, `canSubmit`)
- 이벤트 이름은 일어난 일을 그대로 씁니다. (`@click` 재전달 대신 `@condition-submit`)

## 5. 상태 관리 (Pinia)

- store는 `defineStore('이름', () => { ... })` 형태의 setup 문법으로 작성합니다. — 컴포넌트와 같은 문법이라 옮겨 쓰기 쉽습니다.
- store에는 **여러 화면이 공유하는 상태**만 둡니다. 한 컴포넌트에서만 쓰는 상태는 `ref`로 컴포넌트 안에 둡니다.
- 서버에서 받아온 데이터와 그 로딩·에러 상태는 store에서 관리하고, 입력 중인 폼 값처럼 화면 안에서 끝나는 상태는 컴포넌트에 둡니다.
- state를 컴포넌트에서 직접 대입하지 않고 store의 action을 통해 변경합니다.
- store를 구조 분해하면 반응성이 끊기므로 `storeToRefs`를 씁니다.

## 6. API 통신

- axios 인스턴스는 `common/api/client.js` 한 곳에서 만들고, `baseURL`은 `import.meta.env.VITE_API_BASE_URL`을 씁니다. URL을 컴포넌트에 하드코딩하지 않습니다.
- 컴포넌트에서 axios를 직접 import하지 않습니다. 요청은 기능별 `api` 모듈(`recommendation/api/recommendationApi.js`)을 거칩니다. — API 명세가 바뀔 때 고칠 곳이 한곳으로 모입니다.
- Query Parameter는 camelCase로 보냅니다. (`?adminDongId=10`) — Backend가 하이픈 파라미터를 바인딩하지 못합니다.

**Backend 응답은 `ApiResponse<T>`로 감싸져 옵니다.** 응답 인터셉터에서 껍데기를 벗기고, 컴포넌트는 `data`만 받습니다.

```json
{ "success": true,  "data": { "reviewId": 1 }, "error": null }
{ "success": false, "data": null, "error": { "code": "REVIEW_NOT_FOUND", "message": "리뷰를 찾을 수 없습니다." } }
```

- `success`가 `false`면 인터셉터에서 에러로 변환해 던지고, 호출부는 `try-catch`로 처리합니다.
- 화면 분기는 `error.code`로 합니다. `error.message`를 문자열 비교하지 않습니다. — 문구가 바뀌면 조용히 깨집니다.
- 사용자에게 보여줄 문구는 `error.message`를 그대로 씁니다. 프론트에서 문구를 다시 만들지 않습니다.
- 목록 응답의 페이징 정보(`page`, `size`, `totalElements`)는 `data` 안에 들어 있습니다.

## 7. 라우팅

- 라우트 컴포넌트는 `() => import('@/...')`로 지연 로딩합니다.
- 모든 라우트에 `name`을 지정하고, 이동할 때 경로 문자열 대신 `name`을 씁니다. (`router.push({ name: 'recommendation' })`) — 경로가 바뀌어도 호출부를 고치지 않습니다.
- URL은 소문자와 하이픈으로 씁니다. (`/admin-dongs/:adminDongId`)

## 8. 에러 처리·보안

- `VITE_` 접두사가 붙은 환경변수는 **빌드 결과물에 그대로 포함됩니다.** API Key·토큰처럼 노출되면 안 되는 값을 여기에 넣지 않습니다.
- `.env`는 커밋하지 않고 `.env.example`만 공유합니다.
- 공통 에러 처리는 axios 인터셉터에 두고, 컴포넌트마다 같은 `try-catch`를 반복하지 않습니다.
- `catch`를 비워두지 않습니다. 사용자에게 알리거나 상위로 전달합니다.
- 디버깅용 `console.log`는 커밋하지 않습니다.
- 화면에서 버튼을 숨기는 것은 권한 처리가 아닙니다. 권한 검증은 Backend가 하고, 프론트는 화면 표시만 담당합니다.

## 9. 함수·컴포넌트 설계

- 함수는 한 가지 일만 담당합니다. 이름에 "그리고"가 필요하다면 분리 신호입니다.
- 컴포넌트가 길어지면 화면 단위로 쪼갭니다. 하나의 `.vue` 파일이 여러 화면 영역을 동시에 담당하지 않도록 합니다.
- 템플릿에 복잡한 식을 넣지 않고 `computed`나 함수로 빼서 이름을 붙입니다.
- 여러 기능에서 반복되는 포맷팅(금액, 통근시간, 날짜)은 `common/utils`로 옮깁니다.

## 10. 테스트와 코드 스타일

전체 테스트는 강제하지 않습니다. **입력과 출력이 명확한 로직**에는 단위 테스트를 작성합니다. — 조건 입력 검증, 금액·통근시간 포맷팅, store의 상태 변경, API 응답 변환.

- 테스트는 Vitest와 `@vue/test-utils`로 작성합니다.
- 한 테스트는 하나의 케이스만 검증하고, 조건이 다르면 테스트를 나눕니다.
- **성공 케이스와 실패 케이스를 함께 작성합니다.** 실패 케이스는 잘못된 입력, 경계값, 응답이 실패한 경우를 확인합니다.
- 테스트 이름은 한글로 작성하고 조건과 예상 결과가 드러나게 씁니다.

```javascript
describe('formatDeposit', () => {
  it('보증금을 억·만원 단위로 표시한다', () => {
    expect(formatDeposit(150_000_000)).toBe('1억 5,000만원')
  })

  it('보증금이 없으면 월세만 표시한다', () => {
    expect(formatDeposit(0)).toBe('없음')
  })
})
```

**코드 스타일은 oxlint·ESLint·Prettier 설정을 따릅니다.** 세미콜론·따옴표·들여쓰기·줄 길이는 도구가 처리하므로 문서에서 따로 정하지 않습니다.

- `npm run lint`는 `oxlint`(빠른 1차 검사)와 `eslint`(Vue 규칙 검사)를 순서대로 실행합니다. 커밋 전 `npm run lint`와 `npm run format`을 실행합니다.
- 그 밖의 작성 기준은 [Vue.js 스타일 가이드](https://ko.vuejs.org/style-guide/)를 따릅니다.

## 11. 보류 중인 결정

- **스타일링 방식 미정.** Tailwind CSS 도입을 검토 중이며, 결정 전까지는 SFC의 `<style scoped>`에 일반 CSS로 작성합니다.
- **지도 라이브러리 미정.** 결정 후 지도 컴포넌트를 어느 폴더에 두고 API Key를 어떻게 관리할지 8장에 추가합니다.
- **인증·인가 방식 미정.** Backend 결정에 맞춰 토큰 저장 위치, axios 인터셉터의 인증 헤더 처리, 라우터 가드를 6·7장에 추가합니다.
- **선행 작업.** `axios` 설치, `vitest`·`jsdom`·`@vue/test-utils` 설치(`test:unit:run` 스크립트는 있으나 패키지가 없어 실행되지 않습니다), README를 Vite 기본 템플릿에서 프로젝트 내용으로 교체.

## 12. PR 전 확인사항

공통 항목은 [CONTRIBUTING.md](https://github.com/kb-a-it/.github/blob/main/CONTRIBUTING.md) 5장을 확인하고, 여기서는 Vue 항목만 봅니다.

- [ ] `npm run lint`와 `npm run format`을 실행했습니다.
- [ ] `<script setup>`으로 작성했고 Options API를 쓰지 않았습니다.
- [ ] 컴포넌트에서 axios를 직접 호출하지 않고 기능별 `api` 모듈을 거쳤습니다.
- [ ] URL과 API Key를 하드코딩하지 않았습니다.
- [ ] `<style>`에 `scoped`를 붙였습니다.
- [ ] 한 화면에서만 쓰는 상태를 store에 넣지 않았습니다.
- [ ] `error.message` 문자열이 아니라 `error.code`로 분기했습니다.
- [ ] `console.log`와 사용하지 않는 코드를 제거했습니다.
- [ ] 핵심 로직의 단위 테스트를 작성했습니다.

## 13. 결정 기록

논의 과정에서 대안을 검토하고 확정한 것만 기록합니다. 미정인 항목은 11장에 둡니다.

| 날짜 | 결정 | 검토한 대안 | 이유 |
|---|---|---|---|
| | 기능 기준 폴더 구조 | 유형 기준(components/views/stores) | Backend와 같은 기준으로 담당 기능 코드 탐색 |
| | HTTP 클라이언트는 axios | 네이티브 fetch 래퍼 | 인터셉터로 `ApiResponse` 처리 일원화 |

> 날짜는 실제 논의·병합 시점으로 채워주세요. 규칙의 추가·변경·삭제 기준은 [CONTRIBUTING.md](https://github.com/kb-a-it/.github/blob/main/CONTRIBUTING.md)의 컨벤션 관리 규칙을 따릅니다.
