<script setup>
<<<<<<< HEAD
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Map, Check, ChevronLeft, ChevronRight } from "lucide-vue-next";
import RegionSelector from "../components/RegionSelector.vue";
import ExploreHeader from "../components/ExploreHeader.vue";
import ExploreTabs from "../components/ExploreTabs.vue";
import ReviewWriteModal from "../../review/components/ReviewWriteModal.vue";
import StarDisplay from "../../common/components/StarDisplay.vue";
import BaseToast from "../../common/components/BaseToast.vue";
import TheFooter from "../../common/components/TheFooter.vue";
import { DONG_DATA } from "../../common/utils/mockData";
import { useNeighborhoodStore } from "../stores/useNeighborhoodStore";
import { useMyPageStore } from "../../mypage/stores/useMyPageStore";
import { useDongStats } from "../composables/useDongStats";

const route = useRoute();
const router = useRouter();
const nbhd = useNeighborhoodStore();
const mypage = useMyPageStore();

const selectedDistrict = computed({
  get: () => route.params.district || null,
  set: (d) => (d ? router.push(`/explore/${d}`) : router.push("/explore")),
});
const selectedDong = computed(() => route.params.dong || null);

const districtData = computed(() => (selectedDistrict.value ? DONG_DATA[selectedDistrict.value] ?? null : null));
const districtReviews = computed(() => (selectedDistrict.value ? mypage.allReviews.filter((r) => r.district === selectedDistrict.value) : []));
const districtAvgRating = computed(() =>
  districtReviews.value.length > 0 ? districtReviews.value.reduce((s, r) => s + r.overallRating, 0) / districtReviews.value.length : 0,
);

function dongReviews(dong) {
  return mypage.allReviews.filter((r) => r.district === selectedDistrict.value && r.dong === dong);
}
function dongAvg(dong) {
  const rs = dongReviews(dong);
  return rs.length > 0 ? rs.reduce((s, r) => s + r.overallRating, 0) / rs.length : 0;
}

function selectDong(dong) {
  router.push(`/explore/${selectedDistrict.value}/${dong}`);
}

// ── 동 상세 화면 ──
const showReviewForm = ref(false);
const saveToast = ref(null);

const dongStats = computed(() => (selectedDong.value ? useDongStats(selectedDistrict.value, selectedDong.value) : null));
const dongReviewList = computed(() => (selectedDong.value ? dongReviews(selectedDong.value) : []));
const dongAvgOverall = computed(() =>
  dongReviewList.value.length > 0 ? dongReviewList.value.reduce((s, r) => s + r.overallRating, 0) / dongReviewList.value.length : 0,
);
const isDongSaved = computed(() => (selectedDong.value ? mypage.savedNeighborhoods.includes(selectedDong.value) : false));

function toggleSaveDong() {
  const willSave = !isDongSaved.value;
  mypage.toggleSavedNeighborhood(selectedDong.value);
  if (willSave) saveToast.value = "관심 동네에 추가되었습니다.";
}
function submitReview(review) {
  mypage.addReview(review);
  showReviewForm.value = false;
}
function goListings() {
  nbhd.listingsFrom = "nbhd-info";
  router.push("/search/results"); // TODO: 전용 매물 목록 라우트 연결
}

const legend = [
  { color: "#2D7A4F", label: "선택된 구" },
  { color: "#9CC47E", label: "일반 구" },
  { color: "#A8D4E6", label: "한강" },
];
const emptyStateItems = ["치안·CCTV·범죄율 현황", "교통 접근성 및 통근시간", "생활 인프라 (병원·편의점 등)", "실거주민 솔직 리뷰"];
=======
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, ChevronLeft, ChevronRight, Map } from 'lucide-vue-next'
import ExploreHeader from '@/region/components/ExploreHeader.vue'
import ExploreTabs from '@/region/components/ExploreTabs.vue'
import ReviewWriteModal from '@/review/components/ReviewWriteModal.vue'
import StarDisplay from '@/common/components/StarDisplay.vue'
import BaseToast from '@/common/components/BaseToast.vue'
import TheFooter from '@/common/components/TheFooter.vue'
import { DONG_DATA } from '@/common/utils/mockData'
import { useNeighborhoodStore } from '@/region/stores/useNeighborhoodStore'
import { useMyPageStore } from '@/mypage/stores/useMyPageStore'
import { useDongStats } from '@/region/composables/useDongStats'

