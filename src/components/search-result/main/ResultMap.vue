<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  mapGeoJson: { type: Object, required: true },
  neighborhoods: { type: Array, required: true },
  lightGreenDongs: { type: Array, required: true },
  targetGuNames: { type: Array, required: true },
  overallCenter: { type: Array, required: true },
  hoveredId: { type: [Number, String], default: null },
})

const MAP_NAME = 'searchResultDongs'
const BASE_ZOOM = 1

const mapContainer = ref(null)
let chart = null
let resizeObserver = null

// 지도 초기 옵션
function buildOption() {
  return {
    series: [
      {
        name: '추천 동네',
        type: 'map',
        map: MAP_NAME,
        roam: true,
        center: props.overallCenter,
        zoom: BASE_ZOOM,

        // 1. 전체 기본 스타일 (나머지 텅 빈 지역구들)
        itemStyle: {
          areaColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: { areaColor: '#f3f4f6', borderColor: '#d1d5db' },
          label: { show: false },
        },
        data: [
          // [타겟 지역구 투명 오버레이]: 굵은 검정 테두리 + 구 이름 (기존 동일)
          ...props.targetGuNames.map((name) => ({
            name,
            itemStyle: {
              areaColor: 'transparent',
              borderColor: '#333333',
              borderWidth: 2.5,
            },
            label: {
              show: true,
              color: '#333333',
              fontWeight: 'bold',
              fontSize: 14,
              textBorderColor: '#ffffff',
              textBorderWidth: 2,
            },
            emphasis: {
              itemStyle: { areaColor: 'transparent', borderColor: '#333333', borderWidth: 2.5 },
              label: { show: true, color: '#333333', fontWeight: 'bold' },
            },
          })),

          // [연한 녹색]: 추천 동네가 속한 구의 나머지 행정동들 (경계선 검정으로 변경)
          ...props.lightGreenDongs.map((name) => ({
            name,
            itemStyle: {
              areaColor: '#c9e4d6',
              borderColor: '#333333',
              borderWidth: 1, // 내부 경계선이므로 얇게 유지
            },
            emphasis: {
              itemStyle: { areaColor: '#b5d6c4', borderColor: '#333333', borderWidth: 1 },
              label: { show: false },
            },
          })),

          // [진한 녹색]: 추천 동네 5곳 (경계선 검정으로 변경)
          ...props.neighborhoods.map((n) => ({
            name: n.name,
            value: n.score,
            itemStyle: {
              areaColor: '#2f9e6f',
              borderColor: '#333333',
              borderWidth: 1.5, // 강조 동네이므로 주변 동네보다 살짝 두껍게
            },
            emphasis: {
              itemStyle: { areaColor: '#1b6b4a', borderColor: '#333333', borderWidth: 1.5 },
              label: { show: true, color: '#ffffff', fontWeight: 600 },
            },
          })),
        ],
      },
    ],
  }
}

function flyTo(neighborhood) {
  if (!chart) return
  chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  chart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: neighborhood.name })
  chart.setOption({
    series: [{ center: neighborhood.center, zoom: neighborhood.zoom }],
  })
}

function resetView() {
  if (!chart) return
  chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  chart.setOption({
    series: [{ center: props.overallCenter, zoom: BASE_ZOOM }],
  })
}

onMounted(() => {
  // 부모에서 완벽하게 조합한 하나의 mapGeoJson만 등록합니다.
  echarts.registerMap(MAP_NAME, props.mapGeoJson)

  chart = echarts.init(mapContainer.value)
  chart.setOption(buildOption())

  resizeObserver = new ResizeObserver(() => chart && chart.resize())
  resizeObserver.observe(mapContainer.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})

watch(
  () => props.hoveredId,
  (id) => {
    if (id == null) {
      resetView()
      return
    }
    const target = props.neighborhoods.find((n) => n.id === id)
    if (target) flyTo(target)
  },
)
</script>

<template>
  <div ref="mapContainer" class="result-map"></div>
</template>

<style scoped>
.result-map {
  width: 100%;
  height: 100%;
  min-height: 420px;
}
</style>
