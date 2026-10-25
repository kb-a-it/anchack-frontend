/*
 * [디자인 캡처 전용] Figma 이관용 화면 프리뷰(Design Preview) 모드.
 *
 * VITE_DESIGN_MODE=true 이면서 아래 환경 중 하나일 때만 켜진다(자세한 내용은 README).
 *   - 로컬 개발 서버(`npm run dev`, import.meta.env.DEV)
 *   - Vercel Preview 배포(빌드 시 VERCEL_ENV=preview)
 *   - Vercel Production 배포 중 아래를 모두 만족하는 경우(임시 디자인 검토용 opt-in)
 *       · 빌드 시 VERCEL_ENV=production
 *       · 빌드한 Git 브랜치(VERCEL_GIT_COMMIT_REF)가 DESIGN_PREVIEW_PRODUCTION_BRANCH
 *       · VITE_DESIGN_MODE_ALLOW_PRODUCTION=true 를 별도로 설정
 * 그 외(dev 등 다른 브랜치의 Production, Vercel 밖 프로덕션 빌드)는 VITE_DESIGN_MODE=true로
 * 잘못 설정돼도 꺼진다. VITE_VERCEL_ENV / VITE_VERCEL_GIT_COMMIT_REF는 vite.config.js가
 * 빌드 시점의 Vercel 시스템 변수로 고정해 넣는 값이라 .env 파일이나 대시보드 변수로
 * 덮어쓸 수 없다. 꺼지는 빌드에서는 조건이 false 상수가 되어 Mock 모듈이 번들에서 제거된다.
 * - 켜져 있으면 installDesignPreviewAdapter()를 적용한 axios 인스턴스(공용 api, 인증 api)가
 *   designPreviewMocks.js의 목 응답을 받고, 목에 없는 요청(조회 포함)은 실제 서버로 보내지
 *   않고 차단한다.
 */
import { AxiosError } from "axios";

// Production에서 디자인 모드를 허용하는 유일한 브랜치(임시 디자인 검토용 배포)
const DESIGN_PREVIEW_PRODUCTION_BRANCH = "feat/design-preview";

const isDesignModeRequested = import.meta.env.VITE_DESIGN_MODE === "true";
const isDesignModeAllowedInProduction =
  import.meta.env.VITE_VERCEL_ENV === "production" &&
  import.meta.env.VITE_VERCEL_GIT_COMMIT_REF === DESIGN_PREVIEW_PRODUCTION_BRANCH &&
  import.meta.env.VITE_DESIGN_MODE_ALLOW_PRODUCTION === "true";
const isDesignModeAllowedEnv =
  import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === "preview" || isDesignModeAllowedInProduction;

export const isDesignPreview = isDesignModeRequested && isDesignModeAllowedEnv;

// 목 추천 결과의 conditionId. 실제 DB id와 겹치지 않을 값으로 둔다.
// useRecommendationStore가 프리뷰 모드가 꺼진 상태에서 sessionStorage에 남은
// 목 결과를 버릴 때도 이 값으로 구분한다.
export const DESIGN_PREVIEW_CONDITION_ID = 990001;

// Preview 로그인 시 localStorage에 저장되는 가짜 JWT
export const DESIGN_PREVIEW_TOKEN = "design-preview-token";

/**
 * axios 인스턴스에 Preview 전용 어댑터를 붙인다. Preview가 아니면 아무것도 하지 않는다.
 */
export function installDesignPreviewAdapter(instance) {
  if (!isDesignPreview) return;

  instance.defaults.adapter = async (config) => {
    const { resolveDesignPreviewMock, buildMockResponse } = await import("./designPreviewMocks.js");
    const mock = resolveDesignPreviewMock(config);
    const label = `${config.method?.toUpperCase()} ${config.url}`;

    if (mock?.error) {
      const response = { data: mock.error.data, status: mock.error.status, statusText: "", headers: {}, config, request: {} };
      throw new AxiosError(`[design-preview] ${label} -> ${mock.error.status}`, AxiosError.ERR_BAD_REQUEST, config, null, response);
    }
    if (mock) {
      console.info(`[design-preview] mocked ${label}`);
      return buildMockResponse(config, mock);
    }

    // 목에 없는 요청은 조회·쓰기 모두 실제 서버로 보내지 않는다(백엔드 호출 0건 보장).
    console.warn(`[design-preview] blocked ${label}`);
    const response = {
      data: { success: false, data: null, error: { message: "Design Preview 모드에서는 서버로 보내지 않는 요청이에요." } },
      status: 503, statusText: "", headers: {}, config, request: {},
    };
    throw new AxiosError(`[design-preview] blocked ${label}`, AxiosError.ERR_BAD_RESPONSE, config, null, response);
  };
}
