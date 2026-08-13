<script setup>
import { Heart, Clock, Check, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  n: { type: Object, required: true },
  rank: { type: Number, required: true },
  compareList: { type: Array, required: true },
  isSaved: { type: Boolean, default: false },
})
const emit = defineEmits(['detail', 'compare', 'toggle-save'])
</script>

<template>
  <div
    class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    @click="emit('detail')"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2.5">
        <span
          class="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center"
          >{{ rank }}</span
        >
        <div>
          <h3 class="font-bold text-foreground text-base">{{ n.id }}</h3>
          <p class="text-xs font-bold text-primary">적합도 {{ n.score }}점</p>
        </div>
      </div>
      <button
        @click.stop="emit('toggle-save')"
        :aria-label="isSaved ? '관심 동네에서 삭제' : '관심 동네에 추가'"
        :class="`p-2 -m-1 rounded-full transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`"
      >
        <Heart :size="15" :class="isSaved ? 'fill-primary' : ''" />
      </button>
    </div>
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
      <span class="flex items-center gap-1"
        ><Clock :size="11" /> {{ n.commuteTime }}분 · 환승 {{ n.transfers }}회</span
      >
      <span>월세 {{ n.monthly }}만원</span>
    </div>
    <div class="flex flex-wrap gap-1.5 mb-4">
      <span
        v-for="tag in n.tags"
        :key="tag"
        class="bg-secondary text-primary text-xs px-2.5 py-1 rounded-full font-semibold"
        >{{ tag }}</span
      >
    </div>
    <div class="text-xs space-y-1.5 mb-4">
      <p
        v-for="(p, i) in n.pros.slice(0, 2)"
        :key="i"
        class="text-foreground/75 flex items-start gap-1.5"
      >
        <Check :size="11" class="text-primary mt-0.5 flex-shrink-0" /> {{ p }}
      </p>
      <p v-if="n.cons[0]" class="text-amber-700 flex items-start gap-1.5">
        <span class="flex-shrink-0">⚠</span> {{ n.cons[0] }}
      </p>
    </div>
    <div class="flex gap-2" @click.stop>
      <button
        @click="emit('detail')"
        class="flex-1 text-xs font-semibold text-primary border border-primary/25 rounded-xl py-2 hover:bg-secondary"
      >
        상세 보기 →
      </button>
      <button
        @click="emit('compare')"
        :class="`flex-1 text-xs font-semibold rounded-xl py-2 flex items-center justify-center gap-1.5 border ${compareList.includes(n.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`"
      >
        <RefreshCw :size="11" /> 비교 담기
      </button>
    </div>
  </div>
</template>
