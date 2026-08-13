<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, value, color }]
  size: { type: Number, default: 140 },
  thickness: { type: Number, default: 18 },
  centerLabel: { type: String, default: '' },
  centerValue: { type: String, default: '' },
})

const radius = computed(() => (props.size - props.thickness) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0) || 1)

// 처음 나타날 때 0에서부터 자연스럽게 그려지도록
const grown = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    grown.value = true
  })
})

// 각 구간의 dasharray/offset을 미리 계산해서, 도넛 위에 이어 붙여 그린다
const segments = computed(() => {
  let cumulative = 0
  return props.data.map((d) => {
    const fraction = d.value / total.value
    const dash = grown.value ? fraction * circumference.value : 0
    const seg = {
      ...d,
      fraction,
      dasharray: `${dash} ${circumference.value - dash}`,
      dashoffset: -cumulative,
    }
    cumulative += grown.value ? dash : 0
    return seg
  })
})
</script>

<template>
  <div class="inline-flex items-center gap-5">
    <div class="relative flex-shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
        <g :transform="`rotate(-90 ${size / 2} ${size / 2})`">
          <circle
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            fill="none"
            stroke="#EEF1EE"
            :stroke-width="thickness"
          />
          <circle
            v-for="seg in segments"
            :key="seg.label"
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            fill="none"
            :stroke="seg.color"
            :stroke-width="thickness"
            :stroke-dasharray="seg.dasharray"
            :stroke-dashoffset="seg.dashoffset"
            stroke-linecap="round"
            class="donut-segment"
          />
        </g>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-lg font-bold text-foreground leading-none">{{ centerValue }}</span>
        <span class="text-[10px] text-muted-foreground mt-1">{{ centerLabel }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2.5">
      <div v-for="seg in segments" :key="seg.label" class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: seg.color }" />
        <span class="text-xs text-muted-foreground w-16">{{ seg.label }}</span>
        <span class="text-xs font-semibold text-foreground">{{ seg.value }}분</span>
        <span class="text-[11px] text-muted-foreground/70"
          >({{ Math.round(seg.fraction * 100) }}%)</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.donut-segment {
  transition:
    stroke-dasharray 0.6s ease,
    stroke-dashoffset 0.6s ease;
}
</style>
