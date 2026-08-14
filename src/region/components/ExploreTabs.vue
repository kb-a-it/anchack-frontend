<script setup>
import { ref, computed } from "vue";
import { Dumbbell, Store, Hospital, Trees, Building2, Coffee, Shield, Home } from "lucide-vue-next";
import ScoreBar from "../../common/components/ScoreBar.vue";
import MiniBarChart from "../../common/components/MiniBarChart.vue";
import NeighborhoodMap from "../../recommendation/components/detail/NeighborhoodMap.vue";
import TabReview from "../../review/components/TabReview.vue";
import { REVIEW_CATEGORIES } from "../../review/constants.js";

const props = defineProps({
  district: { type: String, required: true },
  dong: { type: String, required: true },
  reviews: { type: Array, required: true },
  stats: { type: Object, required: true }, // ExploreView에서 계산해 내려줌 (ExploreHeader와 공유)
  hash: { type: Number, required: true },
});
const emit = defineEmits(["write-review", "listings"]);

const TABS = ["인프라", "치안", "교통", "주거비", "리뷰"];
const tab = ref("인프라");

const hash = computed(() => props.hash);
const stats = computed(() => props.stats);

const infraData = computed(() => [
  { name: "헬스장", count: stats.value.gyms, icon: Dumbbell, color: "#2D7A4F" },
  { name: "편의점", count: stats.value.convenience, icon: Store, color: "#52B37A" },
  { name: "병원", count: stats.value.hospitals, icon: Hospital, color: "#6D9E5C" },
  { name: "공원", count: stats.value.parks, icon: Trees, color: "#8ECBA9" },
  { name: "약국", count: stats.value.pharmacies, icon: Hospital, color: "#5B9BD5" },
  { name: "은행", count: stats.value.banks, icon: Building2, color: "#7B68A6" },
  { name: "카페/음식점", count: stats.value.cafes, icon: Coffee, color: "#C47C3A" },
]);

const scoreColor = (v) => (v === 100 ? "#F0B87A" : v >= 90 ? "#F2A8C0" : v >= 80 ? "#B8AEDD" : v >= 70 ? "#8EC8E8" : "#A8D5A0");

const safetyBars = computed(() => {
  const h = hash.value, s = stats.value;
  return [
    { label: "CCTV 밀도", value: Math.min(Math.round(s.cctv * 35), 100) },
    { label: "야간 안전도", value: s.safetyScore },
    { label: "경찰 접근성", value: 65 + (h % 25) },
    { label: "가로등 밀도", value: 58 + (h % 32) },
    { label: "범죄율 지수", value: Math.max(100 - Math.round(s.crimeRate * 18), 30) },
  ];
});

const transitBars = computed(() => {
  const h = hash.value, s = stats.value;
  return [
    { label: "지하철 접근성", value: s.transitScore },
    { label: "버스 노선 다양성", value: 60 + (h % 30) },
    { label: "야간 교통", value: 50 + (h % 35) },
  ];
});

const commuteData = computed(() => {
  const h = hash.value, s = stats.value;
  return [
    { label: "강남·역삼", value: s.avgCommute + (h % 15), unit: "분" },
    { label: "여의도", value: Math.max(15, s.avgCommute - 5 + (h % 12)), unit: "분" },
    { label: "광화문", value: Math.max(15, s.avgCommute - 8 + (h % 10)), unit: "분" },
    { label: "홍대·마포", value: Math.max(10, s.avgCommute - 10 + (h % 8)), unit: "분" },
    { label: "성수·왕십리", value: s.avgCommute + 5 + (h % 8), unit: "분" },
  ];
});
function commuteColor(v) {
  return v <= 30 ? "#A8D5A0" : v <= 45 ? "#F5E6A0" : "#F2B8B8";
}

const rentDistData = computed(() => {
  const h = hash.value;
  return [
    { label: "50만원↓", value: 2 + (h % 4) },
    { label: "50~60", value: 3 + (h % 5) },
    { label: "60~70", value: 4 + (h % 4) },
    { label: "70~80", value: 2 + (h % 3) },
    { label: "80만원↑", value: h % 3 },
  ];
});
function rentColor(v) {
  return v <= 4 ? "#F2B8B8" : v <= 6 ? "#F5E6A0" : "#A8C5E8";
}

const avgOverall = computed(() => (props.reviews.length > 0 ? props.reviews.reduce((s, r) => s + r.overallRating, 0) / props.reviews.length : 0));
const catAvgs = computed(() =>
  REVIEW_CATEGORIES.map((cat) => ({
    cat,
    avg: props.reviews.length > 0 ? props.reviews.reduce((s, r) => s + (r.ratings[cat] || 0), 0) / props.reviews.length : 0,
  })),
);

</script>

