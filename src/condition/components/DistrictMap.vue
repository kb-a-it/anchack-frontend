<script setup>
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
  '#FF0000', '#FF7F00', '#FFD700', '#00CC00', '#00FFFF',
  '#0000FF', '#8B00FF', '#FF1493', '#ADFF2F', '#FF4500',
  '#FFFF00', '#008000', '#1E90FF', '#4B0082', '#EE82EE',
  '#DC143C', '#FF8C00', '#20B2AA', '#4169E1', '#9400D3',
  '#FF69B4', '#00FA9A', '#00BFFF', '#9932CC', '#32CD32',
]

function getComplementaryColor(hex) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('')
  }
  const r = 255 - parseInt(cleanHex.substring(0, 2), 16)
  const g = 255 - parseInt(cleanHex.substring(2, 4), 16)
  const b = 255 - parseInt(cleanHex.substring(4, 6), 16)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function isSelected(id) {
  return props.modelValue.includes(id)
}

function toggle(id) {
  if (isSelected(id)) {
    emit('update:modelValue', props.modelValue.filter((x) => x !== id))
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
    const unwantedElements = container.querySelectorAll(
      'a[href*="kakao.com"], img[src*="kakao"], div[style*="position: absolute"][style*="left: 0px"][style*="bottom: 0px"], .r_layer, .dacr',
    )
    unwantedElements.forEach((el) => el.remove())
  }, 100)

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
}
</script>

<template>
  <div class="relative w-full">
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
          class="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {{ id }} <X :size="11" />
        </button>
      </div>
      <span class="text-xs text-muted-foreground">{{ modelValue.length }}/{{ max }}</span>
    </div>
  </div>
</template>

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
