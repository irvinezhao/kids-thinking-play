export type AgeKey = 'age2' | 'age3' | 'age4'
export type ShapeName = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'pill'
export type Tone = 'coral' | 'leaf' | 'sky' | 'sun' | 'grape' | 'ink'
export type ItemName =
  | 'apple'
  | 'banana'
  | 'grapes'
  | 'carrot'
  | 'hat'
  | 'sock'
  | 'scarf'
  | 'cookie'
  | 'car'
  | 'boat'
  | 'plane'
  | 'ball'
  | 'blocks'
  | 'pinwheel'
  | 'cat'
  | 'dog'
  | 'bird'
  | 'spoon'
  | 'bowl'
  | 'cup'
  | 'drum'
  | 'bell'
  | 'maraca'
export type TemplateKind = 'choice' | 'drag' | 'connect' | 'shadow' | 'maze' | 'leftRight'
export type ReviewStatus = 'approved' | 'needsReview' | 'draft'
export type Difficulty = 1 | 2 | 3

export type VisualToken = {
  shape: ShapeName
  tone: Tone
  item?: ItemName
  label?: string
  small?: boolean
}

export type Option = {
  id: string
  text?: string
  visuals?: VisualToken[]
}

export type MazeMeta = {
  size: number
  path: number[]
  exits: Array<{
    id: string
    label: string
    cell: number
  }>
}

export type QuestionMeta = {
  target?: VisualToken
  left?: VisualToken
  right?: VisualToken
  maze?: MazeMeta
  relation?: 'shape' | 'tone' | 'count' | 'side'
  dropLabel?: string
}

export type Question = {
  id: string
  age: AgeKey
  template: TemplateKind
  skill: string
  prompt: string
  scene: VisualToken[]
  answerId: string
  options: Option[]
  success: string
  retry: string
  tags: string[]
  difficulty: Difficulty
  status: ReviewStatus
  source: 'generated' | 'imported'
  meta?: QuestionMeta
}

export type AgeTrack = {
  key: AgeKey
  label: string
  short: string
  focus: string
  accent: Tone
}

export type PracticeAttempt = {
  id: string
  questionId: string
  age: AgeKey
  template: TemplateKind
  skill: string
  prompt: string
  tags: string[]
  difficulty: Difficulty
  optionId: string
  correct: boolean
  retry: string
  createdAt: string
}

export type PracticeSession = {
  id: string
  age: AgeKey
  total: number
  correct: number
  durationSeconds: number
  createdAt: string
}

export type ActivityStore = {
  attempts: PracticeAttempt[]
  sessions: PracticeSession[]
}

export type ProgressStore = Partial<
  Record<
    AgeKey,
    {
      plays: number
      best: number
      lastTotal: number
    }
  >
>
