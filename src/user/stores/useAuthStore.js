import { computed, ref } from "vue";
import { defineStore } from "pinia";

import {
  fetchMe,
  logout as requestLogout,
  updateMyProfile,
} from "@/user/api/auth";

export const useAuthStore = defineStore("auth", () => {
  // 현재 로그인한 사용자 정보
  const user = ref(null);

  // 사용자 정보가 있으면 로그인 상태
  const isLoggedIn = computed(() => {
    return user.value !== null;
  });

  // 카카오 로그인 성공 후 사용자 저장
  function setUser(loginUser) {
    user.value = loginUser;
  }

  // 새로고침 후 현재 사용자 복구
  async function loadUser() {
    const accessToken =
      localStorage.getItem("accessToken");

    if (!accessToken) {
      user.value = null;
      return;
    }

    try {
      const response = await fetchMe();

      user.value =
        response.data.user ?? response.data;
    } catch (error) {
      clearUser();
      throw error;
    }
  }

  // 로그아웃
  async function logout() {
    try {
      await requestLogout();
    } finally {
      clearUser();
    }
  }

  // 사용자와 토큰 제거
  function clearUser() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenType");

    user.value = null;
  }

  // 프로필 수정
  async function updateProfile(profileData) {
    const response = await updateMyProfile(profileData);

    user.value = response.data;

    return response.data;
  }

  return {
    user,
    isLoggedIn,
    setUser,
    loadUser,
    logout,
    clearUser,
    updateProfile,
  };
});
