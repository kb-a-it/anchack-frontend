<script setup>
import { X, MapPin, BookOpen } from 'lucide-vue-next'

defineProps({ savedConditions: { type: Array, required: true } })
const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="emit('close')"
  >
    <div
      class="bg-card w-full max-w-[460px] rounded-2xl shadow-2xl border border-border overflow-hidden"
      @click.stop
    >
      <div class="px-6 pt-6 pb-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-foreground">저장된 조건</h3>
          <p class="text-xs text-muted-foreground mt-0.5">마이페이지에서도 확인할 수 있어요.</p>
        </div>
        <button @click="emit('close')" aria-label="닫기" class="p-1.5 rounded-lg hover:bg-muted">
          <X :size="18" class="text-muted-foreground" />
        </button>
      </div>
      <div class="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div
          v-if="savedConditions.length === 0"
          class="py-14 text-center text-sm text-muted-foreground"
        >
          저장된 조건이 없어요.
        </div>
        <ul v-else class="divide-y divide-border/60">
          <li v-for="c in savedConditions" :key="c.id" class="px-6 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-foreground text-sm truncate">{{ c.title }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ c.date }}</p>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-if="c.state.addressTab === 'known' && c.state.detailAddress"
                    class="inline-flex items-center gap-1 text-[11px] bg-muted px-2 py-0.5 rounded-full text-foreground/70"
                  >
                    <MapPin :size="9" /> {{ c.state.detailAddress }}
                  </span>
                  <span
                    v-if="c.state.monthly > 0"
                    class="inline-flex items-center gap-1 text-[11px] bg-muted px-2 py-0.5 rounded-full text-foreground/70"
                    >월세 {{ c.state.monthly }}만원 이하</span
                  >
                  <span
                    v-for="p in c.state.priorities.slice(0, 2)"
                    :key="p"
                    class="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >{{ p }}</span
                  >
                </div>
              </div>
              <BookOpen :size="14" class="text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
