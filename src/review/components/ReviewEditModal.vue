<script setup>
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import StarInput from '../../common/components/StarInput.vue'
import { REVIEW_CATEGORIES, CATEGORY_LABEL_TO_CODE } from '../constants.js'
import { updateReview } from '../api/review.js'

const props = defineProps({
  review: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const overallRating = ref(props.review.overallRating)
const catRatings = ref({ ...props.review.ratings })
const content = ref(props.review.content)
const isAnonymous = ref(!!props.review.anonymous)

const submitting = ref(false)
const submitError = ref('')

const hasAllCategoryRatings = computed(() =>
  REVIEW_CATEGORIES.every((category) => {
    const score = catRatings.value[category]
    return score >= 1 && score <= 5
  }),
)

const canSave = computed(
  () =>
    overallRating.value > 0 &&
    content.value.trim().length >= 20 &&
    hasAllCategoryRatings.value &&
    !submitting.value,
)

function buildCategoryScores() {
  const categoryScores = {}

  REVIEW_CATEGORIES.forEach((category) => {
    const categoryCode = CATEGORY_LABEL_TO_CODE[category]
    categoryScores[categoryCode] = catRatings.value[category]
  })

  return categoryScores
}

async function save() {
  if (!canSave.value) {
    submitError.value = '필수 입력 항목을 모두 확인해주세요.'
    return
  }

  const reviewId = props.review.reviewId ?? props.review.id

  submitting.value = true
  submitError.value = ''

  try {
    const response = await updateReview(reviewId, {
      overallRating: overallRating.value,
      content: content.value.trim(),
      anonymous: isAnonymous.value,
      categoryScores: buildCategoryScores(),
    })

    // 실제 DB에 반영된 최신 리뷰를 부모 컴포넌트로 전달한다.
    emit('updated', response.data)
  } catch (error) {
    console.error('리뷰 수정 실패:', error.response?.data || error)

    const status = error.response?.status
    const responseMessage = error.response?.data?.message

    if (status === 401) {
      submitError.value = '로그인이 만료되었습니다. 다시 로그인해주세요.'
    } else if (status === 403) {
      submitError.value = responseMessage || '본인이 작성한 리뷰만 수정할 수 있습니다.'
    } else if (status === 400) {
      submitError.value = responseMessage || '리뷰 입력 내용을 확인해주세요.'
    } else {
      submitError.value = responseMessage || '리뷰 수정에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    @click="emit('close')"
  >
    <div
      class="bg-card w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border border-border"
      @click.stop
    >
      <div
        class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10"
      >
        <div>
          <h2 class="font-bold text-foreground text-lg">리뷰 수정</h2>
          <p class="text-xs text-muted-foreground">{{ review.district }} {{ review.dong }}</p>
        </div>
        <button @click="emit('close')" aria-label="닫기" class="p-1.5 rounded-lg hover:bg-muted">
          <X :size="18" class="text-muted-foreground" />
        </button>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-semibold text-foreground mb-3"
            >총 별점 <span class="text-red-500">*</span></label
          >
          <div class="flex items-center gap-3">
            <StarInput v-model="overallRating" :size="30" />
            <span class="text-xl font-bold text-foreground">{{
              overallRating > 0 ? `${overallRating}.0` : '—'
            }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-3"
            >항목별 별점 <span class="text-red-500">*</span></label
          >
          <div class="bg-muted/40 rounded-xl p-4 space-y-3">
            <div v-for="cat in REVIEW_CATEGORIES" :key="cat" class="flex items-center gap-4">
              <span class="text-sm font-medium text-foreground w-16 flex-shrink-0">{{ cat }}</span>
              <StarInput
                :model-value="catRatings[cat] ?? 0"
                @update:model-value="(v) => (catRatings[cat] = v)"
                :size="20"
              />
              <span class="text-sm font-semibold w-6">{{ catRatings[cat] || '—' }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-foreground mb-2"
            >내용 <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="content"
            rows="4"
            maxlength="500"
            class="w-full bg-muted rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p
            :class="`text-xs mt-1 text-right ${content.trim().length < 20 ? 'text-muted-foreground' : 'text-primary'}`"
          >
            {{ content.length }}/500자
          </p>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-semibold text-foreground">익명으로 표시</label>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ isAnonymous ? '작성자 정보가 익명으로 표시돼요' : '닉네임으로 게시돼요' }}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isAnonymous"
            :aria-label="isAnonymous ? '익명 표시 끄기' : '익명 표시 켜기'"
            :class="[
              'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
              isAnonymous ? 'bg-primary' : 'bg-muted-foreground/30',
            ]"
            @click="isAnonymous = !isAnonymous"
          >
            <span
              :class="[
                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                isAnonymous ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>

        <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>

        <button
          :disabled="!canSave"
          @click="save"
          class="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ submitting ? '수정 중...' : '수정 완료' }}
        </button>
      </div>
    </div>
  </div>
</template>
