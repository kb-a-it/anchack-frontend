<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecommendList from '../components/sidebar/RecommendList.vue'
import SaveConditionModal from '../components/sidebar/SaveConditionModal.vue'
import SavedConditionsListModal from '../components/sidebar/SavedConditionsListModal.vue'
import ResultMap from '../components/main/ResultMap.vue'
import CompareTable from '../components/main/CompareTable.vue'
import ListingsPanel from '../components/main/ListingsPanel.vue'
import DetailPanel from '../components/detail/DetailPanel.vue'
import BaseToast from '../../common/components/BaseToast.vue'
import { NEIGHBORHOODS } from '@/common/utils/mockData.js'
import { useSearchStore } from '@/condition/stores/useSearchStore.js'
import { useNeighborhoodStore } from '@/region/stores/useNeighborhoodStore.js'
import { useMyPageStore } from '@/mypage/stores/useMyPageStore.js'

const route = useRoute()
const router = useRouter()
const search = useSearchStore()
const nbhd = useNeighborhoodStore()
const mypage = useMyPageStore()

const mode = computed(() => {
  if (route.path.endsWith('/compare')) return 'compare'
  if (route.path.endsWith('/listings')) return 'listings'
  if (route.params.id) return 'detail'
  return 'results'
})

const showSaveModal = ref(false)
const showSavedListModal = ref(false)
const conditionSaved = ref(false)
const toast = ref(null)

const selectedNeighborhood = computed(() => NEIGHBORHOODS.find((n) => n.id === route.params.id))

function goDetail(id) {
  router.push(`/search/results/${id}`)
}
function toggleCompare(id) {
  nbhd.toggleCompare(id)
}
function toggleSaveWithToast(id) {
  const wasAdded = !mypage.savedNeighborhoods.includes(id)
  mypage.toggleSavedNeighborhood(id)
  if (wasAdded) toast.value = '관심 동네에 추가되었습니다.'
}
function saveCondition(title) {
  mypage.saveCondition({
    id: Date.now(),
    title,
    state: search.appState,
    date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').slice(0, -1),
  })
  showSaveModal.value = false
  conditionSaved.value = true
}
function goListings() {
  nbhd.listingsFrom = 'detail'
  router.push(`/search/results/${route.params.id}/listings`)
}
</script>

<template>
  <transition name="modal-fade">
    <SaveConditionModal v-if="showSaveModal" @close="showSaveModal = false" @save="saveCondition" />
  </transition>
  <transition name="modal-fade">
    <SavedConditionsListModal
      v-if="showSavedListModal"
      :saved-conditions="mypage.savedConditions"
      @close="showSavedListModal = false"
    />
  </transition>
  <transition name="toast-pop">
    <BaseToast v-if="toast" :message="toast" @done="toast = null" />
  </transition>

  <transition name="view-fade" mode="out-in">
    <div v-if="mode === 'results'" key="results" class="flex h-screen pt-[60px] overflow-hidden">
      <RecommendList
        :compare-list="nbhd.compareList"
        :saved-neighborhoods="mypage.savedNeighborhoods"
        :condition-saved="conditionSaved"
        @detail="goDetail"
        @compare="toggleCompare"
        @toggle-save="toggleSaveWithToast"
        @go-compare="router.push('/search/compare')"
        @save-condition-click="showSaveModal = true"
        @show-saved-list="showSavedListModal = true"
      />
      <div class="flex-1 min-w-0 relative h-full p-4 bg-background">
        <div
          class="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col"
        >
          <ResultMap v-model="search.appState.selectedDistricts" :max="2" />
        </div>
      </div>
    </div>

    <DetailPanel
      v-else-if="mode === 'detail' && selectedNeighborhood"
      key="detail"
      :n="selectedNeighborhood"
      :is-saved="mypage.savedNeighborhoods.includes(route.params.id)"
      :in-compare="nbhd.compareList.includes(route.params.id)"
      @back="router.push('/search/results')"
      @listings="goListings"
      @toggle-save="toggleSaveWithToast(route.params.id)"
      @compare="toggleCompare(route.params.id)"
    />

    <CompareTable
      v-else-if="mode === 'compare'"
      key="compare"
      :compare-list="nbhd.compareList"
      @back="router.push('/search/results')"
    />

    <ListingsPanel
      v-else-if="mode === 'listings'"
      key="listings"
      :neighborhood-id="route.params.id"
      @back="router.push(`/search/results/${route.params.id}`)"
    />
  </transition>
</template>

<style scoped>
.view-fade-enter-active,
.view-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-active :deep(.bg-card),
.modal-fade-leave-active :deep(.bg-card) {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from :deep(.bg-card),
.modal-fade-leave-to :deep(.bg-card) {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