const route = useRoute()
const router = useRouter()
const nbhd = useNeighborhoodStore()
const mypage = useMyPageStore()

const selectedDistrict = computed({
  get: () => route.params.district || null,
  set: (d) => (d ? router.push(`/explore/${d}`) : router.push('/explore')),
})
const selectedDong = computed(() => route.params.dong || null)

const districtData = computed(() =>
  selectedDistrict.value ? (DONG_DATA[selectedDistrict.value] ?? null) : null,
)
const districtReviews = computed(() =>
  selectedDistrict.value
    ? mypage.allReviews.filter((r) => r.district === selectedDistrict.value)
    : [],
)
const districtAvgRating = computed(() =>
  districtReviews.value.length > 0
    ? districtReviews.value.reduce((s, r) => s + r.overallRating, 0) / districtReviews.value.length
    : 0,
)

function dongReviews(dong) {
  return mypage.allReviews.filter((r) => r.district === selectedDistrict.value && r.dong === dong)
}
function dongAvg(dong) {
  const rs = dongReviews(dong)
  return rs.length > 0 ? rs.reduce((s, r) => s + r.overallRating, 0) / rs.length : 0
}

function selectDong(dong) {
  router.push(`/explore/${selectedDistrict.value}/${dong}`)
}

// ── 동 상세 화면 ──
const showReviewForm = ref(false)
const saveToast = ref(null)

const dongStats = computed(() =>
  selectedDong.value ? useDongStats(selectedDistrict.value, selectedDong.value) : null,
)
const dongReviewList = computed(() => (selectedDong.value ? dongReviews(selectedDong.value) : []))
const dongAvgOverall = computed(() =>
  dongReviewList.value.length > 0
    ? dongReviewList.value.reduce((s, r) => s + r.overallRating, 0) / dongReviewList.value.length
    : 0,
)
const isDongSaved = computed(() =>
  selectedDong.value ? mypage.savedNeighborhoods.includes(selectedDong.value) : false,
)

function toggleSaveDong() {
  const willSave = !isDongSaved.value
  mypage.toggleSavedNeighborhood(selectedDong.value)
  if (willSave) saveToast.value = '관심 동네에 추가되었습니다.'
}
function submitReview(review) {
  mypage.addReview(review)
  showReviewForm.value = false
}
function goListings() {
  nbhd.listingsFrom = 'nbhd-info'
  router.push('/search/results')
}

const legend = [
  { color: '#FF00FF', label: '마우스 오버 (보색 반전)' },
  { color: '#FF0000', label: '무지개 원색 구별' },
  { color: '#A8D4E6', label: '한강' },
]
const emptyStateItems = [
  '치안·CCTV·범죄율 현황',
  '교통 접근성 및 통근시간',
  '생활 인프라 (병원·편의점 등)',
  '실거주민 솔직 리뷰',
]

const DISTRICT_OFFSETS = {
  중구: { latOffset: 0.001, lngOffset: 0.001 },
}

// 무지개 7색 기반 선명한 25가지 구별 색상
const RAINBOW_25_COLORS = [
  '#FF0000',
  '#FF7F00',
  '#FFD700',
  '#00CC00',
  '#00FFFF',
  '#0000FF',
  '#8B00FF',
  '#FF1493',
  '#ADFF2F',
  '#FF4500',
  '#FFFF00',
  '#008000',
  '#1E90FF',
  '#4B0082',
  '#EE82EE',
  '#DC143C',
  '#FF8C00',
  '#20B2AA',
  '#4169E1',
  '#9400D3',
  '#FF69B4',
  '#00FA9A',
  '#00BFFF',
  '#9932CC',
  '#32CD32',
]

