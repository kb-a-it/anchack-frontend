<template>
  <div class="map-wrapper">
    <!-- 지도가 그려질 영역 -->
    <div ref="mapContainer" style="width: 100%; height: 600px"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 1. 저장해둔 GeoJSON 파일 불러오기
import seoulDataRaw from '@/assets/seoul_gu.geojson?raw'

const seoulData = JSON.parse(seoulDataRaw)
const mapContainer = ref(null)

onMounted(() => {
  // 2. ECharts에 불러온 GeoJSON 데이터를 'seoul'이라는 이름으로 등록
  echarts.registerMap('seoul', seoulData)

  // 3. 차트(지도) 인스턴스 초기화
  const myChart = echarts.init(mapContainer.value)

  // 4. 지도 옵션 및 디자인 설정
  const option = {
    title: {
      text: '서울시 지역구 지도',
      left: 'center',
    },
    // 툴팁 설정: 마우스를 올렸을 때 마우스 커서 옆에 뜨는 정보창
    tooltip: {
      trigger: 'item',
      // {b}는 series 안에서 매핑된 데이터 이름(nameProperty)을 출력
      formatter: '{b}',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // 툴팁 배경색 (선택 사항)
      textStyle: {
        color: '#fff', // 툴팁 글자색 (선택 사항)
      },
    },
    series: [
      {
        name: '서울시',
        type: 'map',
        map: 'seoul',
        roam: true,

        // GeoJSON 속성에서 행정동 이름이 들어있는 Key 값
        nameProperty: 'SIGUNGU_NM',

        // 1. 기본 상태의 디자인 (녹색)
        itemStyle: {
          areaColor: '#A5D6A7', // 연한 녹색
          borderColor: '#FFFFFF', // 경계선 흰색
          borderWidth: 1,
        },

        // 2. 마우스 호버(Hover) 시 디자인 (해당 구역만 강조)
        emphasis: {
          // 지도 위 구역 한가운데에 텍스트를 띄울지 여부 (툴팁만 원하면 false로 변경)
          label: {
            show: true,
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          itemStyle: {
            areaColor: '#2E7D32', // 마우스가 올라간 구역만 짙은 녹색으로 강조
            shadowBlur: 10, // 약간의 그림자 효과 추가
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  // 5. 옵션을 적용하여 지도 그리기
  myChart.setOption(option)

  // 6. 클릭 이벤트 리스너 연동
  myChart.on('click', (params) => {
    alert(`${params.name} 지역을 선택하셨습니다!`)
    console.log('클릭된 구역 데이터:', params)
  })
})
</script>
