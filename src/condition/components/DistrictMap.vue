<script setup>
<<<<<<< HEAD
import { ref, computed } from "vue";
import { X } from "lucide-vue-next";
import { SEOUL_DISTRICTS, LANDMARKS } from "../../common/utils/mockData";

const props = defineProps({
  modelValue: { type: Array, required: true }, // 선택된 구 이름 배열
  max: { type: Number, default: 2 },
});
const emit = defineEmits(["update:modelValue"]);

const hovered = ref(null);

function isSelected(id) {
  return props.modelValue.includes(id);
}
function toggle(id) {
  if (isSelected(id)) emit("update:modelValue", props.modelValue.filter((x) => x !== id));
  else if (props.modelValue.length < props.max) emit("update:modelValue", [...props.modelValue, id]);
}

function districtColor(d) {
  const isSel = isSelected(d.id);
  const isHov = hovered.value === d.id;
  return isSel ? "#2D7A4F" : isHov ? "#8ECBA9" : "#C8DEC8";
}
function districtOpacity(d) {
  const isSel = isSelected(d.id);
  const isHov = hovered.value === d.id;
  const isDisabled = !isSel && props.modelValue.length >= props.max;
  return isSel ? 0.92 : isHov ? 0.85 : isDisabled ? 0.35 : 0.65;
}
function isDisabled(id) {
  return !isSelected(id) && props.modelValue.length >= props.max;
}
function landmarkLabelWidth(name) {
  return name.length * 5.4 + 8;
=======
import { ref, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Array, required: true },
  max: { type: Number, default: 2 },
})
const emit = defineEmits(['update:modelValue'])

const hoveredDistrict = ref(null)
let districtPolygonMap = {}
let originalPolygonColors = {}
let complementaryPolygonColors = {}
let kakaoMapInstance = null

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

function isSelected(id) {
  return props.modelValue.includes(id)
}

