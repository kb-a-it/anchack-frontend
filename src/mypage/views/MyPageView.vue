<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "../../user/stores/useAuthStore";
import { useMyPageStore } from "../stores/useMyPageStore";
import {
  getMyReviews,
  deleteReview as deleteReviewApi,
} from "../../review/api/review.js";
import { mapReviewResponse } from "../../review/constants.js";

import TheFooter from "../../common/components/TheFooter.vue";
import UserProfileSummary from "../../user/components/UserProfileSummary.vue";
import MyPageTabs from "../components/MyPageTabs.vue";
import SavedNeighborhoodList from "../../region/components/SavedNeighborhoodList.vue";
import SavedConditionList from "../../condition/components/SavedConditionList.vue";
import MyReviewList from "../../review/components/MyReviewList.vue";
import ReviewEditModal from "../../review/components/ReviewEditModal.vue";
import BaseToast from "../../common/components/BaseToast.vue";

const router = useRouter();

const auth = useAuthStore();
const mypage = useMyPageStore();

const userProfile = computed(() => auth.user);

// 기본 탭 : 관심 동네
const tab = ref("neighborhoods");

// 프로필 수정
async function handleProfileSave(payload) {
  const { nickname, resolve, reject } = payload;

  try {
    await auth.updateProfile({
      nickname,
    });

    resolve();
  } catch (error) {
    reject(error);
  }
}

const editingReview = ref(null);
const toast = ref(null);

/*
 * [수정] 기존에는 mypage.allReviews(mock 데이터)를 그대로 보여줘서
 * 실제로 ExploreView에서 작성한 리뷰가 마이페이지에는 반영되지 않았다.
 * GET /api/reviews/me로 로그인한 사용자가 실제로 작성한 리뷰만 불러온다.
 */
const myReviewList = ref([]);
const reviewsLoading = ref(false);

async function loadMyReviews() {
  reviewsLoading.value = true;

  try {
    const response = await getMyReviews();
    myReviewList.value = response.data.map(mapReviewResponse);
  } catch (error) {
    console.error(
      "내가 쓴 리뷰를 불러오지 못했습니다:",
      error.response?.data || error,
    );
    myReviewList.value = [];
  } finally {
    reviewsLoading.value = false;
  }
}

onMounted(() => {
  loadMyReviews();
});

const myReviews = computed(() => {
  return myReviewList.value.slice(0, 20);
});

const tabs = computed(() => [
  {
    key: "neighborhoods",
    label: "관심 동네",
    count: mypage.savedNeighborhoods.length,
  },
  {
    key: "conditions",
    label: "저장한 조건",
    count: mypage.savedConditions.length,
  },
  {
    key: "results",
    label: "저장된 결과",
    count: mypage.savedConditions.length,
  },
  {
    key: "reviews",
    label: "내가 쓴 리뷰",
    count: myReviews.value.length,
  },
]);

function navigate(page) {
  const routeMap = {
    results: "/search/results",
    step1: "/search/step/1",
    explore: "/explore",
    detail: "/search/results",
  };

  router.push(routeMap[page] || "/");
}

function deleteCondition(id) {
  mypage.deleteCondition(id);
}

function loadResult() {
  // TODO: 검색 조건을 검색 Store에 적용한다.
  router.push("/search/results");
}

/*
 * UserProfileSummary에서 전달받은 닉네임을
 * Auth Store의 사용자 정보에 반영한다.
 */
function updateNickname(updatedUser) {
  auth.setUser({
    ...auth.user,
    ...updatedUser,
  });
}

function saveReview(updatedApiReview) {
  const mapped = mapReviewResponse(updatedApiReview);
  const idx = myReviewList.value.findIndex(
    (review) => review.reviewId === mapped.reviewId,
  );

  if (idx >= 0) {
    myReviewList.value[idx] = mapped;
  }

  editingReview.value = null;
  toast.value = "리뷰가 수정되었습니다.";
}

/*
 * [수정] 기존에는 로컬 mock 배열에서만 지워서 실제 DB에는 리뷰가 그대로 남아있었다.
 * 실제 DELETE /api/reviews/{id}를 호출해 서버 상태(status=DELETED)까지 반영한다.
 *
 * [수정] 삭제 버튼을 누르면 바로 삭제되던 것을 방지하기 위해,
 * 실제 삭제 요청 전에 confirm으로 한 번 더 확인받는다.
 */
async function deleteReview(id) {
  const confirmed = window.confirm(
    "정말 이 리뷰를 삭제하시겠어요? 삭제한 리뷰는 복구할 수 없습니다.",
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteReviewApi(id);

    myReviewList.value = myReviewList.value.filter(
      (review) => review.id !== id,
    );

    toast.value = "리뷰가 삭제되었습니다.";
  } catch (error) {
    console.error("리뷰 삭제 실패:", error.response?.data || error);

    toast.value =
      error.response?.data?.message ||
      "리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <ReviewEditModal
      v-if="editingReview"
      :review="editingReview"
      @close="editingReview = null"
      @updated="saveReview"
    />

    <BaseToast v-if="toast" :message="toast" @done="toast = null" />

    <div class="border-b border-border bg-white">
      <UserProfileSummary
        v-if="userProfile"
        :user-profile="userProfile"
        @save="handleProfileSave"
      />

      <div
        v-else
        class="max-w-4xl mx-auto px-8 py-8 text-sm text-muted-foreground"
      >
        사용자 정보를 불러오는 중입니다.
      </div>

      <MyPageTabs
        v-model="tab"
        :tabs="tabs"
      />
    </div>

    <div class="max-w-4xl mx-auto px-8 py-8">
      <SavedNeighborhoodList
        v-if="tab === 'neighborhoods'"
        :saved-neighborhoods="mypage.savedNeighborhoods"
        @navigate="navigate"
      />

      <SavedConditionList
        v-else-if="tab === 'conditions'"
        mode="conditions"
        :saved-conditions="mypage.savedConditions"
        @navigate="navigate"
        @delete="deleteCondition"
      />

      <SavedConditionList
        v-else-if="tab === 'results'"
        mode="results"
        :saved-conditions="mypage.savedConditions"
        @navigate="navigate"
        @load="loadResult"
      />

      <MyReviewList
        v-else-if="tab === 'reviews'"
        :reviews="myReviews"
        @navigate="navigate"
        @edit="(review) => (editingReview = review)"
        @delete="deleteReview"
      />
    </div>

    <TheFooter />
  </div>
</template>
