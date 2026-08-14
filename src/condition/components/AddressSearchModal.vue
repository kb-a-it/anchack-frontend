<script setup>
import { ref, computed } from 'vue'
import { X, Search, MapPin } from 'lucide-vue-next'
import { MOCK_ADDRESSES } from '../../common/utils/mockData'

const emit = defineEmits(['close', 'select'])
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim()
  if (q.length < 1) return MOCK_ADDRESSES.slice(0, 8)
  return MOCK_ADDRESSES.filter((a) => a.name.includes(q) || a.address.includes(q)).slice(0, 12)
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="emit('close')"
  >
    <div
      class="bg-card w-full max-w-[520px] rounded-2xl shadow-2xl border border-border overflow-hidden"
      @click.stop
    >
      <div class="px-6 pt-6 pb-4 border-b border-border">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-foreground text-lg">회사·학교 주소 검색</h2>
          <button @click="emit('close')" aria-label="닫기" class="p-1.5 rounded-lg hover:bg-muted">
            <X :size="18" class="text-muted-foreground" />
          </button>
        </div>
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <Search
              :size="15"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autofocus
              type="text"
              v-model="query"
              placeholder="회사명, 학교명, 도로명 주소 검색"
              class="w-full bg-muted rounded-xl pl-9 pr-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>
      <div class="max-h-[360px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-muted-foreground">
          검색 결과가 없어요
        </div>
        <ul v-else class="divide-y divide-border/60">
          <li v-for="(item, i) in filtered" :key="i">
            <button
              @click="emit('select', item.name, item.address)"
              class="w-full text-left px-6 py-4 hover:bg-secondary transition-colors flex items-start gap-3"
            >
              <MapPin :size="14" class="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-sm font-semibold text-foreground">{{ item.name }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ item.address }}</p>
              </div>
            </button>
          </li>
        </ul>
      </div>
      <div class="px-6 py-3 bg-muted/40 border-t border-border">
        <p class="text-xs text-muted-foreground">
          주소가 없다면 직접 입력 후 다음 단계로 넘어가주세요.
        </p>
      </div>
    </div>
  </div>
</template>
