<script setup>
import { computed, reactive, ref } from "vue";
import { Check, X } from "lucide-vue-next";
import StarInput from "../../common/components/StarInput.vue";
import StarDisplay from "../../common/components/StarDisplay.vue";
import { REVIEW_CATEGORIES, CATEGORY_LABEL_TO_CODE } from "../constants.js";
import { createReview } from "../api/review.js";

const props = defineProps({
  adminDongId: {
    type: Number,
    required: true,
  },

  adminDongName: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "close",
  "created",
]);

const content = ref("");
const isAnonymous = ref(false);

const submitted = ref(false);
const submitting = ref(false);
const submitError = ref("");

const catRatings = reactive({
  소음: 0,
  청결: 0,
  치안: 0,
  분위기: 0,
  교통: 0,
});

/*
 * 항목별 별점이 모두 입력되었는지 확인한다.
 */
const hasAllCategoryRatings = computed(() => {
  return REVIEW_CATEGORIES.every((category) => {
    const score = catRatings[category];

    return score >= 1 && score <= 5;
  });
});

/*
 * [수정] "총 별점"을 항목별 별점과 무관하게 따로 입력받다 보니,
 * 항목별 별점 평균과 화면에 표시되는 종합 평점이 서로 어긋나는
 * (예: 항목별 평균 3.2점인데 종합 평점은 2.0점) 문제가 있었다.
 * 종합 평점은 항목별 별점 5개의 평균을 반올림해 자동으로 계산한다.
 */
const overallRating = computed(() => {
  if (!hasAllCategoryRatings.value) {
    return 0;
  }

  const sum = REVIEW_CATEGORIES.reduce(
    (acc, category) => acc + catRatings[category],
    0,
  );

  return Math.round(sum / REVIEW_CATEGORIES.length);
});

/*
 * 리뷰 등록 버튼 활성화 조건
 */
const canSubmit = computed(() => {
  return (
    props.adminDongId != null &&
    overallRating.value >= 1 &&
    overallRating.value <= 5 &&
    hasAllCategoryRatings.value &&
    content.value.trim().length >= 20 &&
    !submitting.value
  );
});

/*
 * 백엔드 DTO 형식에 맞는
 * categoryScores 객체를 생성한다.
 */
const createCategoryScores = () => {
  const categoryScores = {};

  REVIEW_CATEGORIES.forEach((category) => {
    const categoryCode =
      CATEGORY_LABEL_TO_CODE[category];

    categoryScores[categoryCode] =
      catRatings[category];
  });

  return categoryScores;
};

/*
 * 리뷰 등록 API 호출
 */
