<script setup>
import { onMounted } from 'vue'
import TheHeader from './common/components/TheHeader.vue'
import { useAuthStore } from './user/stores/useAuthStore'

const auth = useAuthStore()

// 새로고침 또는 앱 재접속 시 로그인 사용자 정보 복구
onMounted(() => {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return
  }

  auth.loadUser().catch((error) => {
    console.error('로그인 사용자 정보를 불러오지 못했습니다.', error)
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
