import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    /*
     * [수정] 이 TODO가 비어있던 탓에 accessToken이 만료/무효화되어 401이 와도
     * localStorage의 토큰이 그대로 남아있었다. 그 결과:
     *  - 다음 요청도 계속 같은 만료 토큰을 실어 보내 계속 401만 반복되고
     *  - 헤더(TheHeader.vue)는 useAuthStore().isLoggedIn만 보고 "로그인됨" 상태를
     *    계속 표시해, 사용자 입장에서는 "로그인되어 있는데 리뷰 작성이 안 된다"처럼 보였다.
     *
     * 여기서 만료된 토큰을 정리하고, pinia auth 스토어도 즉시 로그아웃 상태로
     * 동기화한다. 실제 재로그인 이동은 각 화면(ReviewWriteModal 등)에서
     * 401 응답 메시지를 보고 안내한다.
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
