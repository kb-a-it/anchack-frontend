<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true }, // 0~100
  unit: { type: String, default: '점' },
  color: { type: String, default: '#2D7A4F' },
  size: { type: Number, default: 96 },
  thickness: { type: Number, default: 10 },
})

const radius = computed(() => (props.size - props.thickness) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

// 처음 나타날 때 0에서부터 자연스럽게 채워지도록
const displayValue = ref(0)
onMounted(() => {
  requestAnimationFrame(() => {
    displayValue.value = props.value
  })
})

const clamped = computed(() => Math.max(0, Math.min(100, displayValue.value)))
const dash = computed(() => (clamped.value / 100) * circumference.value)
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
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
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            fill="none"
            :stroke="color"
            :stroke-width="thickness"
            :stroke-dasharray="`${dash} ${circumference - dash}`"
            stroke-linecap="round"
            class="gauge-arc"
          />
        </g>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-base font-bold text-foreground">{{ value }}{{ unit }}</span>
      </div>
    </div>
    <span class="text-xs text-muted-foreground text-center">{{ label }}</span>
  </div>
</template>

<style scoped>
.gauge-arc {
  transition: stroke-dasharray 0.6s ease;
}
</style>
