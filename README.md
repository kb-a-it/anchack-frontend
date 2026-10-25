# 안착 (Vue 버전)

원본 Figma Make React 프로젝트(`App.tsx`, 2105줄)를 보내주신 Vue 아키텍처에 맞춰 변환한 결과물입니다.

## 실행 방법

```bash
npm i
npm install @tailwindcss/vite
npm install lucide-vue-next
npm install tw-animate-css
npm run dev
```

## 구조

기존에 정리해드린 아키텍처 그대로입니다 (`components/`, `views/`, `router/`, `stores/`, `composables/`, `utils/`).

## 원본과 달라진 점 (알아두시면 좋은 것들)

1. **라우팅**: 원본은 `page` state 문자열로 화면을 전환했지만, 여기서는 실제 `vue-router` 경로로 바뀌었습니다.
   - `/` 홈, `/login` `/signup`, `/search/step/1~5` `/search/loading` `/search/results` `/search/results/:id` `/search/results/:id/listings` `/search/compare`, `/explore` `/explore/:district` `/explore/:district/:dong`, `/mypage` `/favorites`
2. **상태관리**: 전역 state는 Pinia 스토어 4개로 나눴습니다 (`useAuthStore`, `useSearchStore`, `useNeighborhoodStore`, `useMyPageStore`).
3. **차트**: `recharts`(BarChart, RadarChart)는 React 전용이라 그대로 옮길 수 없어서, 간단한 자체 바 차트(`components/common/MiniBarChart.vue`)와 기존 `ScoreBar.vue`로 대체했습니다. 실제 프로덕션에서는 `vue-chartjs`나 `vue-echarts` 도입을 권장드려요.
4. **FavoritesPage**: 마이페이지 버튼과 GNB의 "관심 동네" 버튼이 둘 다 `MyPageView`를 가리켜 URL만 다르고 화면은 같아 보이던 문제를 고치면서, 관심 동네를 `/favorites`(`FavoriteNeighborhoodsView.vue`) 전용 페이지로 분리했습니다. 마이페이지에서는 "관심 동네" 탭을 제거했습니다.
5. **컴포넌트 UI 라이브러리** (`components/ui/*`, shadcn 45종)는 이전에 별도로 변환해드린 `vue-ui-components.zip`에 있고, 이번 변환본에는 포함되어 있지 않습니다. 실제 앱(`App.tsx`)에서 사용되지 않던 컴포넌트라 이 프로젝트는 자체 스타일의 순수 Tailwind 마크업으로 작성됐습니다.

## 알려진 제약 (1차 변환 기준)

- `Calendar`, `Carousel` 등은 이번 변환 범위에 없습니다 (이전 UI 컴포넌트 변환본 참고).
- 지도(SVG)는 목업 좌표 기반이라 실제 지도 API 연동 시 좌표 로직을 교체해야 합니다.
- `api/` 폴더는 뼈대만 있고 실제 axios 연동은 되어 있지 않습니다 (`utils/mockData.js`의 목데이터로 화면이 동작합니다).

## Design Preview 모드 (Figma 캡처용)

백엔드·로그인 없이 주요 화면을 Mock 데이터로 띄우기 위한 모드입니다. 켜지면 로그인(카카오 버튼 → Mock 사용자), 추천 결과, 관심 동네, 리뷰 API가 Mock으로 대체됩니다. Mock에 없는 요청은 조회(GET)·쓰기(POST/PUT/PATCH/DELETE) 모두 실제 백엔드로 보내지 않고 차단하므로, 디자인 모드에서는 백엔드 API 호출이 발생하지 않습니다(카카오 지도 SDK와 `public/` 정적 파일은 그대로 불러옵니다).

- 구현: `src/common/dev/designPreview.js`(활성화 조건·어댑터), `src/common/dev/designPreviewMocks.js`(Mock 응답)
- 관심 동네·작성한 리뷰는 브라우저 localStorage `anchak-design-preview` 키에만 저장됩니다. 지우면 초기 상태로 돌아갑니다.

### 환경별 활성화 조건

판단은 빌드 시점에 끝나며, 꺼지는 빌드에는 Mock 코드가 포함되지 않습니다.

| 환경 | 판별 기준 | 켜지는 조건 |
|---|---|---|
| 로컬 개발 서버 `npm run dev` | `import.meta.env.DEV` | `VITE_DESIGN_MODE=true` |
| Vercel Preview 배포 | 빌드 시 `VERCEL_ENV=preview` | `VITE_DESIGN_MODE=true` |
| Vercel Production 배포 (`feat/design-preview` 브랜치) | `VERCEL_ENV=production` + `VERCEL_GIT_COMMIT_REF=feat/design-preview` | `VITE_DESIGN_MODE=true` **그리고** `VITE_DESIGN_MODE_ALLOW_PRODUCTION=true` |
| Vercel Production 배포 (`dev` 등 다른 브랜치) | 위 브랜치가 아님 | **항상 꺼짐** |
| Vercel 밖 프로덕션 빌드 (`npm run build`, `vite preview`) | `VERCEL_ENV` 없음 | **항상 꺼짐** |

