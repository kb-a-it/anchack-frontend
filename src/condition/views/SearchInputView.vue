<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchStore } from "../stores/useSearchStore";
import { useRecommendationStore } from "../../recommendation/stores/useRecommendationStore";
import { useNeighborhoodStore } from "../../region/stores/useNeighborhoodStore";
import StepCommute from "../components/StepCommute.vue";
import StepPriority from "../components/StepPriority.vue";
import StepBudget from "../components/StepBudget.vue";
import StepHousing from "../components/StepHousing.vue";
import StepConfirm from "../components/StepConfirm.vue";
import SearchLoading from "../components/SearchLoading.vue";
import SearchFunnel from "../components/SearchFunnel.vue";
import SearchProgressBar from "../components/SearchProgressBar.vue";

const STEP_LABELS = [
  "어디로 이동해야 하나요?",
  "동네를 고를 때 무엇이 중요한가요?",
  "예산은 어느 정도인가요?",
  "어떤 집을 찾고 있나요?",
  "입력한 조건을 확인해주세요",
];

const route = useRoute();
const router = useRouter();
const search = useSearchStore();
const recommendation = useRecommendationStore();
const nbhd = useNeighborhoodStore();

const step = computed(() => Number(route.params.step) || 1);
const isLoading = computed(() => route.path === "/search/loading");
// 응답에 filterFunnel(P3, 아직 백엔드 미구현)이 있으면 결과로 바로 넘어가지 않고
// 단계별 실제 개수를 보여주는 화면을 한 번 거친다. 필드가 없으면(기존 응답) 곧바로
// 결과로 이동해서 이 화면을 추가하기 전과 동작이 같다.
const showFunnel = ref(false);

function update(patch) {
  search.update(patch);
}
function goStep(n) {
  router.push(`/search/step/${n}`);
}
function submit() {
  router.push("/search/loading");
}
// 마이페이지에서 "다시 결과보기"(latest=false인 저장 조건 재계산)는
// /search/loading?recomputeConditionId=1 형태로 여기 들어온다 - 새 조건으로 검색을
// 다시 돌리는 게 아니라 그 conditionId로 재계산을 요청한다. OpenAI 이유 생성을 다시
// 거칠 수 있어(submit()과 동일하게) "찾고 있어요" 온보딩 로딩 화면을 그대로 거친다.

function startSearch() {
  nbhd.resetCompare();
  showFunnel.value = false;

  // 디자인 캡처 모드(npm run dev + VITE_DESIGN_MODE=true)에서는 아래 submit/recompute가
  // 실제 서버·AI를 호출하지 않고 common/dev/designPreviewMocks.js의 목 응답을 받는다
  // (common/api/axios.js의 프리뷰 어댑터). 그래서 로딩 연출 → 결과 이동 흐름은 그대로 유지된다.
  const recomputeConditionId = route.query.recomputeConditionId;
  if (recomputeConditionId) {
    recommendation.recompute(Number(recomputeConditionId));
  } else {
    recommendation.submit(search.appState);
  }
}

watch(isLoading, (loading) => {
  if (loading) startSearch();
}, { immediate: true });

function onLoadingDone() {
  if (recommendation.filterFunnel?.length) {
    showFunnel.value = true;
  } else {
    router.push("/search/results");
  }
}
function onFunnelDone() {
  router.push("/search/results");
}
function restartSearch() {
  search.reset();
  recommendation.reset();
  showFunnel.value = false;
  goStep(1);
}
function goBack() {
  if (route.query.recomputeConditionId) {
    router.push("/mypage");
  } else {
    goStep(5);
  }
}
</script>

<template>
  <Transition name="screen-fade" mode="out-in">
    <SearchFunnel
      v-if="isLoading && showFunnel"
      key="funnel"
      :funnel="recommendation.filterFunnel"
      @done="onFunnelDone"
      @restart="restartSearch"
    />

    <SearchLoading
      v-else-if="isLoading"
      key="loading"
      :status="recommendation.status"
      :error-message="recommendation.errorMessage"
      :back-label="route.query.recomputeConditionId ? '마이페이지로' : '이전 단계로'"
      @done="onLoadingDone"
      @retry="startSearch"
      @back="goBack"
    />

    <!-- 프로그레스바(SearchProgressBar)를 여기서 딱 한 번만 렌더링한다.
         스텝마다 컴포넌트를 통째로 바꿔치기해도(v-if/else-if) 이 wrapper와
         프로그레스바 자체는 재마운트되지 않으므로, step 값이 바뀔 때
         CSS transition으로 너비가 순간이동 없이 부드럽게 이어진다. -->
    <div v-else key="wizard" class="min-h-screen bg-background pt-[60px]">
      <div class="max-w-[800px] mx-auto px-8 py-10">
        <div class="mb-8">
          <SearchProgressBar :step="step" :total="5" />
          <div class="flex justify-between mt-2.5">
            <span class="text-sm font-semibold text-primary">{{ step }}/5 {{ STEP_LABELS[step - 1] }}</span>
            <span class="text-sm text-muted-foreground">약 1분이면 완료돼요</span>
          </div>
        </div>

        <StepCommute v-if="step === 1" :state="search.appState" @update="update" @next="goStep(2)" />
        <StepPriority v-else-if="step === 2" :state="search.appState" @update="update" @next="goStep(3)" @prev="goStep(1)" />
        <StepBudget v-else-if="step === 3" :state="search.appState" @update="update" @next="goStep(4)" @prev="goStep(2)" />
        <StepHousing v-else-if="step === 4" :state="search.appState" @update="update" @next="goStep(5)" @prev="goStep(3)" />
        <StepConfirm v-else-if="step === 5" :state="search.appState" @update="update" @submit="submit" @prev="goStep(4)" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.22s ease;
}
.screen-fade-enter-from,
.screen-fade-leave-to {
  opacity: 0;
}
</style>
