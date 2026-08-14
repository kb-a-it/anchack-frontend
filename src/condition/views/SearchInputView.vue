<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchStore } from "../stores/useSearchStore";
import StepCommute from "../components/StepCommute.vue";
import StepPriority from "../components/StepPriority.vue";
import StepBudget from "../components/StepBudget.vue";
import StepHousing from "../components/StepHousing.vue";
import StepConfirm from "../components/StepConfirm.vue";
import SearchLoading from "../components/SearchLoading.vue";
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

const step = computed(() => Number(route.params.step) || 1);
const isLoading = computed(() => route.path === "/search/loading");

function update(patch) {
  search.update(patch);
}
function goStep(n) {
  router.push(`/search/step/${n}`);
}
function submit() {
  router.push("/search/loading");
}
function onLoadingDone() {
  router.push("/search/results");
}
</script>

<template>
  <SearchLoading v-if="isLoading" @done="onLoadingDone" />

  <!-- 프로그레스바(SearchProgressBar)를 여기서 딱 한 번만 렌더링한다.
       스텝마다 컴포넌트를 통째로 바꿔치기해도(v-if/else-if) 이 wrapper와
       프로그레스바 자체는 재마운트되지 않으므로, step 값이 바뀔 때
       CSS transition으로 너비가 순간이동 없이 부드럽게 이어진다. -->
  <div v-else class="min-h-screen bg-background pt-[60px]">
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
</template>
