<script setup>
import TheHeader from './common/components/TheHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-background" style="font-family: 'Noto Sans KR', sans-serif">
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
/* out-in을 쓰지 않고 겹쳐서 크로스페이드하되, 나가는 페이지는 문서
   흐름에서 빼서(absolute) 들어오는 페이지의 레이아웃을 밀지 않게 한다.
   -> out-in 방식의 "완료 신호를 기다리다 멈추는" 버그를 원천적으로
   피하면서도, 두 페이지가 겹치는 순간 레이아웃이 깨지지 않는다. */
.page-fade-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
