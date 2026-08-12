<script setup>
import { ref } from "vue";
// 좋아요/싫어요(리뷰 반응) 기능은 review_reactions 테이블이 아직 없어 비활성화했다.
// import { ThumbsUp, ThumbsDown } from "lucide-vue-next";
import StarDisplay from "../../common/components/StarDisplay.vue";
// import { reactToReview } from "../api/review.js";

const props = defineProps({
  review: { type: Object, required: true },
});

const REPORT_REASONS = ["스팸 또는 광고", "욕설 / 혐오 표현", "허위 정보", "개인정보 포함", "기타"];

const reported = ref(false);
const showReportModal = ref(false);
const reportReason = ref("");

function submitReport() {
  reported.value = true;
  showReportModal.value = false;
}

/*
 * 좋아요 / 싫어요
 *
 * review_reactions 테이블이 아직 DB에 없어서 기능 전체를 비활성화했다.
 * 테이블이 추가되면 아래 주석을 해제하고, 템플릿의 버튼 주석도 함께 해제하면 된다.
 */
// const likeCount = ref(props.review.likeCount ?? 0);
// const dislikeCount = ref(props.review.dislikeCount ?? 0);
// const myReaction = ref(props.review.myReaction ?? null);
// const reactionError = ref("");
// const reacting = ref(false);
//
// async function react(reactionType) {
//   if (reacting.value) return;
//
//   const reviewId = props.review.reviewId ?? props.review.id;
//
//   reacting.value = true;
//   reactionError.value = "";
//
//   try {
//     const response = await reactToReview(reviewId, reactionType);
//
//     likeCount.value = response.data.likeCount;
//     dislikeCount.value = response.data.dislikeCount;
//     myReaction.value = response.data.myReaction;
//   } catch (error) {
//     if (error.response?.status === 401) {
//       reactionError.value = "로그인 후 이용할 수 있어요.";
//     } else {
//       reactionError.value =
//         error.response?.data?.message || "반응을 처리하지 못했어요.";
//     }
//   } finally {
//     reacting.value = false;
//   }
// }
</script>

<template>
  <div
    v-if="showReportModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="showReportModal = false"
  >
    <div class="bg-card w-full max-w-[380px] rounded-2xl shadow-2xl border border-border p-6" @click.stop>
      <h3 class="font-bold text-foreground text-base mb-1">리뷰 신고</h3>
      <p class="text-xs text-muted-foreground mb-4">신고 사유를 선택해주세요. 검토 후 조치됩니다.</p>
      <div class="space-y-2 mb-5">
        <button
          v-for="r in REPORT_REASONS"
          :key="r"
          @click="reportReason = r"
          :class="`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${reportReason === r ? 'bg-red-50 border-red-300 text-red-700 font-semibold' : 'border-border hover:bg-muted'}`"
        >
          {{ r }}
        </button>
      </div>
      <div class="flex gap-2.5">
        <button @click="showReportModal = false" class="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted">취소</button>
        <button :disabled="!reportReason" @click="submitReport" class="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed">신고하기</button>
      </div>
    </div>
  </div>

  <div class="bg-card border border-border rounded-2xl p-5">
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <StarDisplay :rating="review.overallRating" :size="14" />
          <span class="text-sm font-bold text-foreground">{{ review.overallRating }}.0</span>
        </div>
      </div>
      <div class="text-right flex-shrink-0 ml-4">
        <p class="text-xs text-muted-foreground">{{ review.author }}</p>
        <p class="text-xs text-muted-foreground">{{ review.date }}</p>
        <button
          @click="!reported && (showReportModal = true)"
          :disabled="reported"
          :class="`mt-2 text-[11px] font-medium transition-colors ${reported ? 'text-muted-foreground cursor-default' : 'text-muted-foreground/60 hover:text-red-500'}`"
        >
          {{ reported ? "신고 완료" : "신고하기" }}
        </button>
      </div>
    </div>
    <p class="text-sm text-foreground/80 leading-relaxed mb-4">{{ review.content }}</p>
    <div class="space-y-2 pt-3 border-t border-border/60">
      <div v-for="(val, cat) in review.ratings" :key="cat" class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-12 flex-shrink-0">{{ cat }}</span>
        <StarDisplay :rating="val" :size="11" />
      </div>
    </div>

    <!--
      좋아요 / 싫어요
      review_reactions 테이블이 아직 DB에 없어서 기능 전체를 비활성화했다.
      테이블이 추가되면 위 script의 관련 주석과 함께 아래 버튼도 주석을 해제하면 된다.

    <div class="flex items-center gap-2 pt-3 mt-3 border-t border-border/60">
      <button
        type="button"
        :disabled="reacting"
        @click="react('LIKE')"
        :class="[
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
          myReaction === 'LIKE'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:text-primary',
        ]"
      >
        <ThumbsUp :size="13" />
        좋아요 {{ likeCount }}
      </button>

      <button
        type="button"
        :disabled="reacting"
        @click="react('DISLIKE')"
        :class="[
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
          myReaction === 'DISLIKE'
            ? 'bg-red-500 text-white'
            : 'bg-secondary text-muted-foreground hover:text-red-500',
        ]"
      >
        <ThumbsDown :size="13" />
        싫어요 {{ dislikeCount }}
      </button>

      <span v-if="reactionError" class="text-xs text-red-500 ml-1">{{ reactionError }}</span>
    </div>
    -->
  </div>
</template>
