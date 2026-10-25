/*
 * [디자인 캡처 전용] Figma 이관용 화면 프리뷰(Design Preview) 모드.
 *
 * VITE_DESIGN_MODE=true 이면서 아래 환경 중 하나일 때만 켜진다(자세한 내용은 README).
 *   - 로컬 개발 서버(`npm run dev`, import.meta.env.DEV)
 *   - Vercel Preview 배포(빌드 시 VERCEL_ENV=preview)
 * Vercel Production 배포나 Vercel 밖에서 만든 프로덕션 빌드는 VITE_DESIGN_MODE=true로
 * 잘못 설정돼도 꺼진다. VITE_VERCEL_ENV는 vite.config.js가 빌드 시점의 VERCEL_ENV로
 * 고정해 넣는 값이라 .env 파일이나 대시보드 변수로 덮어쓸 수 없다. 꺼지는 빌드에서는
 * 조건이 false 상수가 되어 Mock 모듈(dynamic import 포함)이 번들에서 제거된다.
 * - 켜져 있으면 installDesignPreviewAdapter()를 적용한 axios 인스턴스(공용 api, 인증 api)가
 *   designPreviewMocks.js의 목 응답을 받는다. 목에 없는 GET은 실제 서버로 가고,
 *   목에 없는 쓰기 요청은 실제 서버로 보내지 않고 차단한다.
 */
import axios, { AxiosError } from "axios";

const isDesignModeRequested = import.meta.env.VITE_DESIGN_MODE === "true";
const isDesignModeAllowedEnv = import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === "preview";

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

  const networkAdapter = axios.getAdapter(instance.defaults.adapter);
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

    // 목에 없는 쓰기 요청은 실제 서버로 보내지 않는다(로그인·저장·리뷰 등 데이터 변경 방지).
    if ((config.method || "get").toLowerCase() !== "get") {
      console.warn(`[design-preview] blocked ${label}`);
      const response = {
        data: { success: false, data: null, error: { message: "Design Preview 모드에서는 서버로 보내지 않는 요청이에요." } },
        status: 503, statusText: "", headers: {}, config, request: {},
      };
      throw new AxiosError(`[design-preview] blocked ${label}`, AxiosError.ERR_BAD_RESPONSE, config, null, response);
    }
    return networkAdapter(config);
  };
}
