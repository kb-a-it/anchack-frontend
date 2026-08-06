import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API BASE URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },

  // 백엔드에서 세션도 함께 사용하지 않는다면 생략 가능
  withCredentials: true,
});

// JWT 없이 호출할 수 있는 API
const publicPaths = [
  "/api/auth/kakao/callback",
];

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const tokenType =
      localStorage.getItem("tokenType") || "Bearer";

    const isPublicRequest = publicPaths.some(
      (path) => config.url === path,
    );

    console.log("요청 URL:", config.url);
    console.log("공개 요청 여부:", isPublicRequest);
    console.log(
      "전송할 JWT 존재 여부:",
      Boolean(accessToken && !isPublicRequest),
    );

    if (accessToken && !isPublicRequest) {
      config.headers.Authorization =
        `${tokenType} ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    // 로그인 요청 자체의 401은 토큰 만료 처리에서 제외
    const isLoginRequest =
      requestUrl === "/api/auth/kakao/callback";

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");
    }

    return Promise.reject(error);
  },
);

// 카카오 인가 코드를 백엔드로 전달
export function loginWithKakao(code) {
  return api.post("/api/auth/kakao/callback", {
    code,
  });
}

// 현재 로그인한 사용자 정보 조회
export function fetchMe() {
  return api.get("/api/auth/me");
}

// 로그아웃
export async function logout() {
  try {
    return await api.post("/api/auth/logout");
  } finally {
    // 서버 요청 성공 여부와 관계없이 프론트 JWT 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");
  }
}

// 프로필 수정
export function updateMyProfile(profileData) {
  return api.put("/api/users/me/profile", profileData);
}

export default api;
