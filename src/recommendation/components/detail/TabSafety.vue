<script setup>
import { computed } from 'vue'
import { Shield } from 'lucide-vue-next'
import RadialGauge from '../../../common/components/RadialGauge.vue'
import NeighborhoodMap from './NeighborhoodMap.vue'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const scoreColor = (v) =>
  v === 100
    ? '#F0B87A'
    : v >= 90
      ? '#F2A8C0'
      : v >= 80
        ? '#B8AEDD'
        : v >= 70
          ? '#8EC8E8'
          : '#A8D5A0'

const gauges = computed(() => [
  { label: 'CCTV 밀도', value: Math.round(props.n.cctv * 30) },
  { label: '야간 안전도', value: props.n.safetyScore },
  { label: '경찰 접근성', value: 75 },
])
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="item in [
          { label: '종합 안전 점수', val: `${n.safetyScore}점` },
          { label: '100m당 CCTV', val: `${n.cctv}대` },
          { label: '인구 1000명당 범죄', val: `${n.crimeRate}건` },
        ]"
        :key="item.label"
        class="bg-card border border-border rounded-2xl p-5 text-center"
      >
        <p class="text-2xl font-bold text-primary mb-1">{{ item.val }}</p>
        <p class="text-xs text-muted-foreground">{{ item.label }}</p>
      </div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-6">
      <h4 class="font-semibold text-foreground mb-5">항목별 안전 지표</h4>
      <div class="flex justify-around">
        <RadialGauge
          v-for="item in gauges"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :color="scoreColor(item.value)"
        />
      </div>
    </div>
    <div class="bg-card border border-border rounded-2xl p-5 flex items-start gap-3">
      <Shield :size="18" class="text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p class="font-semibold text-foreground text-sm mb-1">가까운 경찰관서</p>
        <p class="text-sm text-foreground/80">{{ n.police }}</p>
      </div>
    </div>
    <NeighborhoodMap :dong="n.id" :hash="hash" mode="safety" />
  </div>
</template>
