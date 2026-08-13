<script setup>
import { X, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  savedConditions: { type: Array, required: true },
  mode: { type: String, default: 'conditions' }, // "conditions" | "results"
})
const emit = defineEmits(['navigate', 'delete', 'load'])
</script>

<template>
  <div v-if="mode === 'conditions'">
    <h2 class="text-lg font-bold text-foreground mb-5">저장한 조건</h2>
    <div
      v-if="savedConditions.length === 0"
      class="text-center py-20 bg-card border border-border rounded-2xl"
    >
      <div class="text-4xl mb-4">📋</div>
      <p class="font-semibold text-foreground mb-1">저장한 조건이 없어요</p>
      <p class="text-sm text-muted-foreground mb-6">
        동네 찾기 결과 화면에서 조건을 저장할 수 있어요.
      </p>
      <button
        @click="emit('navigate', 'step1')"
        class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90"
      >
        동네 찾기 시작
      </button>
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="c in savedConditions"
        :key="c.id"
        class="bg-card border border-border rounded-2xl p-5"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-foreground">{{ c.title }}</h3>
            <p class="text-xs text-muted-foreground mt-0.5">{{ c.date }} 저장</p>
          </div>
          <button
            @click="emit('delete', c.id)"
            aria-label="저장된 조건 삭제"
            class="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X :size="14" />
          </button>
        </div>
        <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span class="bg-muted px-2.5 py-1 rounded-full"
            >{{ c.state.rentType }} · {{ c.state.monthly }}만원</span
          >
          <span class="bg-muted px-2.5 py-1 rounded-full"
            >통근 {{ c.state.maxCommuteTime }}분 이내</span
          >
          <span v-if="c.state.commuteAreas.length > 0" class="bg-muted px-2.5 py-1 rounded-full">{{
            c.state.commuteAreas.join(', ')
          }}</span>
          <span
            v-for="p in c.state.priorities.slice(0, 2)"
            :key="p"
            class="bg-secondary text-primary px-2.5 py-1 rounded-full font-medium"
            >{{ p }}</span
          >
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <h2 class="text-lg font-bold text-foreground mb-1">저장된 결과</h2>
    <p class="text-sm text-muted-foreground mb-5">
      저장한 검색 조건으로 바로 결과를 확인할 수 있어요.
    </p>
    <div
      v-if="savedConditions.length === 0"
      class="text-center py-20 bg-card border border-border rounded-2xl"
    >
      <div class="text-4xl mb-4">🗺️</div>
      <p class="font-semibold text-foreground mb-1">저장된 결과가 없어요</p>
      <p class="text-sm text-muted-foreground mb-6">
        동네 찾기 결과 화면에서 조건을 저장하면 여기서 바로 확인할 수 있어요.
      </p>
      <button
        @click="emit('navigate', 'step1')"
        class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90"
      >
        동네 찾기 시작
      </button>
    </div>
    <div v-else class="space-y-3">
      <button
        v-for="c in savedConditions"
        :key="c.id"
        @click="emit('load', c)"
        class="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
      >
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-base font-bold text-foreground group-hover:text-primary transition-colors"
                >{{ c.title }}</span
              >
              <span
                class="text-[11px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                >결과 보기 →</span
              >
            </div>
            <p class="text-xs text-muted-foreground mb-3">{{ c.date }} 저장</p>
            <div class="flex flex-wrap gap-1.5">
              <span class="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/70"
                >{{ c.state.rentType }} · 월 {{ c.state.monthly }}만원</span
              >
              <span class="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/70"
                >통근 {{ c.state.maxCommuteTime }}분 이내</span
              >
              <span
                v-if="c.state.commuteAreas.length > 0"
                class="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/70"
                >{{ c.state.commuteAreas.join(', ') }}</span
              >
              <span
                v-for="p in c.state.priorities.slice(0, 2)"
                :key="p"
                class="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                >{{ p }}</span
              >
            </div>
          </div>
          <ChevronRight
            :size="18"
            class="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1 ml-3"
          />
        </div>
      </button>
    </div>
  </div>
</template>
