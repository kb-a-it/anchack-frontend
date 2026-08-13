<script setup>
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";
import AddressSearchModal from "./AddressSearchModal.vue";
import DistrictMap from "./DistrictMap.vue";
import BoxChip from "./BoxChip.vue";
import Chip from "./Chip.vue";
import PriorityChip from "./PriorityChip.vue";
import MustHaveChip from "./MustHaveChip.vue";
import InlineEditSection from "./InlineEditSection.vue";
import { PRIORITY_OPTIONS, MUST_HAVE_OPTIONS, HOUSING_OPTIONS, AREA_WITH_PYEONG } from "../../common/utils/mockData";

const props = defineProps({ state: { type: Object, required: true } });
const emit = defineEmits(["update", "submit", "prev"]);

const expanded = ref(null); // "commute" | "budget" | "housing" | "lifestyle" | null
const modal = ref(false);

function update(patch) {
  emit("update", patch);
}
function toggleSection(key) {
  expanded.value = expanded.value === key ? null : key;
}

const target = computed(() => (props.state.addressTab === "unknown" ? "아직 미정" : props.state.commuteArea || "미설정"));
const depositChips = computed(() => (props.state.rentType === "월세" ? [500, 1000, 1500, 2000, 3000] : [5000, 10000, 15000, 20000, 30000]));

function togglePriority(p) {
  const s = props.state;
  update({ priorities: s.priorities.includes(p) ? s.priorities.filter((x) => x !== p) : s.priorities.length < 3 ? [...s.priorities, p] : s.priorities });
}
function toggleMustHave(m) {
  const s = props.state;
  update({ mustHave: s.mustHave.includes(m) ? s.mustHave.filter((x) => x !== m) : [...s.mustHave, m] });
}
function toggleHousing(h) {
  const s = props.state;
  update({ housingTypes: s.housingTypes.includes(h) ? s.housingTypes.filter((x) => x !== h) : [...s.housingTypes, h] });
}
function selectAddress(name, address) {
  update({ addressTab: "known", detailAddress: name, commuteArea: address });
  modal.value = false;
}
</script>

