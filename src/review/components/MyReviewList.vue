<script setup>
import StarDisplay from "../../common/components/StarDisplay.vue";

const props = defineProps({
  reviews: { type: Array, required: true },
});
const emit = defineEmits(["navigate", "edit", "delete"]);
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-foreground mb-5">내가 쓴 리뷰</h2>

    <div v-if="reviews.length === 0" class="text-center py-20 bg-card border border-border rounded-2xl">
      <div class="text-4xl mb-4">✍️</div>
      <p class="font-semibold text-foreground mb-1">아직 작성한 리뷰가 없어요</p>
      <p class="text-sm text-muted-foreground mb-5">동네 둘러보기에서 첫 리뷰를 남겨보세요.</p>
      <button @click="emit('navigate', 'explore')" class="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90">동네 둘러보기</button>
    </div>

    <div v-else class="space-y-4">
      <div v-for="r in reviews" :key="r.id" class="bg-card border border-border rounded-2xl p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full">{{ r.district }} {{ r.dong }}</span>
            <span class="text-xs text-muted-foreground">{{ r.date }}</span>
            <!-- 익명으로 작성된 리뷰인지 표시. 다른 사용자에게는 닉네임 대신 "익명"으로 보인다는 걸 본인도 확인할 수 있게 -->
            <span v-if="r.anonymous" class="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">익명 공개</span>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0 ml-3">
            <button @click="emit('edit', r)" class="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors">수정</button>
            <button @click="emit('delete', r.id)" class="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">삭제</button>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <StarDisplay :rating="r.overallRating" :size="13" />
          <span class="text-sm font-bold">{{ r.overallRating }}.0</span>
        </div>
        <p class="text-sm text-foreground/75 leading-relaxed line-clamp-2">{{ r.content }}</p>
        <div class="space-y-1.5 mt-3 pt-3 border-t border-border/50">
          <div v-for="(val, cat) in r.ratings" :key="cat" class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground w-12 flex-shrink-0">{{ cat }}</span>
            <StarDisplay :rating="val" :size="11" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