// HEX 색상을 받아 완벽한 보색(Complementary Color) HEX 코드를 계산하는 유틸 함수
function getComplementaryColor(hex) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = 255 - parseInt(cleanHex.substring(0, 2), 16)
  const g = 255 - parseInt(cleanHex.substring(2, 4), 16)
  const b = 255 - parseInt(cleanHex.substring(4, 6), 16)
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

let dongPolygonMap = {}
let originalPolygonColors = {}
let complementaryPolygonColors = {}
const hoveredDongName = ref(null)

watch(hoveredDongName, (newDong, oldDong) => {
  if (oldDong && dongPolygonMap[oldDong]) {
    const originColor = originalPolygonColors[oldDong] || '#FF0000'
    dongPolygonMap[oldDong].setOptions({
      fillColor: originColor,
      fillOpacity: 0.4,
    })
  }
  if (newDong && dongPolygonMap[newDong]) {
    const compColor = complementaryPolygonColors[newDong] || '#00FFFF'
    dongPolygonMap[newDong].setOptions({
      fillColor: compColor,
      fillOpacity: 0.8, // 호버 시 보색으로 진하게 강조
    })
  }
})

// ── 카카오 지도 렌더링 로직 ──
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

onMounted(() => {
  loadKakaoMapScript()
})

watch(selectedDong, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      initMap()
    })
  }
})