`VERCEL_ENV`, `VERCEL_GIT_COMMIT_REF`는 `vite.config.js`의 `define`이 빌드 시점 값으로 `import.meta.env.VITE_VERCEL_ENV`, `import.meta.env.VITE_VERCEL_GIT_COMMIT_REF`에 고정합니다. `.env` 파일이나 Vercel 대시보드에서 같은 이름을 직접 넣어도 덮어써지므로 환경이나 브랜치를 속여 켤 수 없습니다. 허용 브랜치는 `designPreview.js`의 `DESIGN_PREVIEW_PRODUCTION_BRANCH` 상수입니다.

### 로컬에서 켜기 / 끄기

```bash
# .env.local (git에 올라가지 않음)
VITE_DESIGN_MODE=true
```

`npm run dev`를 다시 시작하면 적용됩니다. 끄려면 값을 `false`로 바꾸거나 줄을 지우고 개발 서버를 재시작합니다.

### Vercel Preview에서 켜기

1. Vercel 프로젝트 → **Settings → Environment Variables**
2. Key `VITE_DESIGN_MODE`, Value `true`, Environments는 **Preview만** 선택합니다(특정 브랜치만 쓰려면 Preview의 브랜치 지정에 `feat/design-preview`).
3. 같은 화면의 **Enable access to System Environment Variables**가 체크되어 있는지 확인합니다. 꺼져 있으면 `VERCEL_ENV`가 빌드에 전달되지 않아 디자인 모드가 켜지지 않습니다(안전한 쪽으로 꺼짐).
4. 저장 후 다시 배포(Redeploy)합니다. 환경 변수는 빌드 시점에 반영됩니다.

### Vercel Production에서 켜기 (임시 디자인 검토용, `https://anchack-a-it.vercel.app`)

실제 서비스 운영이 아니라 디자이너 검토를 위한 임시 설정입니다. 아래 두 변수를 모두 **Production** 환경에 추가해야만 켜집니다.

| Key | Value | Environments |
|---|---|---|
| `VITE_DESIGN_MODE` | `true` | Production |
| `VITE_DESIGN_MODE_ALLOW_PRODUCTION` | `true` | Production |

1. **Settings → Environment Variables**에 위 두 변수를 Production으로 추가하고, **Enable access to System Environment Variables**가 체크되어 있는지 확인합니다.
2. `feat/design-preview` 브랜치를 Production으로 배포합니다. 방법은 둘 중 하나입니다.
   - **Settings → Environments → Production → Branch Tracking**의 브랜치를 `feat/design-preview`로 바꾼 뒤 그 브랜치에 Redeploy
   - 또는 `feat/design-preview`의 Preview 배포를 **Promote to Production** (Production 환경 변수로 다시 빌드됨)
3. 배포 후 `https://anchack-a-it.vercel.app`에서 콘솔의 `[design-preview] mocked ...` 로그와 "카카오로 로그인" → Mock 사용자 로그인으로 켜졌는지 확인합니다.

다른 브랜치(`dev` 등)가 Production으로 배포되면 위 변수가 남아 있어도 디자인 모드는 꺼지고 기존 인증·API 동작 그대로 빌드됩니다. 단, 변수는 남겨두지 말고 아래 순서로 정리합니다.

### 원상복구 (Production을 원래 서비스로 되돌리기)

1. **Settings → Environment Variables**에서 Production의 `VITE_DESIGN_MODE_ALLOW_PRODUCTION`을 삭제합니다(`VITE_DESIGN_MODE`도 Production에서 삭제). Preview에서 계속 쓸 예정이면 Preview 쪽 `VITE_DESIGN_MODE`는 남겨도 됩니다.
2. Branch Tracking을 바꿨다면 Production 브랜치를 원래 브랜치(예: `dev`)로 되돌립니다.
3. 원래 브랜치의 최신 커밋을 Production으로 다시 배포(Redeploy)합니다. 이전 Production 배포가 있으면 **Instant Rollback**으로 되돌려도 됩니다.
4. `https://anchack-a-it.vercel.app`에서 로그인 버튼이 실제 카카오 로그인 화면으로 이동하고, 콘솔에 `[design-preview]` 로그가 없는지 확인합니다.
5. 디자이너 브라우저에 남은 Mock 데이터는 실제 서비스에 영향이 없지만, 정리하려면 localStorage의 `anchak-design-preview`, `accessToken`(값 `design-preview-token`) 키를 지웁니다.

### 켜졌는지 확인

- 브라우저 콘솔에 `[design-preview] mocked ...` 로그가 보입니다. Mock에 없는 요청은 `[design-preview] blocked ...`로 표시됩니다.
- 로그인 화면의 "카카오로 로그인"을 누르면 카카오로 이동하지 않고 Mock 사용자("안착디자인")로 로그인됩니다.