function toggle(id) {
  if (isSelected(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((x) => x !== id),
    )
  } else if (props.modelValue.length < props.max) {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

watch([() => props.modelValue, hoveredDistrict], () => {
  Object.keys(districtPolygonMap).forEach((sigName) => {
    const polygon = districtPolygonMap[sigName]
    if (!polygon) return

    const fullDistrictName = sigName.endsWith('구') ? sigName : sigName + '구'
    const sel = isSelected(fullDistrictName)
    const hov = hoveredDistrict.value === fullDistrictName
    const isMaxReached = props.modelValue.length >= props.max
    const isDisabled = !sel && isMaxReached

    let fillColor = originalPolygonColors[sigName] || '#FF0000'
    let fillOpacity = 0.4

    if (sel) {
      fillOpacity = 0.75
    } else if (isDisabled) {
      fillColor = '#E2E8F0'
      fillOpacity = 0.35
    } else if (hov) {
      fillColor = complementaryPolygonColors[sigName] || '#00FFFF'
      fillOpacity = 0.85
    }

    polygon.setOptions({
      fillColor: fillColor,
      fillOpacity: fillOpacity,
    })
  })
})

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

onMounted(() => {
  loadKakaoMapScript()
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
    console.error('카카오맵 스크립트 로드 실패')
  }
  document.head.appendChild(script)
}

function initMap() {
  const container = document.getElementById('step-map')
  if (!container) return

  districtPolygonMap = {}
  originalPolygonColors = {}
  complementaryPolygonColors = {}

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 9.4,
  })
  kakaoMapInstance = map

  map.setZoomable(false)
  map.setDraggable(false)

  setTimeout(() => {
    map.relayout()

    // 카카오맵 로고, 저작권, 축척 컨트롤러 등 불필요한 DOM 요소 강제 제거
    const unwantedElements = container.querySelectorAll(
      'a[href*="kakao.com"], img[src*="kakao"], div[style*="position: absolute"][style*="left: 0px"][style*="bottom: 0px"], .r_layer, .dacr',
    )
    unwantedElements.forEach((el) => el.remove())
  }, 100)

  // public 폴더에 저장된 변환 완료된 GeoJSON 파일 로드
  fetch('/seoul_dong.geojson')
    .then((response) => response.json())
    .then((geojson) => {
      if (!geojson || !geojson.features) return

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

      const districtPathsMap = {}
      const districtCenterCalc = {}

      geojson.features.forEach((feature) => {
        const fullName = feature.properties.adm_nm || ''
        const nameParts = fullName.split(' ')
        const sigName = nameParts[1]
        if (!sigName) return

        if (!districtPathsMap[sigName]) {
          districtPathsMap[sigName] = []
          districtCenterCalc[sigName] = { totalLat: 0, totalLng: 0, count: 0 }
        }

        const coordinates = feature.geometry.coordinates

        function processCoords(coordsArr) {
          const path = []
          coordsArr.forEach((coord) => {
            const lat = coord[1]
            const lng = coord[0]
            path.push(new window.kakao.maps.LatLng(lat, lng))
            districtCenterCalc[sigName].totalLat += lat
            districtCenterCalc[sigName].totalLng += lng
            districtCenterCalc[sigName].count++
          })
          return path
        }

        if (feature.geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon) => {
            districtPathsMap[sigName].push(processCoords(polygon[0]))
          })
        } else {
          districtPathsMap[sigName].push(processCoords(coordinates[0]))
        }
      })

      Object.keys(districtPathsMap).forEach((sigName) => {
        const paths = districtPathsMap[sigName]
        const assignedColor = districtColorMap[sigName] || '#FF0000'
        const fullDistrictName = sigName.endsWith('구') ? sigName : sigName + '구'

        originalPolygonColors[sigName] = assignedColor
        complementaryPolygonColors[sigName] = getComplementaryColor(assignedColor)

        const polygon = new window.kakao.maps.Polygon({
          path: paths,
          strokeWeight: 0.8,
          strokeColor: '#555555',
          strokeOpacity: 0.4,
          fillColor: assignedColor,
          fillOpacity: 0.4,
        })

        districtPolygonMap[sigName] = polygon

        window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
          hoveredDistrict.value = fullDistrictName
        })
        window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
          if (hoveredDistrict.value === fullDistrictName) {
            hoveredDistrict.value = null
          }
        })
        window.kakao.maps.event.addListener(polygon, 'click', () => {
          const isMax = props.modelValue.length >= props.max
          if (isMax && !isSelected(fullDistrictName)) return
          toggle(fullDistrictName)
        })

        polygon.setMap(map)

        const cData = districtCenterCalc[sigName]
        if (cData && cData.count > 0) {
          const centerLat = cData.totalLat / cData.count
          const centerLng = cData.totalLng / cData.count

          const contentDiv = document.createElement('div')
          contentDiv.className = 'district-label'
          contentDiv.innerText = fullDistrictName
          contentDiv.addEventListener('click', (e) => {
            e.stopPropagation()
            const isMax = props.modelValue.length >= props.max
            if (isMax && !isSelected(fullDistrictName)) return
            toggle(fullDistrictName)
          })

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(centerLat, centerLng),
            content: contentDiv,
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          customOverlay.setMap(map)
        }
      })
    })
    .catch((err) => console.error('GeoJSON 로드 오류:', err))
>>>>>>> 57e716e (Initial commit)
}
</script>

<template>
  <div class="relative w-full">
