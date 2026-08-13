<script setup>
import { nextTick, ref } from "vue";

const props = defineProps({
  userProfile: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["save"]);

const isEditing = ref(false);
const isSaving = ref(false);
const nickname = ref("");
const nicknameInput = ref(null);
const errorMessage = ref("");

async function startEditing() {
  nickname.value = props.userProfile.nickname ?? "";
  errorMessage.value = "";
  isEditing.value = true;

  await nextTick();
  nicknameInput.value?.focus();
}

function cancelEditing() {
  nickname.value = props.userProfile.nickname ?? "";
  errorMessage.value = "";
  isEditing.value = false;
}

async function saveNickname() {
  const trimmedNickname = nickname.value.trim();

  if (!trimmedNickname) {
    errorMessage.value = "닉네임을 입력해 주세요.";
    return;
  }

  if (trimmedNickname.length > 100) {
    errorMessage.value = "닉네임은 100자 이하로 입력해 주세요.";
    return;
  }

  if (trimmedNickname === props.userProfile.nickname) {
    isEditing.value = false;
    return;
  }

  const confirmed = window.confirm(
    `닉네임을 "${trimmedNickname}"(으)로 변경하시겠습니까?`,
  );

  if (!confirmed) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = "";

  try {
    await new Promise((resolve, reject) => {
      emit("save", {
        nickname: trimmedNickname,
        resolve,
        reject,
      });
    });

    isEditing.value = false;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ??
      "닉네임 변경에 실패했습니다.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <section class="max-w-4xl mx-auto px-8 py-8">
    <div class="flex items-center gap-4">
      <img
        v-if="userProfile.profileImage"
        :src="userProfile.profileImage"
        alt="프로필 이미지"
        class="h-20 w-20 rounded-full object-cover"
      />

      <div
        v-else
        class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground"
      >
        {{ userProfile.nickname?.charAt(0) || "?" }}
      </div>

      <div class="min-w-0 flex-1">
        <div v-if="!isEditing" class="flex items-center gap-3">
          <h2 class="truncate text-xl font-bold text-foreground">
            {{ userProfile.nickname || "사용자" }}
          </h2>

          <button
            type="button"
            class="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            @click="startEditing"
          >
            편집
          </button>
        </div>

        <div v-else>
          <div class="flex flex-wrap items-center gap-2">
            <input
              ref="nicknameInput"
              v-model="nickname"
              type="text"
              maxlength="100"
              class="w-52 rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="닉네임을 입력해 주세요"
              @keyup.enter="saveNickname"
              @keyup.esc="cancelEditing"
            />

            <button
              type="button"
              class="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              @click="saveNickname"
            >
              저장
            </button>

            <button
              type="button"
              class="rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              @click="cancelEditing"
            >
              취소
            </button>
          </div>

          <p
            v-if="errorMessage"
            class="mt-1 text-xs text-red-500"
          >
            {{ errorMessage }}
          </p>
        </div>

        <p class="mt-1 text-sm text-muted-foreground">
          {{ userProfile.email || "이메일 정보 없음" }}
        </p>

        <p
          v-if="userProfile.provider === 'KAKAO'"
          class="mt-1 text-xs text-muted-foreground"
        >
          카카오 로그인
        </p>
      </div>
    </div>
  </section>
</template>
