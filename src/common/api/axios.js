import axios from "axios";
import { installDesignPreviewAdapter } from "../dev/designPreview";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// [디자인 캡처 전용] Design Preview(로컬 개발 서버·Vercel Preview + VITE_DESIGN_MODE=true)에서만
// Mock 응답으로 대체한다(common/dev/designPreview.js 참고). 그 외 빌드에서는 아무 동작도 하지 않는다.
installDesignPreviewAdapter(api);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    /*
     * 401이어도 localStorage 토큰이 안 지워져 만료 토큰으로 계속 요청을
     * 보내던 문제. 여기서 토큰을 정리하고 auth 스토어도 로그아웃 상태로
     * 동기화한다. 재로그인 안내는 각 화면에서 처리한다.
     */
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");

      import("../../user/stores/useAuthStore")
        .then(({ useAuthStore }) => {
          useAuthStore().clearUser();
        })
        .catch(() => {
          // 스토어를 불러오지 못해도 토큰 정리는 이미 끝난 상태이므로 무시한다.
        });
    }

    return Promise.reject(error);
  },
);

export default api;

/*
 * 백엔드 에러 응답 형태 2가지:
 * 1) 일반 에러: { success:false, data:null, error:{ code, message } }
 * 2) 인증 필터가 직접 내려주는 401: { message: "..." }
 *
 * data?.message만 읽으면 1번 형식(400/403/404 등)에서 항상 undefined가
 * 되어 실제 에러 사유 대신 일반 안내 문구만 보이던 문제. 두 형태를 모두 확인한다.
 */
export function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    fallback
  );
}
