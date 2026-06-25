
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { subjectFromPath } from '../subjects'
import SubjectIcon from './SubjectIcon.vue'

const route  = useRoute()
const subject = computed(() => subjectFromPath(route.path))
</script>

<template>
  <SubjectIcon :subjectId="subject.id" :size="22" style="flex-shrink: 0;" />
</template>
