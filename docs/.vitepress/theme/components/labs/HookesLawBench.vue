<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ assembled: string[]; weights: number; springK: number }>()

const extension = computed(() => {
  if (!props.assembled.includes('spring')) return 0
  const force = props.weights * 100 * 9.8 / 1000
  return Math.min(force / props.springK * 100, 120)
})

const springBottom = computed(() => 80 + extension.value)
</script>

<template>
  <svg viewBox="0 0 220 280" class="bench-svg" aria-label="Lab bench">
    <rect x="0" y="260" width="220" height="20" fill="#c8a97a" rx="3"/>
    <rect x="10" y="100" width="8" height="160" fill="#888" rx="2"/>
    <rect x="10" y="100" width="80" height="6" fill="#888" rx="2" v-if="assembled.includes('stand')"/>
    <text x="110" y="220" font-size="11" fill="#aaa" v-if="!assembled.includes('stand')">Click equipment →</text>

    <template v-if="assembled.includes('spring')">
      <line x1="50" y1="106" x2="50" y2="80" stroke="#555" stroke-width="2"/>
      <path :d="`M 42 80 ${Array.from({length:6},(_,i)=>`Q ${i%2===0?58:34} ${80+i*extension/6+extension/12} 42 ${80+(i+1)*extension/6}`).join(' ')}`"
        fill="none" stroke="#2563eb" stroke-width="2.5"/>
      <circle cx="50" :cy="springBottom" r="5" fill="#2563eb"/>
    </template>

    <template v-if="assembled.includes('ruler')">
      <rect x="68" y="100" width="10" height="160" fill="#fde68a" rx="1" opacity="0.9"/>
      <line v-for="i in 16" :key="i" :x1="68" :y1="100+i*10" :x2="i%5===0?78:74" :y2="100+i*10" stroke="#92400e" stroke-width="0.8"/>
    </template>

    <template v-if="weights > 0 && assembled.includes('spring')">
      <rect v-for="w in weights" :key="w"
        :x="40" :cy="springBottom + 8 + (w-1)*14"
        :y="springBottom + 4 + (w-1)*14"
        width="20" height="12" fill="#ef4444" rx="2"/>
      <text v-for="w in weights" :key="'t'+w"
        x="50" :y="springBottom + 13 + (w-1)*14"
        font-size="7" fill="white" text-anchor="middle">100g</text>
    </template>

    <template v-if="assembled.includes('ready') && weights > 0">
      <line x1="68" :y1="springBottom" x2="80" :y2="springBottom" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3"/>
      <text x="82" :y="springBottom+4" font-size="9" fill="#16a34a">{{ extension.toFixed(1) }}cm</text>
    </template>
  </svg>
</template>

<style scoped>
.bench-svg { width: 100%; max-width: 220px; background: #f8f7f4; border-radius: 10px; border: 1px solid #e5e7eb; }
</style>