<<<<<<< HEAD
    <div v-if="hovered" class="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-lg">
      {{ hovered }} {{ isSelected(hovered) ? "✓" : modelValue.length >= max ? "(최대)" : "— 선택" }}
    </div>

    <svg viewBox="0 0 600 525" class="w-full" style="max-height: 360px">
      <path d="M 34,310 Q 150,295 250,308 Q 360,318 480,295 Q 540,285 590,290" fill="none" stroke="#A8D4E6" stroke-width="18" stroke-linecap="round" opacity="0.6" />
      <text x="420" y="290" font-size="9" fill="#6BA3BC" font-family="Noto Sans KR,sans-serif" font-weight="600">한강</text>

      <g v-for="d in SEOUL_DISTRICTS" :key="d.id" :style="{ cursor: isDisabled(d.id) ? 'not-allowed' : 'pointer' }">
        <polygon
          :points="d.pts"
          :fill="districtColor(d)"
          :fill-opacity="districtOpacity(d)"
          stroke="white"
          stroke-width="1.5"
          @mouseenter="hovered = d.id"
          @mouseleave="hovered = null"
          @click="!isDisabled(d.id) && toggle(d.id)"
        />
        <text
          :x="d.cx"
          :y="d.cy + 4"
          text-anchor="middle"
          :font-size="isSelected(d.id) ? 10 : 9"
          :font-weight="isSelected(d.id) ? '700' : '500'"
          :fill="isSelected(d.id) ? 'white' : isDisabled(d.id) ? '#9ABFA6' : '#1A2C21'"
          font-family="Noto Sans KR,sans-serif"
          style="pointer-events: none; user-select: none"
        >
          {{ d.id.replace("구", "") }}
        </text>
      </g>

      <g v-for="(lm, i) in LANDMARKS" :key="i" style="pointer-events: none; user-select: none">
        <path
          d="M0,-11 C-5,-11 -7,-7 -7,-4 C-7,1 0,7 0,7 C0,7 7,1 7,-4 C7,-7 5,-11 0,-11 Z"
          :transform="`translate(${lm.x},${lm.y - 1})`"
          :fill="isSelected(lm.district) ? '#ffffff' : isDisabled(lm.district) ? 'rgba(160,190,165,0.45)' : '#2D7A4F'"
          :stroke="isSelected(lm.district) ? 'rgba(255,255,255,0.4)' : isDisabled(lm.district) ? 'transparent' : '#1A4A28'"
          stroke-width="0.8"
        />
        <circle :cx="lm.x" :cy="lm.y - 5" r="2.5" :fill="isSelected(lm.district) ? 'rgba(45,122,79,0.7)' : isDisabled(lm.district) ? 'transparent' : 'rgba(255,255,255,0.85)'" />
        <rect :x="lm.x + 9" :y="lm.y - 14" :width="landmarkLabelWidth(lm.name)" height="11" rx="3.5" :fill="isSelected(lm.district) ? 'rgba(0,0,0,0.22)' : isDisabled(lm.district) ? 'transparent' : 'rgba(255,255,255,0.75)'" />
        <text :x="lm.x + 13" :y="lm.y - 6.5" font-size="8" font-weight="700" :fill="isSelected(lm.district) ? '#ffffff' : isDisabled(lm.district) ? 'rgba(150,180,155,0.4)' : '#1A4A28'" font-family="Noto Sans KR,sans-serif" letter-spacing="-0.3">
          {{ lm.name }}
        </text>
      </g>
    </svg>

    <div class="flex items-center justify-between mt-3">
      <div class="flex flex-wrap gap-2">
        <span v-if="modelValue.length === 0" class="text-xs text-muted-foreground">서울 전 지역 대상</span>
        <button
          v-for="id in modelValue"
          :key="id"
          @click="emit('update:modelValue', modelValue.filter((x) => x !== id))"
=======
    <div
      v-if="hoveredDistrict"
      class="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-lg"
    >
      {{ hoveredDistrict }}
      {{
        isSelected(hoveredDistrict)
          ? '✓ 선택됨'
          : modelValue.length >= max
            ? '(최대 선택)'
            : '— 클릭하여 선택'
      }}
    </div>

    <div id="step-map" class="w-full rounded-xl overflow-hidden" style="height: 360px"></div>

    <div class="flex items-center justify-between mt-3">
      <div class="flex flex-wrap gap-2">
        <span v-if="modelValue.length === 0" class="text-xs text-muted-foreground"
          >서울 전 지역 대상</span
        >
        <button
          v-for="id in modelValue"
          :key="id"
          @click="
            emit(
              'update:modelValue',
              modelValue.filter((x) => x !== id),
            )
          "
>>>>>>> 57e716e (Initial commit)
          class="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {{ id }} <X :size="11" />
        </button>
      </div>
      <span class="text-xs text-muted-foreground">{{ modelValue.length }}/{{ max }}</span>
    </div>
  </div>
</template>
<<<<<<< HEAD
=======

<style scoped>
:deep(.district-label) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-weight: 600;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

:deep(.district-label:hover) {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
  transform: scale(1.05);
}
</style>
>>>>>>> 57e716e (Initial commit)
