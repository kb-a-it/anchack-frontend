<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "../../user/stores/useAuthStore";
import { useMyPageStore } from "../stores/useMyPageStore";

import TheFooter from "../../common/components/TheFooter.vue";
import UserProfileSummary from "../../user/components/UserProfileSummary.vue";
import MyPageTabs from "../components/MyPageTabs.vue";
import SavedNeighborhoodList from "../../region/components/SavedNeighborhoodList.vue";
import SavedConditionList from "../../condition/components/SavedConditionList.vue";
import MyReviewList from "../../review/components/MyReviewList.vue";
import ReviewEditModal from "../../review/components/ReviewEditModal.vue";

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

const myReviews = computed(() => {
  return mypage.allReviews.slice(0, 20);
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

function saveReview(updatedReview) {
  mypage.updateReview(updatedReview);
  editingReview.value = null;
}

function deleteReview(id) {
  mypage.allReviews = mypage.allReviews.filter(
    (review) => review.id !== id,
  );
}
</script>

<template>
  <div class="min-h-screen bg-background pt-[60px]">
    <ReviewEditModal
      v-if="editingReview"
      :review="editingReview"
      @close="editingReview = null"
      @save="saveReview"
    />

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
