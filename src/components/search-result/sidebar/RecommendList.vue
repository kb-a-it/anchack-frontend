<script setup>
defineProps({
  neighborhoods: { type: Array, required: true },
  hoveredId: { type: [Number, String], default: null },
})

defineEmits(['hover', 'leave'])
</script>

<template>
  <ul class="recommend-list">
    <li
      v-for="(item, index) in neighborhoods"
      :key="item.id"
      class="recommend-card"
      :class="{ 'recommend-card--active': item.id === hoveredId }"
      @mouseenter="$emit('hover', item.id)"
      @mouseleave="$emit('leave')"
    >
      <div class="recommend-card__header">
        <span class="recommend-card__rank">{{ index + 1 }}</span>
        <div class="recommend-card__title">
          <strong class="recommend-card__name">{{ item.name }}</strong>
          <span class="recommend-card__score">적합도 {{ item.score }}점</span>
        </div>
      </div>

      <div class="recommend-card__meta">
        <span>{{ item.commute }}</span>
        <span>{{ item.rent }}</span>
      </div>

      <div class="recommend-card__tags">
        <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.recommend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.recommend-card--active {
  border-color: #2f9e6f;
  background-color: #f2faf6;
  box-shadow: 0 0 0 1px #2f9e6f inset;
}

.recommend-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recommend-card__rank {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1f6b4a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommend-card__title {
  display: flex;
  flex-direction: column;
}

.recommend-card__name {
  font-size: 15px;
}

.recommend-card__score {
  font-size: 12px;
  color: #2f9e6f;
}

.recommend-card__meta {
  display: flex;
  gap: 10px;
  margin: 10px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.recommend-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef2f7;
  color: #374151;
}
</style>
