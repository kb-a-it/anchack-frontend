import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../home/views/HomeView.vue") },
  { path: "/login", name: "login", component: () => import("../user/views/AuthView.vue") },
  { path: "/signup", name: "signup", component: () => import("../user/views/AuthView.vue") },
  { path: "/oauth/callback/kakao", name: "kakao-callback", component: () => import("../user/views/KakaoCallback.vue") },

  { path: "/search/step/:step", name: "search-step", component: () => import("../condition/views/SearchInputView.vue") },
  { path: "/search/loading", name: "search-loading", component: () => import("../condition/views/SearchInputView.vue") },
  { path: "/search/results", name: "search-results", component: () => import("../recommendation/views/SearchResultView.vue") },
  { path: "/search/results/:id", name: "search-detail", component: () => import("../recommendation/views/SearchResultView.vue") },
  { path: "/search/results/:id/listings", name: "search-listings", component: () => import("../recommendation/views/SearchResultView.vue") },
  { path: "/search/compare", name: "search-compare", component: () => import("../recommendation/views/SearchResultView.vue") },

  { path: "/explore", name: "explore", component: () => import("../region/views/ExploreView.vue") },
  { path: "/explore/:district", name: "explore-district", component: () => import("../region/views/ExploreView.vue") },
  { path: "/explore/:district/:dong", name: "explore-dong", component: () => import("../region/views/ExploreView.vue") },

  { path: "/mypage", name: "mypage", component: () => import("../mypage/views/MyPageView.vue") },
  { path: "/mypage/favorites", name: "mypage-favorites", component: () => import("../mypage/views/MyPageView.vue") },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const accessToken = localStorage.getItem("accessToken");

  const guestOnlyPages = [
    "/login",
    "/signup",
  ];

  if (
    accessToken &&
    guestOnlyPages.includes(to.path)
  ) {
    alert("이미 로그인한 사용자입니다.");

    return {
      path: "/",
      replace: true,
    };
  }

  return true;
});

export default router
