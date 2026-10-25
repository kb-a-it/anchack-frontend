import { isDesignPreview } from "@/common/dev/designPreview";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_OAUTH_STATE_KEY = "kakaoOAuthState";

function createOAuthState() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));

  return Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * 검증된 환경설정과 일회용 state로 카카오 인가 URL을 생성한다.
 */
export function getKakaoAuthorizeUrl(state) {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error(
      "VITE_KAKAO_CLIENT_ID와 VITE_KAKAO_REDIRECT_URI를 설정해 주세요.",
    );
  }

  if (!state) {
    throw new Error("카카오 OAuth state를 생성할 수 없습니다.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    prompt: "login",
    state,
  });

  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * 카카오 OAuth 요청을 시작하고 콜백 검증에 사용할 state를 보관한다.
 */
export function startKakaoOAuth() {
  try {
    const state = createOAuthState();
    // [디자인 캡처 전용] Design Preview 모드에서는 카카오로 이동하지 않고 기존 콜백 화면으로
    // 바로 보내 Mock 사용자로 로그인한다(콜백의 state 검증·저장 흐름은 그대로 탄다).
    const authorizeUrl = isDesignPreview
      ? `/auth/kakao/callback?code=design-preview&state=${state}`
      : getKakaoAuthorizeUrl(state);

    sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);
    window.location.assign(authorizeUrl);
  } catch (error) {
    console.error("카카오 OAuth 설정 오류:", error);
    window.alert(error.message);
  }
}

/**
 * 콜백의 state를 저장된 값과 한 번만 비교하고 저장값을 제거한다.
 */
export function consumeKakaoOAuthState(callbackState) {
  const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);

  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);

  return (
    typeof callbackState === "string" &&
    Boolean(storedState) &&
    callbackState === storedState
  );
}
