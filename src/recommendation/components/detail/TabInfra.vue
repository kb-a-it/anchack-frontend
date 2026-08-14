<script setup>
import { computed } from 'vue'
import { Dumbbell, Store, Hospital, Trees, Building2, ShoppingBag } from 'lucide-vue-next'
import NeighborhoodMap from './NeighborhoodMap.vue'

const props = defineProps({
  n: { type: Object, required: true },
  hash: { type: Number, required: true },
})

const items = computed(() => [
  { label: '헬스장', count: props.n.gyms, icon: Dumbbell, threshold: 4, good: props.n.gyms >= 4 },
  {
    label: '편의점',
    count: props.n.convenience,
    icon: Store,
    threshold: 7,
    good: props.n.convenience >= 7,
  },
  {
    label: '병원/약국',
    count: props.n.hospitals,
    icon: Hospital,
    threshold: 3,
    good: props.n.hospitals >= 3,
  },
  { label: '공원', count: props.n.parks, icon: Trees, threshold: 2, good: props.n.parks >= 2 },
  {
    label: '백화점',
    count: props.n.department ?? 0,
    icon: Building2,
    threshold: 1,
    good: (props.n.department ?? 0) >= 1,
  },
  {
    label: '대형마트',
    count: props.n.mart ?? 0,
    icon: ShoppingBag,
    threshold: 1,
    good: (props.n.mart ?? 0) >= 1,
  },
])
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-2.5">
      <div
        v-for="item in items"
        :key="item.label"
        :class="`border rounded-xl p-2.5 text-center ${item.good ? 'bg-secondary border-primary/20' : 'bg-card border-border'}`"
      >
        <component
          :is="item.icon"
          :size="18"
          :stroke-width="1.8"
          class="mx-auto text-primary mb-1"
        />
        <p :class="`text-base font-bold mb-0.5 ${item.good ? 'text-primary' : 'text-foreground'}`">
          {{ item.count }}곳
        </p>
        <p class="text-[11px] text-muted-foreground">{{ item.label }}</p>
        <p v-if="item.good" class="text-[10px] text-primary font-semibold mt-0.5">✓ 충족</p>
        <p v-else class="text-[10px] text-muted-foreground/70 mt-0.5">
          {{ item.threshold }}곳 이상 기준
        </p>
      </div>
    </div>
    <NeighborhoodMap :dong="n.id" :hash="hash" mode="infra" />
  </div>
</template>
