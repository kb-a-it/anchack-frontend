<script setup>
import { onMounted } from "vue";
import TheHeader from "./common/components/TheHeader.vue";
import { useAuthStore } from "./user/stores/useAuthStore";

const auth = useAuthStore();

/*
 * 앱이 처음 실행될 때 저장된 토큰을 확인하고,
 * 사용자 정보를 불러와 로그인 상태를 유지한다.
 */
onMounted(() => {
  auth.loadUser().catch(() => {
    // 토큰이 만료/무효하면 loadUser 내부에서 이미 로그아웃 처리(clearUser)된다.
  });
});
</script>

<template>
  <div class="min-h-screen bg-background" style="font-family: 'Noto Sans KR', sans-serif">
    <TheHeader />
    <router-view />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif;
  background: #f5f5f5;
}
</style>

