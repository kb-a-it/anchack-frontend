import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/user/stores/useAuthStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../home/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../user/views/AuthView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../user/views/AuthView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/kakao/callback',
    alias: '/oauth/callback/kakao',
    name: 'kakao-callback',
    component: () => import('../user/views/KakaoCallback.vue'),
  },

  {
    path: '/search/step/:step',
    name: 'search-step',
    component: () => import('../condition/views/SearchInputView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search/loading',
    name: 'search-loading',
    component: () => import('../condition/views/SearchInputView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search/results',
    name: 'search-results',
    component: () =>
      import('../recommendation/views/SearchResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search/results/:id',
    name: 'search-detail',
    component: () =>
      import('../recommendation/views/SearchResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search/results/:id/listings',
    name: 'search-listings',
    component: () =>
      import('../recommendation/views/SearchResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search/compare',
    name: 'search-compare',
    component: () =>
      import('../recommendation/views/SearchResultView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/explore',
    name: 'explore',
    component: () => import('../region/views/ExploreView.vue'),
  },
  {
    path: '/explore/:district',
    name: 'explore-district',
    component: () => import('../region/views/ExploreView.vue'),
  },
  {
    path: '/explore/:district/:dong',
    name: 'explore-dong',
    component: () => import('../region/views/ExploreView.vue'),
  },

  {
    path: '/mypage',
    name: 'mypage',
    component: () => import('../mypage/views/MyPageView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../mypage/views/FavoriteNeighborhoodsView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  // 로컬 디자인 작업에서는 라우터 인증 검사 생략
  if (import.meta.env.DEV &&
      import.meta.env.VITE_DESIGN_MODE === 'true') {
    // 검사는 건너뛰되, Preview 로그인(Mock 토큰)으로 들어온 경우 새로고침 후에도 로그인
    // 상태가 유지되도록 사용자 정보만 복구한다(/auth/me는 Mock 응답).
    const authStore = useAuthStore()
    if (localStorage.getItem('accessToken') && !authStore.isLoggedIn) {
      await authStore.loadUser().catch(() => {})
    }
    return true
  }

  const authStore = useAuthStore()

  if (localStorage.getItem('accessToken') && !authStore.isLoggedIn) {
    try {
      await authStore.loadUser()
    } catch {
      // loadUser가 토큰을 제거했으므로 비로그인 상태로 계속 처리한다.
    }
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    alert('이미 로그인한 사용자입니다.')
    return {
      path: '/',
      replace: true,
    }
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    alert('로그인이 필요한 기능입니다.')
    sessionStorage.setItem('loginRedirect', to.fullPath)

    return {
      path: '/login',
      replace: true,
    }
  }

  return true
})

export default router
