<template>
  <div class="quiz">
    <div class="quiz-header">
      <span class="quiz-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </span>
      <span class="quiz-title">{{ t('quiz.title') }}</span>
      <span v-if="allAnswered" class="quiz-score">{{ score }}/{{ questions.length }}</span>
    </div>

    <div class="questions">
      <div v-for="(q, qi) in questions" :key="q.id" class="question">
        <p class="q-text">{{ qi + 1 }}. {{ q.question }}</p>

        <div class="options">
          <button
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="option"
            :class="optionClass(qi, oi)"
            :disabled="chosen[qi] !== null"
            @click="choose(qi, oi)"
          >
            <span class="option-letter">{{ letters[oi] }}</span>
            <span class="option-text">{{ opt }}</span>
            <span v-if="chosen[qi] !== null && oi === q.answer" class="option-tick">✓</span>
            <span v-else-if="chosen[qi] === oi && oi !== q.answer" class="option-cross">✗</span>
          </button>
        </div>

        <!-- Explanation -->
        <Transition name="reveal">
          <div v-if="chosen[qi] !== null" class="explanation" :class="isCorrect(qi) ? 'explanation--correct' : 'explanation--wrong'">
            <strong>{{ isCorrect(qi) ? `✓ ${t('quiz.correct')}` : `✗ ${t('quiz.incorrect')}` }}</strong>
            {{ q.explanation }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuizQuestion } from '~/types/physics'

const props = defineProps<{ questions: QuizQuestion[] }>()
const { t } = useAppI18n()

const letters = ['A', 'B', 'C', 'D']

const chosen = ref<(number | null)[]>(props.questions.map(() => null))

const allAnswered = computed(() => chosen.value.every((c) => c !== null))
const score = computed(
  () => props.questions.filter((q, i) => chosen.value[i] === q.answer).length
)

function choose(qi: number, oi: number) {
  if (chosen.value[qi] !== null) return
  chosen.value[qi] = oi
}

function isCorrect(qi: number) {
  return chosen.value[qi] === props.questions[qi].answer
}

function optionClass(qi: number, oi: number) {
  if (chosen.value[qi] === null) return ''
  if (oi === props.questions[qi].answer) return 'option--correct'
  if (chosen.value[qi] === oi) return 'option--wrong'
  return 'option--muted'
}
</script>

<style scoped>
.quiz {
  border: 1px solid var(--c-divider);
  border-radius: 14px;
  overflow: hidden;
  margin-top: 8px;
}
.quiz-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--c-bg-soft);
  border-bottom: 1px solid var(--c-divider);
}
.quiz-icon {
  color: var(--c-brand);
  display: flex;
  align-items: center;
}
.quiz-icon svg { width: 18px; height: 18px; }
.quiz-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-text-1);
}
.quiz-score {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 800;
  color: #10b981;
  background: color-mix(in srgb, #10b981 12%, transparent);
  border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
  padding: 2px 10px;
  border-radius: 20px;
}

.questions {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.question { display: flex; flex-direction: column; gap: 10px; }
.q-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--c-text-1);
  line-height: 1.4;
  margin: 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.88rem;
  color: var(--c-text-1);
  transition: border-color 0.12s, background 0.12s;
  width: 100%;
}
.option:not(:disabled):hover {
  border-color: var(--c-brand);
  background: color-mix(in srgb, var(--c-brand) 5%, var(--c-bg));
}
.option:disabled { cursor: default; }

.option--correct {
  border-color: #10b981 !important;
  background: color-mix(in srgb, #10b981 10%, var(--c-bg)) !important;
  color: #059669;
  font-weight: 600;
}
.option--wrong {
  border-color: #ef4444 !important;
  background: color-mix(in srgb, #ef4444 10%, var(--c-bg)) !important;
  color: #dc2626;
}
.option--muted { opacity: 0.45; }

.option-letter {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--c-brand);
  min-width: 16px;
  flex-shrink: 0;
}
.option--correct .option-letter { color: #059669; }
.option--wrong .option-letter { color: #dc2626; }
.option-text { flex: 1; }
.option-tick { color: #059669; font-weight: 800; flex-shrink: 0; }
.option-cross { color: #dc2626; font-weight: 800; flex-shrink: 0; }

/* Explanation */
.explanation {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.83rem;
  line-height: 1.5;
  color: var(--c-text-1);
}
.explanation--correct {
  background: color-mix(in srgb, #10b981 10%, var(--c-bg));
  border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
}
.explanation--wrong {
  background: color-mix(in srgb, #ef4444 10%, var(--c-bg));
  border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
}
.explanation strong { margin-right: 6px; }

/* Reveal transition */
.reveal-enter-active { transition: opacity 0.25s, transform 0.25s; }
.reveal-enter-from { opacity: 0; transform: translateY(-6px); }
</style>
