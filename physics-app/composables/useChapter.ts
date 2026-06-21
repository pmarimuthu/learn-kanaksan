import type { Chapter, ChapterIndex } from '~/types/physics'

/**
 * Load the master chapter list from data/chapters.json
 */
export function useChapters() {
  return useAsyncData('chapters', () =>
    $fetch<Chapter[]>('/data/chapters.json')
  )
}

/**
 * Load a single chapter's index (lessons list + description).
 */
export function useChapterIndex(slug: string) {
  return useAsyncData(`chapter-${slug}`, () =>
    $fetch<ChapterIndex>(`/data/chapters/${slug}/index.json`)
  )
}
