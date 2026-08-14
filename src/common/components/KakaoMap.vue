<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { loadKakaoMap } from "../utils/loadKakaoMap";

const props = defineProps({
  latitude: {
    type: Number,
    default: 37.5665,
  },
  longitude: {
    type: Number,
    default: 126.978,
  },
  level: {
    type: Number,
    default: 4,
  },
  markerTitle: {
    type: String,
    default: "선택 위치",
  },
});

const mapContainer = ref(null);
const loading = ref(true);
const errorMessage = ref("");

let map = null;
let marker = null;

const updateMapLocation = () => {
  if (!map || !window.kakao?.maps) {
    return;
  }

  const position = new window.kakao.maps.LatLng(
    props.latitude,
    props.longitude
  );

  map.setCenter(position);
  map.setLevel(props.level);

  if (marker) {
    marker.setPosition(position);
  }
};

const initializeMap = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const kakao = await loadKakaoMap();

    const center = new kakao.maps.LatLng(
      props.latitude,
      props.longitude
    );

    map = new kakao.maps.Map(mapContainer.value, {
      center,
      level: props.level,
    });

    marker = new kakao.maps.Marker({
      map,
      position: center,
      title: props.markerTitle,
    });
  } catch (error) {
    console.error(error);
    errorMessage.value =
      error.message || "지도를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.latitude, props.longitude, props.level],
  updateMapLocation
);

onMounted(() => {
  initializeMap();
});

onBeforeUnmount(() => {
  if (marker) {
    marker.setMap(null);
  }

  marker = null;
  map = null;
});
</script>

<template>
  <div class="relative w-full h-full min-h-[400px]">
    <div
      ref="mapContainer"
      class="w-full h-full min-h-[400px] rounded-2xl"
    />

    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80"
    >
      지도를 불러오는 중이에요.
    </div>

    <div
      v-if="errorMessage"
      class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-6 text-center text-sm text-red-500"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