const handleSubmit = async () => {
  if (!canSubmit.value) {
    submitError.value =
      "필수 입력 항목을 모두 확인해주세요.";
    return;
  }

  const accessToken =
    localStorage.getItem("accessToken");

  if (!accessToken) {
    submitError.value =
      "로그인 후 리뷰를 작성할 수 있습니다.";
    return;
  }

  submitting.value = true;
  submitError.value = "";

  const requestData = {
    adminDongId: props.adminDongId,
    overallRating: overallRating.value,
    content: content.value.trim(),
    anonymous: isAnonymous.value,
    categoryScores: createCategoryScores(),
  };

  try {
    const response = await createReview(requestData);

    /*
     * API 요청과 DB 저장이 성공한 경우에만
     * 완료 화면을 표시한다.
     */
    submitted.value = true;

    /*
     * 부모 컴포넌트에 저장된 리뷰를 전달한다.
     */
    emit("created", response.data);
  } catch (error) {
    console.error(
      "리뷰 등록 실패:",
      error.response?.data || error
    );

    const status = error.response?.status;
    const responseMessage =
      error.response?.data?.message;

    if (status === 401) {
      submitError.value =
        "로그인이 만료되었습니다. 다시 로그인해주세요.";
    } else if (status === 400) {
      submitError.value =
        responseMessage ||
        "리뷰 입력 내용을 확인해주세요.";
    } else if (status === 404) {
      submitError.value =
        responseMessage ||
        "선택한 행정동 정보를 찾을 수 없습니다.";
    } else {
      submitError.value =
        responseMessage ||
        "리뷰 등록에 실패했습니다. 잠시 후 다시 시도해주세요.";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <!--
      화면 중앙에 뜨는 모달 영역

      [수정] 배경(오버레이)을 클릭하면 모달이 바로 닫혀서, 리뷰를 작성하던 중
      실수로 배경을 클릭하면 입력 내용이 통째로 사라지는 문제가 있었다.
      배경 클릭으로는 닫히지 않고, 우측 상단 X 버튼으로만 닫히도록 한다.
    -->
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <!-- 리뷰 작성 패널 -->
      <section
        class="flex w-full max-w-[574px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <!-- 헤더 -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-5"
        >
          <div>
            <h2
              id="review-modal-title"
              class="text-xl font-bold text-foreground"
            >
              리뷰 작성
            </h2>

            <p
              v-if="adminDongName"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ adminDongName }}
            </p>
          </div>

          <button
            type="button"
            aria-label="닫기"
            class="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            @click="emit('close')"
          >
            <X
              :size="20"
              class="text-muted-foreground"
            />
          </button>
        </div>

        <!-- 스크롤 가능한 내용 영역 -->
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <!-- 등록 완료 화면 -->
          <div
            v-if="submitted"
            class="flex min-h-full flex-col items-center justify-center p-12 text-center"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary"
            >
              <Check
                :size="28"
                class="text-primary"
              />
            </div>

            <h3 class="mb-2 text-xl font-bold text-foreground">
              리뷰가 등록되었어요!
            </h3>

            <p class="mb-6 text-sm text-muted-foreground">
              소중한 경험을 공유해 주셔서 감사해요.
            </p>

            <button
              type="button"
              class="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              @click="emit('close')"
            >
              닫기
            </button>
          </div>

          <!-- 리뷰 작성 화면 -->
          <div
            v-else
            class="space-y-6 p-6"
          >
            <!-- 항목별 별점 -->
            <div>
              <label
                class="mb-3 block text-sm font-semibold text-foreground"
              >
                항목별 별점
                <span class="text-red-500">*</span>
              </label>

              <div class="space-y-3 rounded-xl bg-muted/40 p-4">
                <div
                  v-for="category in REVIEW_CATEGORIES"
                  :key="category"
                  class="flex items-center gap-4"
                >
                  <span
                    class="w-16 flex-shrink-0 text-sm font-medium text-foreground"
                  >
                    {{ category }}
                  </span>

                  <StarInput
                    :model-value="catRatings[category]"
                    :size="20"
                    @update:model-value="
                      (value) => {
                        catRatings[category] = value;
                      }
                    "
                  />

                  <span
                    class="w-6 text-sm font-semibold text-foreground"
                  >
                    {{ catRatings[category] || "—" }}
                  </span>
                </div>
              </div>
            </div>

            <!--
              총 별점

              [수정] 항목별 별점과 별개로 직접 입력받지 않고,
              항목별 별점 5개의 평균으로 자동 계산해서 보여준다.
            -->
            <div>
              <label
                class="mb-3 block text-sm font-semibold text-foreground"
              >
                종합 평점
              </label>

              <div class="flex items-center gap-3">
                <StarDisplay
                  :rating="overallRating"
                  :size="30"
                />

                <span class="text-xl font-bold text-foreground">
                  {{
                    overallRating > 0
                      ? `${overallRating}.0`
                      : "—"
                  }}
                </span>
              </div>

              <p class="mt-1.5 text-xs text-muted-foreground">
                항목별 별점의 평균으로 자동 계산돼요.
              </p>
            </div>

            <!-- 리뷰 내용 -->
            <div>
              <label
                class="mb-2 block text-sm font-semibold text-foreground"
              >
                내용
                <span class="text-red-500">*</span>

                <span
                  class="text-xs font-normal text-muted-foreground"
                >
                  (최소 20자)
                </span>
              </label>

              <textarea
                v-model="content"
                maxlength="500"
                placeholder="이 동네에 살면서 느낀 점을 자유롭게 작성해주세요."
                rows="5"
                class="w-full resize-none rounded-xl border-0 bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
              />

              <p
                :class="[
                  'mt-1 text-right text-xs',
                  content.trim().length < 20
                    ? 'text-muted-foreground'
                    : 'text-primary',
                ]"
              >
                {{ content.length }}/500자
              </p>
            </div>

            <!-- 익명 작성 -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-semibold text-foreground">
                  익명으로 작성
                </label>

                <p class="mt-0.5 text-xs text-muted-foreground">
                  {{
                    isAnonymous
                      ? "작성자 정보가 익명으로 표시돼요"
                      : "로그인한 사용자의 닉네임으로 게시돼요"
                  }}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                :aria-checked="isAnonymous"
                :aria-label="
                  isAnonymous
                    ? '익명 작성 끄기'
                    : '익명 작성 켜기'
                "
                :class="[
                  'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                  isAnonymous
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30',
                ]"
                @click="isAnonymous = !isAnonymous"
              >
                <span
                  :class="[
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    isAnonymous
                      ? 'translate-x-5'
                      : 'translate-x-0',
                  ]"
                />
              </button>
            </div>

            <!-- 등록 오류 메시지 -->
            <div
              v-if="submitError"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <p class="text-sm text-red-600">
                {{ submitError }}
              </p>
            </div>

            <!-- 등록 버튼 -->
            <button
              type="button"
              :disabled="!canSubmit || submitting"
              class="w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              @click="handleSubmit"
            >
              {{ submitting ? "등록 중..." : "리뷰 등록하기" }}
            </button>

            <p class="pb-2 text-center text-xs text-muted-foreground">
              허위 정보 작성 시 제재를 받을 수 있어요.
            </p>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
