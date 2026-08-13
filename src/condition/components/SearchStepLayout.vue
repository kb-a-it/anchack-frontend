<script setup>
import { ChevronLeft } from "lucide-vue-next";

// step/STEP_LABELS는 이제 부모(SearchInputView.vue)가 프로그레스바를 그리는 데 쓰고,
// 여기서는 title/subtitle/버튼만 담당한다. (프로그레스바가 스텝마다 재마운트되어
// 순간이동하듯 넘어가는 문제를 막기 위해, 프로그레스바를 부모로 끌어올렸다.)
defineProps({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  canNext: { type: Boolean, default: true },
  hasPrev: { type: Boolean, default: false },
});
const emit = defineEmits(["next", "prev"]);
</script>

<template>
  <div>
    <h1 class="text-[28px] font-bold text-foreground leading-snug mb-2">{{ title }}</h1>
    <p v-if="subtitle" class="text-sm text-muted-foreground mb-7">{{ subtitle }}</p>
    <div v-else class="mb-7" />

    <slot />

    <div class="flex justify-between items-center mt-10">
      <button v-if="hasPrev" @click="emit('prev')" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium"><ChevronLeft :size="16" /> 이전</button>
      <div v-else />
      <button @click="emit('next')" :disabled="!canNext" class="bg-primary text-primary-foreground font-semibold px-9 py-3 rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">다음</button>
    </div>
  </div>
</template>
