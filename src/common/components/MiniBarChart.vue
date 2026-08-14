<script setup>
import { ref, onMounted } from 'vue'

// recharts의 BarChart를 대체하는 간단한 자체 구현입니다.
// (recharts는 React 전용이라 그대로 옮길 수 없어요. 필요시 vue-chartjs로 교체하세요.)
const props = defineProps({
  data: { type: Array, required: true }, // [{ label, value, unit }]
  colorFor: { type: Function, default: null }, // (value) => color
  height: { type: Number, default: 180 },
})

function barColor(v) {
  if (props.colorFor) return props.colorFor(v)
  return '#A8D5A0'
}
const max = Math.max(...props.data.map((d) => d.value), 1)

// 처음 나타날 때 0에서부터 자연스럽게 자라나도록
const grown = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    grown.value = true
  })
})
</script>

<template>
  <div class="flex items-end gap-3" :style="{ height: height + 'px' }">
    <div
      v-for="d in data"
      :key="d.label"
      class="flex-1 flex flex-col items-center justify-end h-full"
    >
      <span class="text-xs font-semibold text-foreground mb-1"
        >{{ d.value }}{{ d.unit || '' }}</span
      >
      <div
        class="w-full rounded-t-md transition-all duration-700 ease-out"
        :style="{
          height: (grown ? (d.value / max) * (height - 40) : 0) + 'px',
          background: barColor(d.value),
        }"
      />
      <span class="text-[11px] text-muted-foreground mt-2 text-center">{{ d.label }}</span>
    </div>
  </div>
</template>
