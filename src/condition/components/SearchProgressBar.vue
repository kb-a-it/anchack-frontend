<script setup>
defineProps({ step: { type: Number, required: true }, total: { type: Number, default: 5 } });
</script>
<template>
  <div class="w-full h-[5px] bg-muted rounded-full overflow-hidden">
    <div class="h-full rounded-full transition-all duration-500 ease-out" :style="{ width: (step / total) * 100 + '%', background: 'linear-gradient(90deg,#2D7A4F,#6DC98A)' }" />
  </div>
</template>
