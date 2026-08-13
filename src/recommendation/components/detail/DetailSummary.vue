<script setup>
import { CheckCircle2, AlertTriangle } from 'lucide-vue-next'
defineProps({ n: { type: Object, required: true } })
</script>

<template>
  <div class="grid grid-cols-2 gap-5 mb-8">
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-4">
        <CheckCircle2 :size="15" class="text-emerald-700" />
        <h3 class="font-semibold text-emerald-700 text-sm">이 동네를 추천한 이유</h3>
      </div>
      <ul class="space-y-2.5">
        <li
          v-for="(p, i) in n.pros"
          :key="i"
          class="text-sm text-foreground flex items-start gap-2.5"
        >
          <CheckCircle2 :size="15" class="text-emerald-600 mt-0.5 flex-shrink-0" />
          {{ p }}
        </li>
      </ul>
    </div>
    <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-4">
        <AlertTriangle :size="15" class="text-red-500" />
        <h3 class="font-semibold text-red-700 text-sm">미리 알아둘 점</h3>
      </div>
      <ul class="space-y-2.5">
        <li
          v-for="(c, i) in n.cons"
          :key="i"
          class="text-sm text-foreground flex items-start gap-2.5"
        >
          <AlertTriangle :size="15" class="text-red-500 mt-0.5 flex-shrink-0" />
          {{ c }}
        </li>
      </ul>
    </div>
  </div>
</template>