function loadKakaoMapScript() {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(initMap)
    return
  }

  const script = document.createElement('script')
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`
  script.onload = () => {
    window.kakao.maps.load(initMap)
  }
  script.onerror = () => {
    console.error('카카오맵 스크립트 로드 실패.')
  }
  document.head.appendChild(script)
}

function initMap() {
  const container = document.getElementById('map')
  if (!container) return

  dongPolygonMap = {}
  originalPolygonColors = {}
  complementaryPolygonColors = {}

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 8.55,
  })

  // 확대, 축소(마우스 스크롤 및 핀치 줌) 차단
  map.setZoomable(false)
  // 지도 드래그(이동) 차단
  map.setDraggable(false)

  setTimeout(() => {
    map.relayout()

    // 카카오맵 로고, 축척, 저작권 요소 강제 DOM 제거
    const unwantedElements = container.querySelectorAll(
      'a[href*="kakao.com"], img[src*="kakao"], div[style*="position: absolute"][style*="left: 0px"][style*="bottom: 0px"], .r_layer, .dacr',
    )
    unwantedElements.forEach((el) => el.remove())
  }, 100)

  fetch('/seoul_dong.geojson')
    .then((response) => response.json())
    .then((geojson) => {
      if (!geojson || !geojson.features) return

      const districtMap = {}
      const districtColorMap = {}

      const allDistricts = []
      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        if (sigName && !allDistricts.includes(sigName)) {
          allDistricts.push(sigName)
        }
      })

      allDistricts.forEach((sigName, idx) => {
        const colorIdx = (idx * 4) % RAINBOW_25_COLORS.length
        districtColorMap[sigName] = RAINBOW_25_COLORS[colorIdx]
      })

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        const dongName = nameParts[2]

        if (!sigName || !dongName) return

        if (!districtMap[sigName]) {
          districtMap[sigName] = { totalLat: 0, totalLng: 0, pointCount: 0 }
        }

        const coordinates = feature.geometry.coordinates
        const paths = []

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const lat = coord[1]
            const lng = coord[0]
            path.push(new window.kakao.maps.LatLng(lat, lng))
            districtMap[sigName].totalLat += lat
            districtMap[sigName].totalLng += lng
            districtMap[sigName].pointCount++
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            paths.push(processCoords(polygon[0]))
          })
        } else {
          paths.push(processCoords(coordinates[0]))
        }

        const assignedColor = districtColorMap[sigName] || '#FF0000'
        originalPolygonColors[dongName] = assignedColor
        complementaryPolygonColors[dongName] = getComplementaryColor(assignedColor)

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
          strokeWeight: 0.8, // 동 단위 경계선을 얇은 선으로 변경
          strokeColor: '#555555', // 너무 튀지 않는 은은한 회색 선 적용
          strokeOpacity: 0.4, // 투명도를 주어 깔끔하게 처리
          fillColor: assignedColor,
          fillOpacity: 0.4,
        })

        dongPolygonMap[dongName] = polygon

        window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
          hoveredDongName.value = dongName
        })
        window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
          if (hoveredDongName.value === dongName) {
            hoveredDongName.value = null
          }
        })
        window.kakao.maps.event.addListener(polygon, 'click', () => {
          selectedDistrict.value = sigName
        })

        polygon.setMap(map)
      })

      Object.keys(districtMap).forEach((sigName) => {
        const dData = districtMap[sigName]
        if (dData.pointCount === 0) return

        let centerLat = dData.totalLat / dData.pointCount
        let centerLng = dData.totalLng / dData.pointCount

        if (DISTRICT_OFFSETS[sigName]) {
          centerLat += DISTRICT_OFFSETS[sigName].latOffset
          centerLng += DISTRICT_OFFSETS[sigName].lngOffset
        }

        const centerPos = new window.kakao.maps.LatLng(centerLat, centerLng)

        const contentDiv = document.createElement('div')
        contentDiv.className = 'dong-label clickable-label'
        contentDiv.innerText = sigName

        contentDiv.addEventListener('click', (e) => {
          e.stopPropagation()
          selectedDistrict.value = sigName
        })

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: centerPos,
          content: contentDiv,
          xAnchor: 0.5,
          yAnchor: 0.5,
        })

        customOverlay.setMap(map)
      })
    })
    .catch((err) => console.error('GeoJSON 로드 오류:', err))
}
>>>>>>> 57e716e (Initial commit)
</script>

<template>
  <!-- 동 상세 화면 -->
<<<<<<< HEAD
  <div v-if="selectedDong" class="min-h-screen bg-background pt-[60px]">
    <ReviewWriteModal v-if="showReviewForm" :district="selectedDistrict" :dong="selectedDong" @close="showReviewForm = false" @submit="submitReview" />
    <BaseToast v-if="saveToast" :message="saveToast" @done="saveToast = null" />

    <div class="border-b border-border bg-white sticky top-[60px] z-20">
      <ExploreHeader
        :district="selectedDistrict"
        :dong="selectedDong"
        :population="dongStats.stats.population"
=======
  <div v-if="selectedDong" class="min-h-screen bg-background pt-15">
    <ReviewWriteModal
      v-if="showReviewForm"
      :district="selectedDistrict"
      :dong="selectedDong"
      @close="showReviewForm = false"
      @submit="submitReview"
    />
    <BaseToast v-if="saveToast" :message="saveToast" @done="saveToast = null" />

    <div class="border-b border-border bg-white sticky top-15 z-20">
      <ExploreHeader
        :district="selectedDistrict"
        :dong="selectedDong"
        :population="dongStats?.stats?.population"
>>>>>>> 57e716e (Initial commit)
        :avg-overall="dongAvgOverall"
        :review-count="dongReviewList.length"
        :is-saved="isDongSaved"
        @back="router.push('/explore')"
        @toggle-save="toggleSaveDong"
        @listings="goListings"
        @write-review="showReviewForm = true"
      />
      <ExploreTabs
        :district="selectedDistrict"
        :dong="selectedDong"
        :reviews="dongReviewList"
<<<<<<< HEAD
        :stats="dongStats.stats"
        :hash="dongStats.hash"
=======
        :stats="dongStats?.stats"
        :hash="dongStats?.hash"
>>>>>>> 57e716e (Initial commit)
        @write-review="showReviewForm = true"
        @listings="goListings"
      />
    </div>

    <TheFooter />
  </div>

  <!-- 구 선택 / 동 목록 화면 -->
<<<<<<< HEAD
  <div v-else class="flex h-screen pt-[60px] overflow-hidden">
    <div class="flex-1 relative overflow-hidden" style="background: linear-gradient(135deg,#DCE9DC,#E4EDE7,#D8E8DB)">
      <RegionSelector v-model="selectedDistrict" />
      <div class="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-border shadow-sm">
=======
  <div v-else class="flex h-screen pt-15 overflow-hidden">
    <!-- 좌측 카카오맵 영역 -->
    <div class="flex-1 relative overflow-hidden bg-background">
      <div id="map" class="w-full h-full"></div>

      <div
        class="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 border border-border shadow-sm z-10"
      >
>>>>>>> 57e716e (Initial commit)
        <p class="text-xs font-bold text-foreground mb-3">범례</p>
        <div v-for="l in legend" :key="l.label" class="flex items-center gap-2.5 mb-1.5">
          <div class="w-3.5 h-3.5 rounded-sm" :style="{ background: l.color }" />
          <span class="text-xs text-muted-foreground">{{ l.label }}</span>
        </div>
      </div>
<<<<<<< HEAD
      <div class="absolute top-4 right-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border shadow-sm text-xs text-muted-foreground">구를 클릭하면 동 목록을 볼 수 있어요</div>
    </div>

    <div class="w-[400px] flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div v-if="!selectedDistrict" class="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div class="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-sm"><Map :size="36" class="text-primary" /></div>
        <h2 class="text-xl font-bold text-foreground mb-3">궁금한 동네를 찾아보세요</h2>
        <p class="text-sm text-muted-foreground leading-relaxed mb-8">지도에서 구를 클릭하면 행정동 목록과<br />생활 정보, 실거주민 리뷰를 확인할 수 있어요.</p>
        <div class="w-full space-y-2.5">
          <div v-for="item in emptyStateItems" :key="item" class="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <Check :size="14" class="text-primary flex-shrink-0" /><span class="text-sm text-foreground">{{ item }}</span>
=======
      <div
        class="absolute top-4 right-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border shadow-sm text-xs text-muted-foreground z-10"
      >
        구 이름을 클릭하거나 사이드바에서 동을 확인하세요
      </div>
    </div>

    <!-- 우측 사이드바 영역 -->
    <div class="w-100 shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
      <div
        v-if="!selectedDistrict"
        class="flex-1 flex flex-col items-center justify-center p-10 text-center"
      >
        <div
          class="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-sm"
        >
          <Map :size="36" class="text-primary" />
        </div>
        <h2 class="text-xl font-bold text-foreground mb-3">궁금한 동네를 찾아보세요</h2>
        <p class="text-sm text-muted-foreground leading-relaxed mb-8">
          지도에서 구를 클릭하면 행정동 목록과<br />생활 정보, 실거주민 리뷰를 확인할 수 있어요.
        </p>
        <div class="w-full space-y-2.5">
          <div
            v-for="item in emptyStateItems"
            :key="item"
            class="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            <Check :size="14" class="text-primary shrink-0" /><span
              class="text-sm text-foreground"
              >{{ item }}</span
            >
>>>>>>> 57e716e (Initial commit)
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-full overflow-hidden">
<<<<<<< HEAD
        <div class="p-5 border-b border-border flex-shrink-0">
          <button @click="selectedDistrict = null" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 font-medium"><ChevronLeft :size="13" /> 전체 지도</button>
=======
        <div class="p-5 border-b border-border shrink-0">
          <button
            @click="selectedDistrict = null"
            class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 font-medium"
          >
            <ChevronLeft :size="13" /> 전체 지도
          </button>
>>>>>>> 57e716e (Initial commit)
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-foreground">{{ selectedDistrict }}</h2>
              <div v-if="districtAvgRating > 0" class="flex items-center gap-2 mt-1">
                <StarDisplay :rating="districtAvgRating" :size="13" />
<<<<<<< HEAD
                <span class="text-xs text-muted-foreground">{{ districtAvgRating.toFixed(1) }} ({{ districtReviews.length }}개 리뷰)</span>
              </div>
            </div>
            <span v-if="districtData" class="text-xs bg-secondary text-primary font-semibold px-3 py-1 rounded-full">평균 월세 {{ districtData.avgRent }}만원</span>
=======
                <span class="text-xs text-muted-foreground"
                  >{{ districtAvgRating.toFixed(1) }} ({{ districtReviews.length }}개 리뷰)</span
                >
              </div>
            </div>
            <span
              v-if="districtData"
              class="text-xs bg-secondary text-primary font-semibold px-3 py-1 rounded-full"
              >평균 월세 {{ districtData.avgRent }}만원</span
            >
>>>>>>> 57e716e (Initial commit)
          </div>
        </div>

        <template v-if="districtData">
<<<<<<< HEAD
          <div class="px-5 py-4 border-b border-border flex-shrink-0">
=======
          <div class="px-5 py-4 border-b border-border shrink-0">
>>>>>>> 57e716e (Initial commit)
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="item in [
                  { label: '안전', val: districtData.safetyScore, color: '#4A90D9' },
                  { label: '교통', val: districtData.transitScore, color: '#E07040' },
                  { label: '인프라', val: districtData.infraScore, color: '#52B37A' },
                ]"
                :key="item.label"
                class="bg-card border border-border rounded-xl p-3 text-center"
              >
                <p class="text-base font-bold" :style="{ color: item.color }">{{ item.val }}</p>
                <p class="text-xs text-muted-foreground">{{ item.label }}</p>
<<<<<<< HEAD
                <div class="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden"><div class="h-full rounded-full" :style="{ width: item.val + '%', background: item.color }" /></div>
=======
                <div class="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: item.val + '%', background: item.color }"
                  />
                </div>
>>>>>>> 57e716e (Initial commit)
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <div class="px-5 py-4">
<<<<<<< HEAD
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">행정동 목록</p>
=======
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                행정동 목록
              </p>
>>>>>>> 57e716e (Initial commit)
              <div class="space-y-2">
                <button
                  v-for="dong in districtData.dong"
                  :key="dong"
                  @click="selectDong(dong)"
<<<<<<< HEAD
                  class="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/40 hover:bg-secondary/50 transition-all text-left group"
                >
                  <div>
                    <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{{ dong }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <template v-if="dongAvg(dong) > 0">
                        <StarDisplay :rating="dongAvg(dong)" :size="10" />
                        <span class="text-xs text-muted-foreground">{{ dongAvg(dong).toFixed(1) }} · {{ dongReviews(dong).length }}개</span>
=======
                  @mouseenter="hoveredDongName = dong"
                  @mouseleave="hoveredDongName = null"
                  class="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/40 hover:bg-secondary/50 transition-all text-left group"
                >
                  <div>
                    <div
                      class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
                    >
                      {{ dong }}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <template v-if="dongAvg(dong) > 0">
                        <StarDisplay :rating="dongAvg(dong)" :size="10" />
                        <span class="text-xs text-muted-foreground"
                          >{{ dongAvg(dong).toFixed(1) }} · {{ dongReviews(dong).length }}개</span
                        >
>>>>>>> 57e716e (Initial commit)
                      </template>
                      <span v-else class="text-xs text-muted-foreground">리뷰 없음</span>
                    </div>
                  </div>
<<<<<<< HEAD
                  <ChevronRight :size="15" class="text-muted-foreground group-hover:text-primary flex-shrink-0" />
=======
                  <ChevronRight
                    :size="15"
                    class="text-muted-foreground group-hover:text-primary shrink-0"
                  />
>>>>>>> 57e716e (Initial commit)
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<<<<<<< HEAD
=======

<style scoped>
:deep(.dong-label) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #1a73e8;
  color: #1a73e8;
  font-weight: 600;
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.dong-label:hover) {
  background: #1a73e8;
  color: white;
  transform: scale(1.05);
}

/* 카카오맵 로고 및 하단 컨트롤러 아예 안 보이도록 강제 차단 */
:deep(div[style*='position: absolute'][style*='left: 0px'][style*='bottom: 0px']),
:deep(img[src*='kakao']),
:deep(a[href*='kakao.com']),
:deep(.r_layer),
:deep(.dacr),
:deep([class*='copyright']) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}
</style>
>>>>>>> 57e716e (Initial commit)
