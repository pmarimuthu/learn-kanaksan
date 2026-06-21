<template>
  <span class="exam-badge">{{ tag }}</span>
</template>

<script setup lang="ts">
defineProps<{ tag: string }>()
</script>

<style scoped>
.exam-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--c-brand) 10%, transparent);
  color: var(--c-brand);
  border: 1px solid color-mix(in srgb, var(--c-brand) 25%, transparent);
}
</style>