<template>
  <div>
    <div class="max-w-5xl mx-auto px-8 flex">
      <button
        v-for="t in TABS"
        :key="t"
        @click="tab = t"
        :class="`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`"
      >
        {{ t === "리뷰" ? `리뷰${reviews.length > 0 ? ` ${reviews.length}` : ""}` : t }}
      </button>
    </div>

    <div class="max-w-5xl mx-auto px-8 py-8">
      <div v-if="tab === '인프라'" class="space-y-5">
        <div class="grid grid-cols-4 gap-3">
          <div v-for="item in infraData" :key="item.name" :class="`border rounded-2xl p-4 text-center ${item.count >= 4 ? 'bg-secondary border-primary/20' : 'bg-card border-border'}`">
            <component :is="item.icon" :size="26" :stroke-width="1.8" class="mx-auto mb-1.5" :style="{ color: item.color }" />
            <p :class="`text-xl font-bold mb-0.5 ${item.count >= 4 ? 'text-primary' : 'text-foreground'}`">{{ item.count }}곳</p>
            <p class="text-xs text-muted-foreground">{{ item.name }}</p>
            <p v-if="item.count >= 4" class="text-xs text-primary font-semibold mt-1">✓ 충족</p>
          </div>
        </div>
        <NeighborhoodMap :dong="dong" :hash="hash" mode="infra" />
      </div>

      <div v-else-if="tab === '치안'" class="space-y-5">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.safetyScore }}점</p><p class="text-xs text-muted-foreground">종합 안전 점수</p></div>
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.cctv }}대</p><p class="text-xs text-muted-foreground">100m당 CCTV</p></div>
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.crimeRate }}건</p><p class="text-xs text-muted-foreground">인구 1천명당 범죄</p></div>
        </div>
        <div class="bg-card border border-border rounded-2xl p-6">
          <h4 class="font-semibold text-foreground mb-4">항목별 안전 지표</h4>
          <div class="space-y-3">
            <ScoreBar v-for="item in safetyBars" :key="item.label" :label="item.label" :value="item.value" unit="점" :color="scoreColor(item.value)" />
          </div>
        </div>
        <div class="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
          <Shield :size="18" class="text-primary mt-0.5 flex-shrink-0" />
          <div><p class="font-semibold text-foreground text-sm mb-1">관할 경찰서</p><p class="text-sm text-foreground/80">{{ district.replace("구", "") }}경찰서 {{ dong.slice(0, 2) }}지구대 (도보 약 {{ 5 + (hash % 10) }}분)</p></div>
        </div>
        <NeighborhoodMap :dong="dong" :hash="hash" mode="safety" />
      </div>

      <div v-else-if="tab === '교통'" class="space-y-5">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.transitScore }}점</p><p class="text-xs text-muted-foreground">교통 점수</p></div>
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.subwayLine }}</p><p class="text-xs text-muted-foreground">주요 지하철 노선</p></div>
          <div class="bg-card border border-border rounded-2xl p-5 text-center"><p class="text-2xl font-bold text-primary mb-1">{{ stats.avgCommute }}분</p><p class="text-xs text-muted-foreground">평균 통근시간</p></div>
        </div>
        <div class="bg-card border border-border rounded-2xl p-6">
          <h4 class="font-semibold text-foreground mb-5">주요 업무지구 통근시간 (예상)</h4>
          <MiniBarChart :data="commuteData" :color-for="commuteColor" />
          <p class="text-xs text-muted-foreground mt-2 text-center">* 대중교통 기준 예상 소요시간</p>
        </div>
        <div class="bg-card border border-border rounded-2xl p-6">
          <h4 class="font-semibold text-foreground mb-4">교통 접근성 지표</h4>
          <div class="space-y-3">
            <ScoreBar v-for="item in transitBars" :key="item.label" :label="item.label" :value="item.value" unit="점" :color="scoreColor(item.value)" />
          </div>
        </div>
        <NeighborhoodMap :dong="dong" :hash="hash" mode="transit" />
      </div>

      <div v-else-if="tab === '주거비'" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">평균 월세</p><p class="text-3xl font-bold text-foreground">{{ stats.avgRent }}만원</p></div>
          <div class="bg-card border border-border rounded-2xl p-6"><p class="text-xs text-muted-foreground mb-2">평균 전세</p><p class="text-3xl font-bold text-foreground">{{ (stats.avgRent * 18).toLocaleString() }}만원</p></div>
        </div>
        <div class="bg-card border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <h4 class="font-semibold text-foreground">월세 분포</h4>
            <button @click="emit('listings')" class="flex items-center gap-1.5 text-xs font-semibold text-primary bg-secondary px-3 py-1.5 rounded-full"><Home :size="12" /> 매물 보러가기</button>
          </div>
          <MiniBarChart :data="rentDistData" :color-for="rentColor" :height="160" />
        </div>
      </div>

      <TabReview v-else-if="tab === '리뷰'" :reviews="reviews" :avg-overall="avgOverall" :cat-avgs="catAvgs" @write-review="emit('write-review')" />
    </div>
  </div>
</template>
