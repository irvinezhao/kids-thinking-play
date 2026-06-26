import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileJson,
  Home,
  Moon,
  RotateCcw,
  Star,
  Sun,
  Trophy,
  Type,
  Upload,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { OptionContent, QuestionStage, VisualRow } from './components/QuestionViews'
import {
  ageTracks,
  generatedQuestions,
  getQuestionCountByAge,
  pickSessionQuestions,
  sessionQuestionCount,
} from './data/questionBank'
import brandLogoArt from './assets/brand/thinking-island-logo.webp'
import thinkingPathArt from './assets/illustrations/thinking-path.webp'
import sceneCastleArt from './assets/scenes/kenney-castle.webp'
import sceneDesertArt from './assets/scenes/kenney-desert.webp'
import sceneForestArt from './assets/scenes/kenney-forest.webp'
import sceneTallTreesArt from './assets/scenes/kenney-talltrees.webp'
import type {
  ActivityStore,
  AgeKey,
  Difficulty,
  ItemName,
  PracticeAttempt,
  ProgressStore,
  Question,
  ReviewStatus,
  ShapeName,
  TemplateKind,
  Tone,
  VisualToken,
} from './types'
import './App.css'

type ScreenMode = 'home' | 'parent' | 'admin'
type ThemeMode = 'day' | 'night'
type AppFontId = 'jinnian' | 'pingfang' | 'qingsong'
type SessionAnswer = {
  questionId: string
  optionId: string
}
type GestureTemplate = 'drag' | 'connect'
type ActiveOptionGesture = {
  optionId: string
  template: GestureTemplate
  startX: number
  startY: number
  anchorX: number
  anchorY: number
  x: number
  y: number
  overTarget: boolean
  hasMoved: boolean
}
type PromptVoiceManifest = {
  version?: number
  baseUrl?: string
  cloudTtsUrlTemplate?: string
  entries?: Record<string, string>
  prompts?: Record<string, string>
  defaultVoice?: PromptVoiceId
  feedback?: Partial<Record<PromptVoiceId, Record<string, string>>>
  voices?: Partial<Record<PromptVoiceId, PromptVoicePack>>
}
type PromptVoiceId = 'cute_boy' | 'lovely_girl'
type PromptVoicePack = {
  label?: string
  entries?: Record<string, string>
  prompts?: Record<string, string>
  feedback?: Record<string, string>
}

const progressStorageKey = 'kids-thinking-play-progress'
const activityStorageKey = 'kids-thinking-play-activity'
const importedStorageKey = 'kids-thinking-play-imported-questions'
const recentQuestionStorageKey = 'kids-thinking-play-recent-question-ids'
const soundStorageKey = 'kids-thinking-play-sound-enabled'
const themeStorageKey = 'kids-thinking-play-theme-mode'
const promptVoiceStorageKey = 'kids-thinking-play-prompt-voice'
const appFontStorageKey = 'kids-thinking-play-app-font'
const recentQuestionLimit = 80
const validAges: AgeKey[] = ['age2', 'age3', 'age4']
const validPromptVoices: PromptVoiceId[] = ['lovely_girl', 'cute_boy']
const validAppFonts: AppFontId[] = ['jinnian', 'pingfang', 'qingsong']
const promptVoiceProfiles: Record<PromptVoiceId, { label: string; short: string }> = {
  lovely_girl: { label: '萌萌女童', short: '女' },
  cute_boy: { label: '可爱男童', short: '男' },
}
const appFontProfiles: Record<AppFontId, { label: string; short: string }> = {
  jinnian: { label: '今年加油体', short: '加' },
  pingfang: { label: '平方手书体', short: '手' },
  qingsong: { label: '轻松手写体', short: '轻' },
}
const sceneArtGallery = [thinkingPathArt, sceneForestArt, sceneCastleArt, sceneDesertArt, sceneTallTreesArt] as const
const ageCardVisuals: Record<AgeKey, VisualToken[]> = {
  age2: [
    { shape: 'circle', tone: 'coral', item: 'apple', small: true },
    { shape: 'pill', tone: 'sun', item: 'banana', small: true },
    { shape: 'square', tone: 'sky', item: 'blocks', small: true },
  ],
  age3: [
    { shape: 'circle', tone: 'leaf', item: 'pear', small: true },
    { shape: 'square', tone: 'sky', item: 'shirt', small: true },
    { shape: 'diamond', tone: 'sun', item: 'bell', small: true },
  ],
  age4: [
    { shape: 'square', tone: 'leaf', item: 'cup', small: true },
    { shape: 'pill', tone: 'grape', item: 'hat', small: true },
    { shape: 'triangle', tone: 'sun', item: 'plane', small: true },
  ],
}
const validTemplates: TemplateKind[] = ['choice', 'drag', 'connect', 'shadow', 'maze', 'leftRight']
const validShapes: ShapeName[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'pill']
const validTones: Tone[] = ['coral', 'leaf', 'sky', 'sun', 'grape', 'ink']
const validItems: ItemName[] = [
  'apple',
  'banana',
  'grapes',
  'orange',
  'strawberry',
  'pear',
  'carrot',
  'hat',
  'sock',
  'scarf',
  'shirt',
  'pants',
  'shoe',
  'cookie',
  'car',
  'boat',
  'plane',
  'ball',
  'blocks',
  'pinwheel',
  'cat',
  'dog',
  'bird',
  'spoon',
  'bowl',
  'cup',
  'drum',
  'bell',
  'maraca',
]
const urlParams = new URLSearchParams(window.location.search)
const isTestFastMode = urlParams.get('testFast') === '1'

const emptyActivity: ActivityStore = {
  attempts: [],
  sessions: [],
}
const autoAdvanceDelayMs = isTestFastMode ? 120 : 2000
const shouldPlayFeedbackAudio = !isTestFastMode
const promptVoiceManifestFile = 'voice/manifest.json'
const correctPraise = '对啦，你真棒！'
const retryPraise = '再想想吧～'
const fireworkBursts = [
  { x: -160, y: -118, delay: 0 },
  { x: 164, y: -104, delay: 90 },
  { x: 0, y: -156, delay: 160 },
] as const
const fireworkColors = ['var(--sun)', 'var(--coral)', 'var(--leaf)', 'var(--sky)', 'var(--grape)']
const fireworkParticleCount = 14
const retryPuffs = [
  { x: -150, y: -86, size: 38, delay: 0 },
  { x: 142, y: -76, size: 30, delay: 70 },
  { x: -118, y: 104, size: 32, delay: 140 },
  { x: 132, y: 92, size: 42, delay: 210 },
  { x: 0, y: -128, size: 24, delay: 280 },
] as const
const mandarinVoiceNameHints = [
  'Tingting',
  'Xiaoxiao',
  'Xiaoyi',
  'Yunxi',
  'Meijia',
  'Sinji',
  'HanHan',
  'Yaoyao',
  'Kangkang',
  '普通话',
  '中文',
  'Chinese',
  'Mandarin',
] as const

const sampleImport = JSON.stringify(
  [
    {
      id: 'sample-import-shadow-001',
      age: 'age3',
      template: 'shadow',
      skill: '找阴影',
      prompt: '哪一个是小星星的影子？',
      scene: [{ shape: 'star', tone: 'sun' }],
      answerId: 'a',
      options: [
        { id: 'a', visuals: [{ shape: 'star', tone: 'ink' }] },
        { id: 'b', visuals: [{ shape: 'circle', tone: 'ink' }] },
        { id: 'c', visuals: [{ shape: 'triangle', tone: 'ink' }] },
      ],
      success: '星星的影子也是星星形状。',
      retry: '影子只看外面的轮廓。',
      tags: ['观察力', '形状', '空间'],
      difficulty: 2,
      status: 'needsReview',
    },
  ],
  null,
  2,
)

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

