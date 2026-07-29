<script setup>
import { ref } from 'vue'
import RecommendList from '@/components/search-result/sidebar/RecommendList.vue'
import ResultMap from '@/components/search-result/main/ResultMap.vue'

import seoulDongRaw from '@/assets/seoul_dong.geojson?raw'
import seoulGuRaw from '@/assets/seoul_gu.geojson?raw'

const neighborhoods = ref([
  {
    id: 1,
    name: '증산동',
    score: 89,
    commute: '31분 · 환승 1회',
    rent: '월세 64만원',
    tags: ['빠른 통근', '운동시설 풍부', '예산 적합'],
  },
  {
    id: 2,
    name: '응암1동',
    score: 85,
    commute: '38분 · 환승 1회',
    rent: '월세 58만원',
    tags: ['예산 여유', '생활시설 풍부', '병원 접근성'],
  },
  {
    id: 3,
    name: '망원2동',
    score: 82,
    commute: '35분 · 환승 2회',
    rent: '월세 70만원',
    tags: ['상권 인접', '치안 양호'],
  },
  {
    id: 4,
    name: '신정3동',
    score: 78,
    commute: '42분 · 환승 1회',
    rent: '월세 55만원',
    tags: ['예산 절약', '조용한 주거지'],
  },
  {
    id: 5,
    name: '강일동',
    score: 74,
    commute: '46분 · 환승 2회',
    rent: '월세 60만원',
    tags: ['신축 단지', '공원 인접'],
  },
])

function flattenCoords(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates.flat()
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(2)
  return []
}

function bboxOf(points) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of points) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { center: [(minX + maxX) / 2, (minY + maxY) / 2], width: maxX - minX, height: maxY - minY }
}
const seoulGuParsed = JSON.parse(seoulGuRaw)
const seoulDongParsed = JSON.parse(seoulDongRaw)

const targetNames = neighborhoods.value.map((n) => n.name)

// 1. 추천 동네 5곳의 Feature 추출 (기존과 동일하게 이름으로 찾음)
const matchedDongFeatures = seoulDongParsed.features.filter((f) =>
  targetNames.includes(f.properties.ADM_NM),
)

// 2. 추천 동네의 ADM_CD에서 앞 5자리(구 코드)만 잘라내어 배열로 만듭니다. (예: '11230')
const targetGuCodes = [
  ...new Set(matchedDongFeatures.map((f) => String(f.properties.ADM_CD).substring(0, 5))),
]

// 3. 배경 데이터 (지역구): SIGUNGU_CD가 targetGuCodes에 '없는' 구만 남깁니다.
const guFeatures = seoulGuParsed.features
  .filter((f) => !targetGuCodes.includes(String(f.properties.SIGUNGU_CD)))
  .map((f) => ({
    ...f,
    properties: { ...f.properties, name: f.properties.SIGUNGU_NM },
  }))

// NEW: 테두리 및 라벨용 타겟 지역구 (투명하게 깔릴 녀석들)
const targetGuFeatures = seoulGuParsed.features
  .filter((f) => targetGuCodes.includes(String(f.properties.SIGUNGU_CD)))
  .map((f) => ({
    ...f,
    properties: { ...f.properties, name: f.properties.SIGUNGU_NM },
  }))

// 자식에게 넘겨줄 타겟 지역구 이름 목록 (예: ['은평구', '마포구', ...])
const targetGuNames = targetGuFeatures.map((f) => f.properties.name)

// 상세 데이터 (행정동): 추천 동네가 "있는" 구들은 행정동 단위로 쪼갬 (녹색)
const dongFeatures = seoulDongParsed.features
  .filter((f) => targetGuCodes.includes(String(f.properties.ADM_CD).substring(0, 5)))
  .map((f) => ({
    ...f,
    properties: { ...f.properties, name: f.properties.ADM_NM },
  }))

// 4. 최종 지도 데이터 병합
// 그리는 순서 매우 중요: 배경 구 -> 타겟 구(투명+굵은테두리) -> 쪼개진 동
// 동이 맨 마지막에 와야 마우스 호버 이벤트를 타겟 구에게 뺏기지 않습니다.
const mapGeoJson = {
  type: 'FeatureCollection',
  features: [...guFeatures, ...targetGuFeatures, ...dongFeatures],
}

// 연한 녹색으로 칠할 주변 행정동 이름 목록 (목업 5곳 제외)
const lightGreenDongs = dongFeatures
  .map((f) => f.properties.name)
  .filter((name) => !targetNames.includes(name))

// 전체 중심 좌표 및 Zoom 계산 로직 (기존 동일)
const overallBBox = bboxOf(matchedDongFeatures.flatMap((f) => flattenCoords(f.geometry)))
const overallSize = Math.max(overallBBox.width, overallBBox.height)

neighborhoods.value.forEach((n) => {
  // f.properties.name이 아니라 원본 속성인 ADM_NM으로 매칭해야 합니다.
  const feature = matchedDongFeatures.find((f) => f.properties.ADM_NM === n.name)

  // 만약 GeoJSON에 해당 동 이름이 없어서 못 찾았다면 에러를 내지 않고 건너뛰도록 방어 코드 추가
  if (!feature) {
    console.error(
      `GeoJSON 데이터에서 '${n.name}' 폴리곤을 찾을 수 없습니다. 이름이 정확한지 확인해주세요.`,
    )
    return
  }

  const box = bboxOf(flattenCoords(feature.geometry))
  const featureSize = Math.max(box.width, box.height)
  n.center = box.center
  n.zoom = Math.min(15, Math.max(3, (overallSize / featureSize) * 0.4))
})

const hoveredId = ref(null)

function handleHover(id) {
  hoveredId.value = id
}
function handleLeave() {
  hoveredId.value = null
}
</script>

<template>
  <div class="search-result">
    <section class="search-result__list">
      <header class="search-result__heading">
        <h1>회원님에게 잘 맞는 동네 5곳을 찾았어요</h1>
        <p>추천 이유와 아쉬운 점을 함께 비교해보세요.</p>
      </header>

      <RecommendList
        :neighborhoods="neighborhoods"
        :hovered-id="hoveredId"
        @hover="handleHover"
        @leave="handleLeave"
      />
    </section>

    <section class="search-result__map">
      <ResultMap
        :map-geo-json="mapGeoJson"
        :neighborhoods="neighborhoods"
        :light-green-dongs="lightGreenDongs"
        :target-gu-names="targetGuNames"
        :overall-center="overallBBox.center"
        :hovered-id="hoveredId"
      />
    </section>
  </div>
</template>

<style scoped>
.search-result {
  display: flex;
  min-height: 100vh;
  width: 100%;
}
.search-result__list {
  width: 420px;
  flex: 0 0 420px;
  padding: 32px 24px;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
}
.search-result__heading h1 {
  margin: 0 0 8px;
  font-size: 22px;
}
.search-result__heading p {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
}
.search-result__map {
  flex: 1 1 auto;
  min-width: 0;
}
@media (max-width: 900px) {
  .search-result {
    flex-direction: column;
  }
  .search-result__list {
    width: 100%;
    flex: none;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .search-result__map {
    min-height: 420px;
  }
}
</style>
