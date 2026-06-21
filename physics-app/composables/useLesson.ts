import type { Lesson, LessonRef } from '~/types/physics'

/**
 * Load a single lesson's full JSON.
 */
export function useLesson(chapterSlug: string, lessonSlug: string) {
  return useAsyncData(`lesson-${chapterSlug}-${lessonSlug}`, () =>
    $fetch<Lesson>(`/data/chapters/${chapterSlug}/lessons/${lessonSlug}.json`)
  )
}

/**
 * Given the lesson list for a chapter and the current lesson slug,
 * return { prev, next } lesson refs.
 */
export function useLessonNav(lessons: LessonRef[], currentSlug: string) {
  const idx = lessons.findIndex((l) => l.slug === currentSlug)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null
  return { prev, next }
}