type RecentQuestionStore = Partial<Record<AgeKey, string[]>>

function createSessionSeed() {
  return Date.now() + Math.floor(Math.random() * 1_000_000)
}

function readRecentQuestionIds(age: AgeKey) {
  const store = readJson<RecentQuestionStore>(recentQuestionStorageKey, {})
  return Array.isArray(store[age]) ? store[age] : []
}

function rememberRecentQuestionIds(age: AgeKey, questionIds: string[]) {
  if (!questionIds.length) return
  const store = readJson<RecentQuestionStore>(recentQuestionStorageKey, {})
  const incomingIds = new Set(questionIds)
  const existingIds = Array.isArray(store[age]) ? store[age] : []
  const nextIds = [...questionIds, ...existingIds.filter((id) => !incomingIds.has(id))].slice(0, recentQuestionLimit)
  window.localStorage.setItem(recentQuestionStorageKey, JSON.stringify({ ...store, [age]: nextIds }))
}

function pickSceneArt(seed: number, offset = 0) {
  const index = Math.abs(seed + offset) % sceneArtGallery.length
  return sceneArtGallery[index]
}

function readThemeMode(): ThemeMode {
  const stored = readJson<ThemeMode | null>(themeStorageKey, null)
  return stored === 'night' || stored === 'day' ? stored : 'day'
}

function readPromptVoice(): PromptVoiceId {
  const stored = readJson<PromptVoiceId | null>(promptVoiceStorageKey, null)
  return stored && validPromptVoices.includes(stored) ? stored : 'lovely_girl'
}

function readAppFont(): AppFontId {
  const stored = readJson<AppFontId | null>(appFontStorageKey, null)
  return stored && validAppFonts.includes(stored) ? stored : 'jinnian'
}

function localDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} 秒`
  return `${Math.round(seconds / 60)} 分钟`
}

function playToyTone(
  frequency: number,
  startAt: number,
  duration: number,
  context: AudioContext,
  output: AudioNode,
  volume = 0.18,
  detune = 0,
) {
  const main = context.createOscillator()
  const softOvertone = context.createOscillator()
  const gain = context.createGain()
  const toneFilter = context.createBiquadFilter()

  main.type = 'sine'
  softOvertone.type = 'sine'
  main.frequency.setValueAtTime(frequency, startAt)
  main.detune.setValueAtTime(detune, startAt)
  softOvertone.frequency.setValueAtTime(frequency * 2, startAt)
  softOvertone.detune.setValueAtTime(detune - 7, startAt)
  toneFilter.type = 'lowpass'
  toneFilter.frequency.setValueAtTime(3200, startAt)
  toneFilter.frequency.exponentialRampToValueAtTime(1800, startAt + duration)
  toneFilter.Q.value = 0.65

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012)
  gain.gain.exponentialRampToValueAtTime(volume * 0.26, startAt + duration * 0.34)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  main.connect(toneFilter)
  softOvertone.connect(toneFilter)
  toneFilter.connect(gain)
  gain.connect(output)
  main.start(startAt)
  softOvertone.start(startAt)
  main.stop(startAt + duration + 0.04)
  softOvertone.stop(startAt + duration + 0.04)
}

function playSoftTap(
  startAt: number,
  context: AudioContext,
  output: AudioNode,
  volume = 0.04,
) {
  const noiseLength = Math.max(1, Math.floor(context.sampleRate * 0.045))
  const buffer = context.createBuffer(1, noiseLength, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < noiseLength; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / noiseLength)
  }
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = 950
  filter.Q.value = 0.8
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.09)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(output)
  source.start(startAt)
  source.stop(startAt + 0.1)
}

function playFeedbackSound(correct: boolean) {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const output = context.createGain()
    const filter = context.createBiquadFilter()
    const compressor = context.createDynamicsCompressor()
    output.gain.value = correct ? 0.46 : 0.34
    filter.type = 'lowpass'
    filter.frequency.value = correct ? 4300 : 3000
    filter.Q.value = 0.45
    compressor.threshold.value = -24
    compressor.knee.value = 20
    compressor.ratio.value = 4
    compressor.attack.value = 0.01
    compressor.release.value = 0.2
    output.connect(filter)
    filter.connect(compressor)
    compressor.connect(context.destination)

    if (context.state === 'suspended') {
      void context.resume()
    }

    const now = context.currentTime + 0.018
    const melody = correct
      ? [
          { frequency: 523.25, offset: 0, duration: 0.24, volume: 0.11, detune: -3 },
          { frequency: 659.25, offset: 0.07, duration: 0.25, volume: 0.12, detune: 4 },
          { frequency: 783.99, offset: 0.16, duration: 0.28, volume: 0.12, detune: -2 },
          { frequency: 1046.5, offset: 0.29, duration: 0.32, volume: 0.09, detune: 5 },
        ]
      : [
          { frequency: 392, offset: 0, duration: 0.22, volume: 0.08, detune: -4 },
          { frequency: 493.88, offset: 0.12, duration: 0.24, volume: 0.09, detune: 3 },
          { frequency: 587.33, offset: 0.26, duration: 0.28, volume: 0.075, detune: -2 },
        ]

    melody.forEach((note) =>
      playToyTone(note.frequency, now + note.offset, note.duration, context, output, note.volume, note.detune),
    )
    if (correct) {
      playSoftTap(now + 0.02, context, output, 0.035)
      playSoftTap(now + 0.24, context, output, 0.026)
      playToyTone(1318.51, now + 0.43, 0.26, context, output, 0.065, -6)
    } else {
      playSoftTap(now + 0.01, context, output, 0.018)
    }
    window.setTimeout(() => void context.close(), correct ? 900 : 720)
  } catch {
    // Audio feedback is a nicety; browsers can block it in quiet mode or tests.
  }
}

function playAnswerFeedbackTone(correct: boolean) {
  playFeedbackSound(correct)
}

function getPromptVoiceManifestUrl() {
  return new URL(promptVoiceManifestFile, window.location.href).toString()
}

function applyTtsUrlTemplate(template: string, question: Question, voice: PromptVoiceId) {
  const replacements: Record<string, string> = {
    id: question.id,
    text: question.prompt,
    prompt: question.prompt,
    age: question.age,
    skill: question.skill,
    voice,
  }
  return template.replace(/\{(id|text|prompt|age|skill|voice)\}/g, (_, key: string) =>
    encodeURIComponent(replacements[key] ?? ''),
  )
}

function resolvePromptAudioUrl(
  question: Question,
  manifest: PromptVoiceManifest | null,
  manifestBaseUrl: string,
  voice: PromptVoiceId,
) {
  if (!manifest) return null
  const selectedVoice = manifest.voices?.[voice]
  const fallbackVoice = manifest.defaultVoice ? manifest.voices?.[manifest.defaultVoice] : null
  const directUrl =
    selectedVoice?.entries?.[question.id] ??
    selectedVoice?.prompts?.[question.prompt] ??
    fallbackVoice?.entries?.[question.id] ??
    fallbackVoice?.prompts?.[question.prompt] ??
    manifest.entries?.[question.id] ??
    manifest.prompts?.[question.prompt]
  if (directUrl) return new URL(directUrl, manifestBaseUrl).toString()
  if (manifest.cloudTtsUrlTemplate) return applyTtsUrlTemplate(manifest.cloudTtsUrlTemplate, question, voice)
  return null
}

function resolveFeedbackAudioUrl(
  feedbackId: string,
  manifest: PromptVoiceManifest | null,
  manifestBaseUrl: string,
  voice: PromptVoiceId,
) {
  if (!manifest) return null
  const selectedVoice = manifest.voices?.[voice]
  const fallbackVoice = manifest.defaultVoice ? manifest.voices?.[manifest.defaultVoice] : null
  const directUrl =
    selectedVoice?.feedback?.[feedbackId] ??
    manifest.feedback?.[voice]?.[feedbackId] ??
    fallbackVoice?.feedback?.[feedbackId] ??
    (manifest.defaultVoice ? manifest.feedback?.[manifest.defaultVoice]?.[feedbackId] : undefined)
  return directUrl ? new URL(directUrl, manifestBaseUrl).toString() : null
}

function canUseSpeechSynthesis() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  )
}

function isMandarinVoice(voice: SpeechSynthesisVoice) {
  return (
    voice.lang.toLowerCase().startsWith('zh') ||
    /cmn|mandarin|chinese|普通话|中文|tingting|xiaoxiao|xiaoyi|yunxi|meijia|sinji/i.test(
      `${voice.lang} ${voice.name}`,
    )
  )
}

function pickMandarinVoice(voices: SpeechSynthesisVoice[]) {
  const mandarinVoices = voices.filter(isMandarinVoice)
  return (
    mandarinVoices.find((voice) =>
      mandarinVoiceNameHints.some((hint) => voice.name.toLowerCase().includes(hint.toLowerCase())),
    ) ??
    mandarinVoices.find((voice) => voice.localService) ??
    mandarinVoices[0] ??
    null
  )
}

function normalizeVisual(input: unknown): VisualToken | null {
  if (!input || typeof input !== 'object') return null
  const item = input as Partial<VisualToken>
  if (!validShapes.includes(item.shape as ShapeName)) return null
  if (!validTones.includes(item.tone as Tone)) return null
  return {
    shape: item.shape as ShapeName,
    tone: item.tone as Tone,
    item: validItems.includes(item.item as ItemName) ? (item.item as ItemName) : undefined,
    label: typeof item.label === 'string' ? item.label : undefined,
    small: Boolean(item.small),
  }
}

function normalizeImportedQuestion(input: unknown, index: number): { question?: Question; error?: string } {
  if (!input || typeof input !== 'object') return { error: `第 ${index + 1} 条不是对象` }
  const raw = input as Partial<Question>
  if (!validAges.includes(raw.age as AgeKey)) return { error: `第 ${index + 1} 条年龄段不合法` }
  if (!validTemplates.includes(raw.template as TemplateKind)) return { error: `第 ${index + 1} 条题型不合法` }
  if (typeof raw.prompt !== 'string' || !raw.prompt.trim()) return { error: `第 ${index + 1} 条缺少题干` }
  if (!Array.isArray(raw.options) || raw.options.length < 2) return { error: `第 ${index + 1} 条至少需要 2 个选项` }

  const scene = Array.isArray(raw.scene)
    ? raw.scene.map(normalizeVisual).filter((item): item is VisualToken => Boolean(item))
    : []
  const options = raw.options.map((item, optionIndex) => {
    const option = item as Question['options'][number]
    const visuals = Array.isArray(option.visuals)
      ? option.visuals.map(normalizeVisual).filter((visual): visual is VisualToken => Boolean(visual))
      : undefined
    return {
      id: typeof option.id === 'string' ? option.id : String.fromCharCode(97 + optionIndex),
      text: typeof option.text === 'string' ? option.text : undefined,
      visuals,
    }
  })
  const answerId = typeof raw.answerId === 'string' ? raw.answerId : options[0]?.id
  if (!options.some((option) => option.id === answerId)) return { error: `第 ${index + 1} 条答案不在选项中` }

  const difficulty = [1, 2, 3].includes(raw.difficulty as number)
    ? (raw.difficulty as Difficulty)
    : 1
  const status: ReviewStatus =
    raw.status === 'approved' || raw.status === 'draft' || raw.status === 'needsReview'
      ? raw.status
      : 'needsReview'

  return {
    question: {
      id:
        typeof raw.id === 'string' && raw.id.trim()
          ? `imported-${raw.id}`
          : `imported-${Date.now()}-${index}`,
      age: raw.age as AgeKey,
      template: raw.template as TemplateKind,
      skill: typeof raw.skill === 'string' && raw.skill.trim() ? raw.skill : '导入题',
      prompt: raw.prompt,
      scene,
      answerId,
      options,
      success: typeof raw.success === 'string' ? raw.success : '答对了。',
      retry: typeof raw.retry === 'string' ? raw.retry : '再试一次。',
      tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : ['导入'],
      difficulty,
      status,
      source: 'imported',
      meta: raw.meta,
    },
  }
}

function RadarChart({ values }: { values: Array<{ label: string; value: number }> }) {
  const center = 82
  const radius = 64
  const points = values
    .map((item, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length
      const distance = radius * (item.value / 100)
      return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`
    })
    .join(' ')

  return (
    <div className="radar-wrap">
      <svg className="radar-chart" viewBox="0 0 164 164" role="img" aria-label="能力雷达">
        {[0.35, 0.7, 1].map((scale) => (
          <polygon
            className="radar-grid"
            key={scale}
            points={values
              .map((_, index) => {
                const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length
                return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`
              })
              .join(' ')}
          />
        ))}
        <polygon className="radar-score" points={points} />
      </svg>
      <div className="radar-list">
        {values.map((item) => (
          <span key={item.label}>
            {item.label}
            <strong>{item.value}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

function FeedbackEffect({ correct }: { correct: boolean }) {
  if (!correct) {
    return (
      <div className="answer-effect-layer wrong" aria-hidden="true">
        <span className="retry-orbit" />
        {retryPuffs.map((puff, index) => (
          <span
            className="thinking-puff"
            key={`${puff.x}-${puff.y}`}
            style={
              {
                '--puff-delay': `${puff.delay}ms`,
                '--puff-size': `${puff.size}px`,
                '--puff-x': `${puff.x}px`,
                '--puff-y': `${puff.y}px`,
              } as CSSProperties
            }
          >
            {index < 3 && <i />}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="answer-effect-layer correct" aria-hidden="true">
      <span className="celebration-ring" />
      {fireworkBursts.map((burst, burstIndex) => (
        <span
          className="firework-burst"
          key={`${burst.x}-${burst.y}`}
          style={
            {
              '--burst-delay': `${burst.delay}ms`,
              '--burst-x': `${burst.x}px`,
              '--burst-y': `${burst.y}px`,
            } as CSSProperties
          }
        >
          {Array.from({ length: fireworkParticleCount }, (_, particleIndex) => (
            <i
              key={particleIndex}
              style={
                {
                  '--angle': `${(360 / fireworkParticleCount) * particleIndex}deg`,
                  '--distance': `${68 + ((particleIndex + burstIndex) % 4) * 13}px`,
                  '--effect-color': fireworkColors[(particleIndex + burstIndex) % fireworkColors.length],
                  '--particle-delay': `${burst.delay + particleIndex * 12}ms`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState<ScreenMode>('home')
  const [selectedAge, setSelectedAge] = useState<AgeKey | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [pickedOption, setPickedOption] = useState<string | null>(null)
  const [sessionSeed, setSessionSeed] = useState(() => Date.now())
  const [progress, setProgress] = useState<ProgressStore>(() => readJson(progressStorageKey, {}))
  const [activity, setActivity] = useState<ActivityStore>(() => readJson(activityStorageKey, emptyActivity))
  const [importedQuestions, setImportedQuestions] = useState<Question[]>(() => readJson(importedStorageKey, []))
  const [importText, setImportText] = useState('')
  const [importMessage, setImportMessage] = useState('还没有导入内容。')
  const [soundEnabled, setSoundEnabled] = useState(() => readJson(soundStorageKey, true))
  const [themeMode, setThemeMode] = useState<ThemeMode>(readThemeMode)
  const [promptVoice, setPromptVoice] = useState<PromptVoiceId>(readPromptVoice)
  const [appFont, setAppFont] = useState<AppFontId>(readAppFont)
  const [reviewQuestionIds, setReviewQuestionIds] = useState<string[] | null>(null)
  const [sessionWrongQuestionIds, setSessionWrongQuestionIds] = useState<string[]>([])
  const [sessionAvoidQuestionIds, setSessionAvoidQuestionIds] = useState<string[]>([])
  const [activeGesture, setActiveGestureState] = useState<ActiveOptionGesture | null>(null)
  const finishRecordedRef = useRef(false)
  const sessionStartedAtRef = useRef<number | null>(null)
  const activeGestureRef = useRef<ActiveOptionGesture | null>(null)
  const gesturePointerIdRef = useRef<number | null>(null)
  const suppressOptionClickRef = useRef(false)
  const questionSpeechTimerRef = useRef<number | null>(null)
  const questionAudioRef = useRef<HTMLAudioElement | null>(null)
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null)
  const promptVoiceManifestRef = useRef<PromptVoiceManifest | null>(null)
  const promptVoiceManifestBaseRef = useRef('')
  const speechVoicesRef = useRef<SpeechSynthesisVoice[]>([])

  const questionPool = useMemo(() => [...generatedQuestions, ...importedQuestions], [importedQuestions])
  const currentTrack = ageTracks.find((track) => track.key === selectedAge) ?? null
  const reviewQuestions = useMemo(() => {
    if (!reviewQuestionIds) return null
    return reviewQuestionIds
      .map((id) => questionPool.find((question) => question.id === id && question.status === 'approved'))
      .filter((question): question is Question => Boolean(question))
  }, [questionPool, reviewQuestionIds])
  const trackQuestions = useMemo(
    () =>
      reviewQuestions ??
      (selectedAge ? pickSessionQuestions(questionPool, selectedAge, sessionSeed, sessionAvoidQuestionIds) : []),
    [questionPool, reviewQuestions, selectedAge, sessionAvoidQuestionIds, sessionSeed],
  )
  const currentQuestion = trackQuestions[questionIndex] ?? null
  const score = answers.length
  const finished = selectedAge !== null && questionIndex >= trackQuestions.length
  const isReviewSession = Boolean(reviewQuestionIds)
  const promptVoiceProfile = promptVoiceProfiles[promptVoice]
  const appFontProfile = appFontProfiles[appFont]
  const homeSceneArt = thinkingPathArt
  const sessionSceneArt = selectedAge
    ? pickSceneArt(sessionSeed, questionIndex + validAges.indexOf(selectedAge) * 2)
    : homeSceneArt
  const resultSceneArt = selectedAge ? pickSceneArt(sessionSeed, score + 4) : homeSceneArt

  useEffect(() => {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    window.localStorage.setItem(activityStorageKey, JSON.stringify(activity))
  }, [activity])

  useEffect(() => {
    window.localStorage.setItem(importedStorageKey, JSON.stringify(importedQuestions))
  }, [importedQuestions])

  useEffect(() => {
    window.localStorage.setItem(soundStorageKey, JSON.stringify(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    window.localStorage.setItem(themeStorageKey, JSON.stringify(themeMode))
  }, [themeMode])

  useEffect(() => {
    window.localStorage.setItem(promptVoiceStorageKey, JSON.stringify(promptVoice))
  }, [promptVoice])

  useEffect(() => {
    document.documentElement.dataset.font = appFont
    window.localStorage.setItem(appFontStorageKey, JSON.stringify(appFont))
  }, [appFont])

  useEffect(() => {
    let cancelled = false
    const manifestUrl = getPromptVoiceManifestUrl()
    promptVoiceManifestBaseRef.current = manifestUrl

    fetch(manifestUrl, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest: PromptVoiceManifest | null) => {
        if (cancelled || !manifest || typeof manifest !== 'object') return
        promptVoiceManifestRef.current = manifest
        promptVoiceManifestBaseRef.current = manifest.baseUrl
          ? new URL(manifest.baseUrl, manifestUrl).toString()
          : manifestUrl
      })
      .catch(() => {
        // Prompt voice packs are optional; system speech remains the fallback.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!canUseSpeechSynthesis()) return undefined

    const refreshVoices = () => {
      speechVoicesRef.current = window.speechSynthesis.getVoices()
    }

    refreshVoices()
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  const stopQuestionSpeech = useCallback(() => {
    if (questionSpeechTimerRef.current !== null) {
      window.clearTimeout(questionSpeechTimerRef.current)
      questionSpeechTimerRef.current = null
    }
    if (questionAudioRef.current) {
      questionAudioRef.current.pause()
      questionAudioRef.current.currentTime = 0
      questionAudioRef.current = null
    }
    if (canUseSpeechSynthesis()) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const stopFeedbackSpeech = useCallback(() => {
    if (feedbackAudioRef.current) {
      feedbackAudioRef.current.pause()
      feedbackAudioRef.current.currentTime = 0
      feedbackAudioRef.current = null
    }
  }, [])

  const speakQuestionWithSystemVoice = useCallback(
    (question: Question | null, force = false) => {
      if (!question || (!soundEnabled && !force) || !shouldPlayFeedbackAudio || !canUseSpeechSynthesis()) return

      try {
        const voices = speechVoicesRef.current.length
          ? speechVoicesRef.current
          : window.speechSynthesis.getVoices()
        speechVoicesRef.current = voices

        const utterance = new SpeechSynthesisUtterance(question.prompt)
        const mandarinVoice = pickMandarinVoice(voices)
        utterance.lang = mandarinVoice?.lang ?? 'zh-CN'
        utterance.voice = mandarinVoice
        utterance.rate = 0.86
        utterance.pitch = 1.08
        utterance.volume = 0.95
        window.speechSynthesis.speak(utterance)
      } catch {
        // Some embedded browsers expose speech APIs but block playback.
      }
    },
    [soundEnabled],
  )

  const speakQuestionPrompt = useCallback(
    (question: Question | null, force = false) => {
      if (!question || (!soundEnabled && !force) || !shouldPlayFeedbackAudio) return

      stopQuestionSpeech()
      const audioUrl = resolvePromptAudioUrl(
        question,
        promptVoiceManifestRef.current,
        promptVoiceManifestBaseRef.current || getPromptVoiceManifestUrl(),
        promptVoice,
      )

      if (audioUrl) {
        try {
          const audio = new Audio(audioUrl)
          audio.preload = 'auto'
          questionAudioRef.current = audio
          void audio.play().catch(() => {
            if (questionAudioRef.current === audio) {
              questionAudioRef.current = null
              speakQuestionWithSystemVoice(question, force)
            }
          })
          return
        } catch {
          // Fall through to system speech.
        }
      }

      speakQuestionWithSystemVoice(question, force)
    },
    [promptVoice, soundEnabled, speakQuestionWithSystemVoice, stopQuestionSpeech],
  )

  const playAnswerFeedback = useCallback(
    (correct: boolean, force = false) => {
      if ((!soundEnabled && !force) || !shouldPlayFeedbackAudio) return

      stopFeedbackSpeech()
      playAnswerFeedbackTone(correct)
      const feedbackId = correct ? 'answer-correct' : 'answer-wrong'
      const audioUrl = resolveFeedbackAudioUrl(
        feedbackId,
        promptVoiceManifestRef.current,
        promptVoiceManifestBaseRef.current || getPromptVoiceManifestUrl(),
        promptVoice,
      )

      if (!audioUrl) return

      try {
        const audio = new Audio(audioUrl)
        audio.preload = 'auto'
        feedbackAudioRef.current = audio
        void audio.play().catch(() => {
          if (feedbackAudioRef.current === audio) {
            feedbackAudioRef.current = null
          }
        })
      } catch {
        // The tone feedback already played; recorded feedback is optional.
      }
    },
    [promptVoice, soundEnabled, stopFeedbackSpeech],
  )

  useEffect(() => {
    if (!selectedAge || finished || pickedOption || !currentQuestion || !soundEnabled || !shouldPlayFeedbackAudio) {
      stopQuestionSpeech()
      return undefined
    }

    questionSpeechTimerRef.current = window.setTimeout(() => {
      speakQuestionPrompt(currentQuestion)
    }, 360)

    return () => stopQuestionSpeech()
  }, [
    currentQuestion,
    finished,
    pickedOption,
    selectedAge,
    soundEnabled,
    speakQuestionPrompt,
    stopQuestionSpeech,
  ])

  function toggleTheme() {
    setThemeMode((mode) => (mode === 'day' ? 'night' : 'day'))
  }

  function togglePromptVoice() {
    setPromptVoice((voice) => (voice === 'lovely_girl' ? 'cute_boy' : 'lovely_girl'))
  }

  function toggleAppFont() {
    setAppFont((font) => {
      const index = validAppFonts.indexOf(font)
      return validAppFonts[(index + 1) % validAppFonts.length]
    })
  }

  function replayQuestionPrompt() {
    if (!currentQuestion) return
    if (!soundEnabled) setSoundEnabled(true)
    window.setTimeout(() => speakQuestionPrompt(currentQuestion, true), soundEnabled ? 0 : 50)
  }

  function startTrack(age: AgeKey) {
    stopQuestionSpeech()
    stopFeedbackSpeech()
    setScreen('home')
    setSelectedAge(age)
    setQuestionIndex(0)
    setAnswers([])
    setPickedOption(null)
    setReviewQuestionIds(null)
    setSessionWrongQuestionIds([])
    setSessionAvoidQuestionIds(readRecentQuestionIds(age))
    setSessionSeed(createSessionSeed())
    finishRecordedRef.current = false
    sessionStartedAtRef.current = Date.now()
  }

  function goHome() {
    stopQuestionSpeech()
    stopFeedbackSpeech()
    setScreen('home')
    setSelectedAge(null)
    setQuestionIndex(0)
    setAnswers([])
    setPickedOption(null)
    setReviewQuestionIds(null)
    setSessionWrongQuestionIds([])
    setSessionAvoidQuestionIds([])
    finishRecordedRef.current = false
    sessionStartedAtRef.current = null
  }

  function toggleSound() {
    setSoundEnabled((enabled) => {
      const nextEnabled = !enabled
      if (!nextEnabled) {
        stopQuestionSpeech()
        stopFeedbackSpeech()
      }
      if (nextEnabled && shouldPlayFeedbackAudio && !currentQuestion) {
        window.setTimeout(() => playFeedbackSound(true), 0)
      }
      return nextEnabled
    })
  }

  function replayFeedback(correct: boolean) {
    if (!soundEnabled) {
      setSoundEnabled(true)
    }
    if (shouldPlayFeedbackAudio) {
      window.setTimeout(() => playAnswerFeedback(correct, true), soundEnabled ? 0 : 40)
    }
  }

  function startReview(questionIds: string[]) {
    const uniqueQuestionIds = [...new Set(questionIds)]
    const questions = uniqueQuestionIds
      .map((id) => questionPool.find((question) => question.id === id && question.status === 'approved'))
      .filter((question): question is Question => Boolean(question))
    if (!questions.length) return

    stopQuestionSpeech()
    stopFeedbackSpeech()
    setScreen('home')
    setSelectedAge(questions[0].age)
    setQuestionIndex(0)
    setAnswers([])
    setPickedOption(null)
    setReviewQuestionIds(questions.map((question) => question.id))
    setSessionWrongQuestionIds([])
    setSessionAvoidQuestionIds([])
    setSessionSeed(createSessionSeed())
    finishRecordedRef.current = false
    sessionStartedAtRef.current = Date.now()
  }

  function recordAttempt(question: Question, optionId: string, correct: boolean) {
    const attempt: PracticeAttempt = {
      id: `${question.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      questionId: question.id,
      age: question.age,
      template: question.template,
      skill: question.skill,
      prompt: question.prompt,
      tags: question.tags,
      difficulty: question.difficulty,
      optionId,
      correct,
      retry: question.retry,
      createdAt: new Date().toISOString(),
    }
    setActivity((existing) => ({
      ...existing,
      attempts: [...existing.attempts, attempt].slice(-600),
    }))
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || pickedOption) return
    const correct = optionId === currentQuestion.answerId
    stopQuestionSpeech()
    setPickedOption(optionId)
    if (soundEnabled && shouldPlayFeedbackAudio) playAnswerFeedback(correct)
    recordAttempt(currentQuestion, optionId, correct)
    if (correct) {
      setAnswers((existing) => [...existing, { questionId: currentQuestion.id, optionId }])
    } else {
      setSessionWrongQuestionIds((existing) =>
        existing.includes(currentQuestion.id) ? existing : [...existing, currentQuestion.id],
      )
    }
  }

  function setActiveGesture(nextGesture: ActiveOptionGesture | null) {
    activeGestureRef.current = nextGesture
    setActiveGestureState(nextGesture)
  }

  function isGestureTemplate(template: TemplateKind): template is GestureTemplate {
    return template === 'drag' || template === 'connect'
  }

  function isOverGestureTarget(template: GestureTemplate, x: number, y: number) {
    const targetSelector = template === 'drag' ? '.drop-zone' : '.connect-target'
    return Boolean(document.elementFromPoint(x, y)?.closest(targetSelector))
  }

  function beginOptionGesture(event: ReactPointerEvent<HTMLButtonElement>, optionId: string) {
    if (!currentQuestion || pickedOption || !isGestureTemplate(currentQuestion.template)) return
    const rect = event.currentTarget.getBoundingClientRect()
    const nextGesture: ActiveOptionGesture = {
      optionId,
      template: currentQuestion.template,
      startX: event.clientX,
      startY: event.clientY,
      anchorX: rect.left + rect.width / 2,
      anchorY: rect.top + rect.height / 2,
      x: event.clientX,
      y: event.clientY,
      overTarget: isOverGestureTarget(currentQuestion.template, event.clientX, event.clientY),
      hasMoved: false,
    }
    gesturePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveGesture(nextGesture)
  }

  function moveOptionGesture(event: ReactPointerEvent<HTMLButtonElement>) {
    const currentGesture = activeGestureRef.current
    if (!currentGesture || gesturePointerIdRef.current !== event.pointerId) return

    const hasMoved =
      currentGesture.hasMoved ||
      Math.hypot(event.clientX - currentGesture.startX, event.clientY - currentGesture.startY) > 7
    const nextGesture = {
      ...currentGesture,
      x: event.clientX,
      y: event.clientY,
      overTarget: isOverGestureTarget(currentGesture.template, event.clientX, event.clientY),
      hasMoved,
    }
    if (hasMoved) event.preventDefault()
    setActiveGesture(nextGesture)
  }

  function endOptionGesture(event: ReactPointerEvent<HTMLButtonElement>) {
    const currentGesture = activeGestureRef.current
    if (!currentGesture || gesturePointerIdRef.current !== event.pointerId) return

    const overTarget = isOverGestureTarget(currentGesture.template, event.clientX, event.clientY)
    if (currentGesture.hasMoved || overTarget) suppressOptionClickRef.current = true
    if (overTarget) chooseOption(currentGesture.optionId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    gesturePointerIdRef.current = null
    setActiveGesture(null)
  }

  function cancelOptionGesture(event: ReactPointerEvent<HTMLButtonElement>) {
    const currentGesture = activeGestureRef.current
    if (!currentGesture || gesturePointerIdRef.current !== event.pointerId) return
    if (currentGesture.hasMoved) suppressOptionClickRef.current = true
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    gesturePointerIdRef.current = null
    setActiveGesture(null)
  }

  function handleOptionClick(event: ReactMouseEvent<HTMLButtonElement>, optionId: string) {
    if (suppressOptionClickRef.current) {
      suppressOptionClickRef.current = false
      event.preventDefault()
      return
    }
    chooseOption(optionId)
  }

  function finishTrack() {
    if (!selectedAge) return
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - (sessionStartedAtRef.current ?? Date.now())) / 1000),
    )

    if (!isReviewSession) {
      rememberRecentQuestionIds(selectedAge, trackQuestions.map((question) => question.id))
      setProgress((existing) => {
        const previous = existing[selectedAge]
        return {
          ...existing,
          [selectedAge]: {
            plays: (previous?.plays ?? 0) + 1,
            best: Math.max(previous?.best ?? 0, score),
            lastTotal: trackQuestions.length,
          },
        }
      })
    }
    setActivity((existing) => ({
      ...existing,
      sessions: [
        ...existing.sessions,
        {
          id: `${selectedAge}-${Date.now()}`,
          age: selectedAge,
          total: trackQuestions.length,
          correct: score,
          durationSeconds,
          createdAt: new Date().toISOString(),
        },
      ].slice(-120),
    }))
  }

  function showParentMode() {
    stopQuestionSpeech()
    setSelectedAge(null)
    setScreen('parent')
  }

  function showAdminMode() {
    stopQuestionSpeech()
    setSelectedAge(null)
    setScreen('admin')
  }

  function importQuestions() {
    try {
      const parsed = JSON.parse(importText)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      const normalized = items.map(normalizeImportedQuestion)
      const firstError = normalized.find((item) => item.error)
      if (firstError?.error) {
        setImportMessage(firstError.error)
        return
      }
      const nextQuestions = normalized
        .map((item) => item.question)
        .filter((question): question is Question => Boolean(question))
      setImportedQuestions((existing) => [...existing, ...nextQuestions])
      setImportText('')
      setImportMessage(`已导入 ${nextQuestions.length} 道题，默认进入待审核。`)
    } catch {
      setImportMessage('JSON 格式不正确，请检查逗号、引号和括号。')
    }
  }

  function updateImportedStatus(id: string, status: ReviewStatus) {
    setImportedQuestions((existing) =>
      existing.map((question) => (question.id === id ? { ...question, status } : question)),
    )
  }

  function approveAllImported() {
    setImportedQuestions((existing) => existing.map((question) => ({ ...question, status: 'approved' })))
    setImportMessage('所有导入题已审核通过，会进入孩子端题库。')
  }

  useEffect(() => {
  if (finished && !finishRecordedRef.current) {
      finishRecordedRef.current = true
      finishTrack()
    }
    // The finish action should run once when a session reaches the summary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  useEffect(() => {
    if (!pickedOption || !currentQuestion) return undefined

    const answeredCorrectlyNow = pickedOption === currentQuestion.answerId
    const timer = window.setTimeout(() => {
      if (answeredCorrectlyNow) {
        setPickedOption(null)
        setQuestionIndex((index) => index + 1)
      } else {
        setPickedOption(null)
      }
    }, autoAdvanceDelayMs)

    return () => window.clearTimeout(timer)
  }, [currentQuestion, pickedOption])

  const todayKey = localDateKey(new Date())
  const todaySeconds = activity.sessions
    .filter((session) => localDateKey(session.createdAt) === todayKey)
    .reduce((sum, session) => sum + session.durationSeconds, 0)
  const wrongAttempts = activity.attempts.filter((attempt) => !attempt.correct).slice(-3).reverse()
  const wrongReviewQuestionIds = [...new Set(wrongAttempts.map((attempt) => attempt.questionId))]
  const recentAttempts = activity.attempts.slice(-120)
  const recentCorrect = recentAttempts.filter((attempt) => attempt.correct).length
  const recentAccuracy = recentAttempts.length ? Math.round((recentCorrect / recentAttempts.length) * 100) : 0
  const radarValues = ['观察力', '数量', '规律', '空间', '逻辑'].map((label) => {
    const attempts = recentAttempts.filter((attempt) => attempt.tags.includes(label))
    if (!attempts.length) return { label, value: 0 }
    return {
      label,
      value: Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100),
    }
  })

  if (!selectedAge) {
    return (
      <main className="app-shell home-screen">
        <div className="play-stickers" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <img className="brand-mark-art" src={brandLogoArt} alt="" />
            </span>
            <div>
              <h1>小小思维岛</h1>
              <p>每天 5 分钟小练习</p>
            </div>
          </div>
          <div className="top-actions">
            <button
              aria-label={soundEnabled ? '关闭声音' : '打开声音'}
              className={soundEnabled ? 'small-tool-button sound-toggle' : 'small-tool-button sound-toggle is-muted'}
              type="button"
              onClick={toggleSound}
            >
              {soundEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
              <span>{soundEnabled ? '声音' : '静音'}</span>
            </button>
            <button
              aria-label={`切换题目音色，当前${promptVoiceProfile.label}`}
              className={`small-tool-button voice-toggle-button is-${promptVoice}`}
              type="button"
              onClick={togglePromptVoice}
            >
              <Star size={18} aria-hidden="true" />
              <span>{promptVoiceProfile.label}</span>
              <b aria-hidden="true">{promptVoiceProfile.short}</b>
            </button>
            <button
              aria-label={`切换字体，当前${appFontProfile.label}`}
              className={`small-tool-button font-toggle-button is-${appFont}`}
              type="button"
              onClick={toggleAppFont}
            >
              <Type size={18} aria-hidden="true" />
              <span>{appFontProfile.label}</span>
              <b aria-hidden="true">{appFontProfile.short}</b>
            </button>
            <button
              aria-label={themeMode === 'day' ? '切换到黑夜模式' : '切换到白天模式'}
              aria-pressed={themeMode === 'night'}
              className={`small-tool-button theme-toggle is-${themeMode}`}
              type="button"
              onClick={toggleTheme}
            >
              {themeMode === 'day' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              <span>{themeMode === 'day' ? '白天' : '黑夜'}</span>
            </button>
            <button className="small-tool-button" type="button" onClick={showParentMode} aria-label="家长">
              <BarChart3 size={18} aria-hidden="true" />
              <span>家长</span>
            </button>
            <button className="small-tool-button" type="button" onClick={showAdminMode} aria-label="题库">
              <Database size={18} aria-hidden="true" />
              <span>题库</span>
            </button>
          </div>
        </header>

        {screen === 'parent' && (
          <section className="panel-screen parent-screen" aria-labelledby="parent-title">
            <div className="section-heading">
              <p className="eyebrow">家长模式</p>
              <h2 id="parent-title">练习记录</h2>
              <button className="secondary-button" type="button" onClick={goHome}>
                <Home size={18} aria-hidden="true" />
                返回
              </button>
            </div>
            <div className="parent-grid">
              <article className="stat-card">
                <span>今日练习</span>
                <strong>{formatDuration(todaySeconds)}</strong>
              </article>
              <article className="stat-card">
                <span>近况正确率</span>
                <strong>{recentAccuracy}%</strong>
              </article>
              <article className="stat-card">
                <span>错题记录</span>
                <strong>{wrongAttempts.length}</strong>
              </article>
            </div>
            <div className="dashboard-grid">
              <article className="dashboard-card">
                <h3>能力雷达</h3>
                <RadarChart values={radarValues} />
              </article>
              <article className="dashboard-card">
                <div className="card-title-row">
                  <h3>最近错题</h3>
                  {wrongReviewQuestionIds.length > 0 && (
                    <button
                      className="mini-action-button"
                      type="button"
                      onClick={() => startReview(wrongReviewQuestionIds)}
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                      重练全部
                    </button>
                  )}
                </div>
                <div className="wrong-list">
                  {wrongAttempts.length ? (
                    wrongAttempts.map((attempt) => (
                      <div className="wrong-item" key={attempt.id}>
                        <div className="wrong-item-copy">
                          <span>{attempt.skill} · 难度 {attempt.difficulty}</span>
                          <strong>{attempt.prompt}</strong>
                          <p>{attempt.retry}</p>
                        </div>
                        <button
                          className="wrong-retry-button"
                          type="button"
                          onClick={() => startReview([attempt.questionId])}
                        >
                          <RotateCcw size={15} aria-hidden="true" />
                          重练
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-note">还没有错题记录。</p>
                  )}
                </div>
              </article>
            </div>
          </section>
        )}

        {screen === 'admin' && (
          <section className="panel-screen admin-screen" aria-labelledby="admin-title">
            <div className="section-heading">
              <p className="eyebrow">内容后台</p>
              <h2 id="admin-title">题库导入与审核</h2>
              <button className="secondary-button" type="button" onClick={goHome}>
                <Home size={18} aria-hidden="true" />
                返回
              </button>
            </div>
            <div className="admin-grid">
              <article className="dashboard-card import-card">
                <h3>JSON 导入</h3>
                <textarea
                  aria-label="题目 JSON"
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="粘贴题目 JSON，可以是单题对象，也可以是数组。"
                />
                <div className="admin-actions">
                  <button className="primary-button" type="button" onClick={importQuestions}>
                    <Upload size={18} aria-hidden="true" />
                    导入
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setImportText(sampleImport)}>
                    <FileJson size={18} aria-hidden="true" />
                    填入样例
                  </button>
                </div>
                <p className="import-message">{importMessage}</p>
              </article>
              <article className="dashboard-card">
                <h3>年龄段审核</h3>
                <div className="audit-summary">
                  {ageTracks.map((track) => (
                    <span key={track.key}>
                      {track.label}
                      <strong>{getQuestionCountByAge(questionPool, track.key)} 道通过</strong>
                    </span>
                  ))}
                </div>
                <div className="admin-actions">
                  <button className="secondary-button" type="button" onClick={approveAllImported}>
                    <ClipboardCheck size={18} aria-hidden="true" />
                    全部通过
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setImportedQuestions([])}>
                    清空导入
                  </button>
                </div>
              </article>
            </div>
            <div className="review-list">
              {importedQuestions.length ? (
                importedQuestions.slice(-3).reverse().map((question) => (
                  <article className="review-item" key={question.id}>
                    <div>
                      <span>{question.age} · {question.template} · 难度 {question.difficulty}</span>
                      <strong>{question.prompt}</strong>
                      <p>{question.tags.join(' / ')}</p>
                    </div>
                    <div className="review-actions">
                      <button type="button" onClick={() => updateImportedStatus(question.id, 'approved')}>
                        通过
                      </button>
                      <button type="button" onClick={() => updateImportedStatus(question.id, 'needsReview')}>
                        待审
                      </button>
                      <button type="button" onClick={() => updateImportedStatus(question.id, 'draft')}>
                        草稿
                      </button>
                      <em>{question.status}</em>
                    </div>
                  </article>
                ))
              ) : (
                <p className="empty-note">还没有导入题目。生成题库已内置 {generatedQuestions.length} 道。</p>
              )}
            </div>
          </section>
        )}

        {screen === 'home' && (
          <>
            <section className="home-hero" aria-labelledby="age-title">
              <div className="age-copy">
                <p className="eyebrow">选择年龄</p>
                <h2 id="age-title">今天从哪一组开始？</h2>
                <div className="home-map-card" aria-hidden="true">
                  <img className="home-map-art" src={homeSceneArt} alt="" />
                </div>
              </div>

              <div className="age-grid">
                {ageTracks.map((track) => {
                  const stored = progress[track.key]
                  const [ageNumber, ageUnit = '岁'] = track.short.split(/\s+/)
                  return (
                    <button
                      className={`age-card tone-border-${track.accent}`}
                      key={track.key}
                      aria-label={`开始 ${track.label} 练习`}
                      type="button"
                      onClick={() => startTrack(track.key)}
                    >
                      <span className="age-topline">
                        <span className="age-big" aria-hidden="true">
                          <span className="age-number">{ageNumber}</span>
                          <span className="age-unit">{ageUnit}</span>
                        </span>
                        <span className="age-star" aria-hidden="true" />
                      </span>
                      <span className="age-label">{track.label}</span>
                      <span className="age-focus">{track.focus}</span>
                      <span className="age-toys" aria-hidden="true">
                        <VisualRow tokens={ageCardVisuals[track.key]} />
                      </span>
                      <span className="age-footer">
                        <span className="age-meta">
                          {stored ? `玩过 ${stored.plays} 次` : '新冒险'} · 今日 {sessionQuestionCount} 个小游戏
                        </span>
                        <span className="age-start-cue" aria-hidden="true">
                          <ChevronRight size={18} />
                          开始
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

          </>
        )}
      </main>
    )
  }

  if (finished || !currentQuestion || !currentTrack) {
    const resultTitle = isReviewSession ? '错题重练' : currentTrack?.label ?? '练习'
    return (
      <main className="app-shell result-screen">
        <header className="quiz-topbar">
          <button className="icon-button" type="button" onClick={goHome} aria-label="返回首页">
            <Home size={22} aria-hidden="true" />
          </button>
          <span>{resultTitle}</span>
          <button
            className={soundEnabled ? 'icon-button sound-icon-button' : 'icon-button sound-icon-button is-muted'}
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? '关闭声音' : '打开声音'}
          >
            {soundEnabled ? <Volume2 size={21} aria-hidden="true" /> : <VolumeX size={21} aria-hidden="true" />}
          </button>
          <button
            className={`icon-button theme-icon-button is-${themeMode}`}
            type="button"
            onClick={toggleTheme}
            aria-pressed={themeMode === 'night'}
            aria-label={themeMode === 'day' ? '切换到黑夜模式' : '切换到白天模式'}
          >
            {themeMode === 'day' ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
          </button>
        </header>

        <section className="result-panel" aria-live="polite">
          <div className="result-map" aria-hidden="true">
            <img className="result-map-art" src={resultSceneArt} alt="" />
            <span className="result-icon">
              <Trophy size={44} strokeWidth={2.2} />
            </span>
          </div>
          <div className="result-score-card">
            <p className="eyebrow">完成啦</p>
            <h2>{score} / {trackQuestions.length}</h2>
            <p className="result-message">{isReviewSession ? '这组重练做完啦。' : '这组练习做完啦。'}</p>
            {!isReviewSession && sessionWrongQuestionIds.length > 0 && (
              <p className="result-parent-note">错题已放进家长记录。</p>
            )}
          </div>
          <div className="result-actions">
            {sessionWrongQuestionIds.length > 0 && (
              <button
                className="primary-button"
                type="button"
                onClick={() => startReview(sessionWrongQuestionIds)}
              >
                <RotateCcw size={20} aria-hidden="true" />
                重练错题
              </button>
            )}
            {selectedAge && (
              <>
                <button className="primary-button" type="button" onClick={() => startTrack(selectedAge)}>
                  <ChevronRight size={20} aria-hidden="true" />
                  玩更多
                </button>
                <button className="secondary-button" type="button" onClick={() => startTrack(selectedAge)}>
                  <RotateCcw size={20} aria-hidden="true" />
                  再玩一次
                </button>
              </>
            )}
            <button className="secondary-button" type="button" onClick={goHome}>
              <Home size={20} aria-hidden="true" />
              换年龄
            </button>
          </div>
        </section>
      </main>
    )
  }

  const answeredCorrectly = pickedOption === currentQuestion.answerId
  const progressPercent = ((questionIndex + 1) / trackQuestions.length) * 100
  const sessionTitle = isReviewSession ? '错题重练' : currentTrack.label
  const activeGestureOption = activeGesture
    ? currentQuestion.options.find((option) => option.id === activeGesture.optionId)
    : null

  return (
    <main className="app-shell quiz-screen">
      <div className="play-stickers quiz-stickers" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <img className="quiz-trail-art" src={sessionSceneArt} alt="" aria-hidden="true" />
      <header className="quiz-topbar">
        <button className="icon-button" type="button" onClick={goHome} aria-label="返回年龄选择">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div className="quiz-title">
          <span>{sessionTitle}</span>
          <strong>{questionIndex + 1} / {trackQuestions.length}</strong>
        </div>
        <button
          className={soundEnabled ? 'icon-button sound-icon-button' : 'icon-button sound-icon-button is-muted'}
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? '关闭声音' : '打开声音'}
        >
          {soundEnabled ? <Volume2 size={21} aria-hidden="true" /> : <VolumeX size={21} aria-hidden="true" />}
        </button>
        <button
          className={`icon-button theme-icon-button is-${themeMode}`}
          type="button"
          onClick={toggleTheme}
          aria-pressed={themeMode === 'night'}
          aria-label={themeMode === 'day' ? '切换到黑夜模式' : '切换到白天模式'}
        >
          {themeMode === 'day' ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
        </button>
      </header>

      <div
        className="progress-track"
        aria-hidden="true"
        style={{ '--progress': `${progressPercent}%` } as CSSProperties}
      >
        <span />
      </div>

      <div className="quiz-playmat">
        <section className="question-area" data-question-id={currentQuestion.id}>
          <div className="question-heading">
            <div className="skill-chip">
              <Star size={17} aria-hidden="true" />
              {currentQuestion.skill}
            </div>
            <button className="question-voice-button" type="button" onClick={replayQuestionPrompt}>
              {soundEnabled ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
              {soundEnabled ? '再读题目' : '打开并读题'}
            </button>
          </div>
          <h2>{currentQuestion.prompt}</h2>

          <div className={`question-stage template-${currentQuestion.template}`}>
            <QuestionStage
              question={currentQuestion}
              disabled={Boolean(pickedOption)}
              pickedOption={pickedOption}
              onAnswer={chooseOption}
              stageGesture={
                activeGesture
                  ? { template: activeGesture.template, overTarget: activeGesture.overTarget }
                  : null
              }
            />
          </div>
        </section>

        <section
          className={`option-grid template-${currentQuestion.template} option-count-${currentQuestion.options.length}`}
          aria-label="答案选项"
        >
          {currentQuestion.options.map((option) => {
            const isPicked = pickedOption === option.id
            const isCorrect = option.id === currentQuestion.answerId
            const pickedCorrectly = pickedOption === currentQuestion.answerId
            const isGestureSource = activeGesture?.optionId === option.id
            const stateClass = pickedOption
              ? pickedCorrectly
                ? isCorrect
                  ? 'is-correct'
                  : 'is-muted'
                : isPicked
                  ? 'is-wrong'
                  : 'is-muted'
              : ''

            return (
              <button
                className={[
                  'option-button',
                  `template-${currentQuestion.template}`,
                  stateClass,
                  isGestureSource ? 'is-gesture-source' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={Boolean(pickedOption)}
                draggable={false}
                key={option.id}
                type="button"
                onClick={(event) => handleOptionClick(event, option.id)}
                onDragStart={(event) => event.preventDefault()}
                onPointerCancel={cancelOptionGesture}
                onPointerDown={(event) => beginOptionGesture(event, option.id)}
                onPointerMove={moveOptionGesture}
                onPointerUp={endOptionGesture}
              >
                <OptionContent option={option} />
              </button>
            )
          })}
        </section>
      </div>

      {activeGesture && activeGestureOption && (
        <>
          {activeGesture.template === 'connect' && (
            <svg className="gesture-thread" aria-hidden="true">
              <line
                x1={activeGesture.anchorX}
                y1={activeGesture.anchorY}
                x2={activeGesture.x}
                y2={activeGesture.y}
              />
            </svg>
          )}
          <div
            aria-hidden="true"
            className={[
              'gesture-ghost',
              `template-${activeGesture.template}`,
              activeGesture.overTarget ? 'is-over-target' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ left: activeGesture.x, top: activeGesture.y }}
          >
            <OptionContent option={activeGestureOption} />
          </div>
        </>
      )}

      {pickedOption && (
        <>
          <div className={answeredCorrectly ? 'feedback-scrim correct' : 'feedback-scrim wrong'} aria-hidden="true" />
          <FeedbackEffect correct={answeredCorrectly} />
          <section className={answeredCorrectly ? 'feedback correct' : 'feedback wrong'} aria-live="polite">
            <div className="feedback-copy">
              <span className="feedback-mark" aria-hidden="true">
                {answeredCorrectly ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
              </span>
              <div className="feedback-text">
                <strong>{answeredCorrectly ? correctPraise : retryPraise}</strong>
                <p>{answeredCorrectly ? currentQuestion.success : currentQuestion.retry}</p>
              </div>
            </div>
            <button className="feedback-replay" type="button" onClick={() => replayFeedback(answeredCorrectly)}>
              {soundEnabled ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
              {soundEnabled ? '再播一次' : '打开声音'}
            </button>
            <div className="auto-hint" aria-hidden="true">
              <span />
              {answeredCorrectly ? '马上下一题' : '马上再试'}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default App