<template>
  <AddressSearchModal v-if="modal" @close="modal = false" @select="selectAddress" />

  <h1 class="text-[28px] font-bold text-foreground mb-8">입력한 조건을 확인해주세요</h1>

      <div class="space-y-4 mb-10">
        <InlineEditSection
          title="기본 조건"
          :lines="[`목적지: ${target}`, `최대 통근: ${state.maxCommuteTime}분`]"
          :is-open="expanded === 'commute'"
          @toggle="toggleSection('commute')"
        >
          <div class="space-y-4">
            <div class="flex bg-muted rounded-xl p-1">
              <button
                v-for="(t, i) in ['known', 'unknown']"
                :key="t"
                @click="update({ addressTab: t })"
                :class="`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${state.addressTab === t ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`"
              >
                {{ i === 0 ? "주소를 알고 있어요" : "아직 정해지지 않았어요" }}
              </button>
            </div>
            <div v-if="state.addressTab === 'known'" class="flex gap-2">
              <input type="text" readonly :value="state.commuteArea" placeholder="주소를 검색해주세요" @click="modal = true" class="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm cursor-pointer" />
              <button @click="modal = true" class="bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90"><Search :size="15" /> 검색</button>
            </div>
            <div v-if="state.addressTab === 'unknown'" class="bg-white border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-semibold text-foreground">출근지 주변 구를 선택해주세요</p>
                <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">0~2개</span>
              </div>
              <DistrictMap :model-value="state.commuteAreas" @update:model-value="(areas) => update({ commuteAreas: areas })" :max="2" />
            </div>
            <div v-if="state.addressTab === 'known'" class="space-y-2">
              <p class="text-xs text-muted-foreground mb-2">최대 통근시간</p>
              <div class="flex gap-2 flex-wrap">
                <BoxChip v-for="t in [30, 45, 60, 75, 90]" :key="t" :label="`${t}분`" :selected="state.maxCommuteTime === t" @click="update({ maxCommuteTime: t })" />
              </div>
            </div>
          </div>
        </InlineEditSection>

        <InlineEditSection
          title="생활 우선순위"
          :lines="[state.priorities.join(' → '), `필수: ${state.mustHave.join(', ')}`]"
          :is-open="expanded === 'lifestyle'"
          @toggle="toggleSection('lifestyle')"
        >
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs text-muted-foreground">생활 우선순위</p>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">{{ state.priorities.length }}/3</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <PriorityChip
                  v-for="p in PRIORITY_OPTIONS"
                  :key="p"
                  :label="p"
                  :index="state.priorities.indexOf(p)"
                  :disabled="!state.priorities.includes(p) && state.priorities.length >= 3"
                  :show-tooltip="false"
                  @click="togglePriority(p)"
                />
              </div>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">필수 조건</p>
              <div class="flex flex-wrap gap-2">
                <MustHaveChip v-for="m in MUST_HAVE_OPTIONS" :key="m" :label="m" :selected="state.mustHave.includes(m)" @click="toggleMustHave(m)" />
              </div>
            </div>
          </div>
        </InlineEditSection>

        <InlineEditSection
          title="예산"
          :lines="[`${state.rentType} · ${state.deposit.toLocaleString()}만원`, `관리비 ${state.management}만원`]"
          :is-open="expanded === 'budget'"
          @toggle="toggleSection('budget')"
        >
          <div class="space-y-4">
            <div class="flex bg-muted rounded-xl p-1">
              <button v-for="rt in ['월세', '전세']" :key="rt" @click="update({ rentType: rt })" :class="`flex-1 py-2.5 rounded-lg text-sm font-semibold ${state.rentType === rt ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`">{{ rt }}</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-muted-foreground mb-1">{{ state.rentType === "월세" ? "최대 보증금" : "최대 전세금" }} (만원)</label>
                <input type="number" step="10" :value="state.deposit" @input="update({ deposit: +$event.target.value })" class="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm" />
              </div>
              <div v-if="state.rentType === '월세'">
                <label class="block text-xs text-muted-foreground mb-1">최대 월세 (만원)</label>
                <input type="number" :value="state.monthly" @input="update({ monthly: +$event.target.value })" class="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1">최대 관리비 (만원)</label>
                <input type="number" :value="state.management" @input="update({ management: +$event.target.value })" class="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">빠른 선택</p>
              <div class="flex flex-wrap gap-2">
                <Chip v-for="v in depositChips" :key="v" :label="`${v.toLocaleString()}만원`" :selected="state.deposit === v" @click="update({ deposit: v })" />
              </div>
            </div>
          </div>
        </InlineEditSection>

        <InlineEditSection
          title="주택 유형 및 면적"
          :lines="[state.housingTypes.join(', '), state.minArea]"
          :is-open="expanded === 'housing'"
          @toggle="toggleSection('housing')"
        >
          <div class="space-y-4">
            <div>
              <p class="text-xs text-muted-foreground mb-2">주택 유형</p>
              <div class="flex flex-wrap gap-2">
                <Chip v-for="h in HOUSING_OPTIONS" :key="h" :label="h" :selected="state.housingTypes.includes(h)" @click="toggleHousing(h)" />
              </div>
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">최소 전용면적</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="{ label, pyeong } in AREA_WITH_PYEONG"
                  :key="label"
                  @click="update({ minArea: label })"
                  :class="`inline-flex flex-col items-center px-4 py-2 rounded-xl border text-sm font-semibold ${state.minArea === label ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-foreground border-border'}`"
                >
                  <span>{{ label }}</span>
                  <span v-if="pyeong" class="text-xs opacity-75">{{ pyeong }}</span>
                </button>
              </div>
            </div>
          </div>
        </InlineEditSection>
      </div>

      <div class="flex justify-between">
        <button @click="emit('prev')" class="text-sm text-muted-foreground">이전</button>
        <button @click="emit('submit')" class="bg-primary text-primary-foreground px-10 py-3.5 rounded-full font-semibold">동네 찾기 시작</button>
      </div>
</template>
