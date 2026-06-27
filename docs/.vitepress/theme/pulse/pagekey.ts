import phy11 from '../../curriculum/ncert-class11-physics.json'
import che11 from '../../curriculum/ncert-class11-chemistry.json'
import mat11 from '../../curriculum/ncert-class11-maths.json'
import bio11 from '../../curriculum/ncert-class11-biology.json'
import phy12 from '../../curriculum/ncert-class12-physics.json'

const SUBJECT_CODE: Record<string, string> = {
  physics: 'phy', chemistry: 'che', maths: 'mat', biology: 'bio',
}

interface Lesson  { id: string; title: string }
interface Chapter { id: string; title: string; lessons: Lesson[] }
interface SubjectData { base: string; chapters: Chapter[] }

function mapSubject(data: SubjectData, classNum: string, subj: string): Record<string, string> {
  const map: Record<string, string> = {}
  const code = SUBJECT_CODE[subj] ?? subj
  data.chapters.forEach((ch, ci) => {
    ch.lessons.forEach((l, li) => {
      const path  = `/ncert/class${classNum}/${subj}/chapters/${ch.id}/${l.id}`
      const short = `ncert_${classNum}_${code}_ch${String(ci+1).padStart(2,'0')}_${String(li+1).padStart(2,'0')}`
      map[path] = short
    })
  })
  return map
}

const PAGE_KEY_MAP: Record<string, string> = {
  ...mapSubject(phy11 as SubjectData, '11', 'physics'),
  ...mapSubject(che11 as SubjectData, '11', 'chemistry'),
  ...mapSubject(mat11 as SubjectData, '11', 'maths'),
  ...mapSubject(bio11 as SubjectData, '11', 'biology'),
  ...mapSubject(phy12 as SubjectData, '12', 'physics'),
}

export function resolvePageKey(path: string): string {
  const clean = path.replace(/\/$/, '')
  return PAGE_KEY_MAP[clean] ?? (clean.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home')
}
