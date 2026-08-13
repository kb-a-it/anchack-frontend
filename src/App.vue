<script setup>
import { onMounted } from 'vue'
import TheHeader from './common/components/TheHeader.vue'
import { useAuthStore } from './user/stores/useAuthStore'

const auth = useAuthStore()

/*
 * 앱이 처음 실행될 때 저장된 토큰을 확인하고
 * 사용자 정보를 불러와 로그인 상태를 유지한다.
 */
onMounted(() => {
  auth.loadUser().catch(() => {
    // 토큰이 만료되거나 유효하지 않으면
    // loadUser 내부에서 로그아웃 처리된다.
  })
})
</script>

<template>
  <div
    class="min-h-screen bg-background"
    style="font-family: 'Noto Sans KR', sans-serif"
  >
    <TheHeader />

    <main class="relative">
      <router-view v-slot="{ Component }">
        <transition name="page-fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    'Pretendard',
    'Apple SD Gothic Neo',
    -apple-system,
    sans-serif;
  background: #f5f5f5;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 나가는 페이지를 문서 흐름에서 분리해 레이아웃 밀림을 방지한다. */
.page-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
