import {
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileJson,
  Home,
  RotateCcw,
  Shapes,
  Star,
  Trophy,
  Upload,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OptionContent, QuestionStage, VisualRow } from './components/QuestionViews'
import {
  ageTracks,
  generatedQuestions,
  getQuestionCountByAge,
  pickSessionQuestions,
  sessionQuestionCount,
} from './data/questionBank'
import type {
  ActivityStore,
  AgeKey,
  Difficulty,
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
type SessionAnswer = {
  questionId: string
  optionId: string
}

const progressStorageKey = 'kids-thinking-play-progress'
const activityStorageKey = 'kids-thinking-play-activity'
const importedStorageKey = 'kids-thinking-play-imported-questions'
const validAges: AgeKey[] = ['age2', 'age3', 'age4']
const validTemplates: TemplateKind[] = ['choice', 'drag', 'connect', 'shadow', 'maze', 'leftRight']
const validShapes: ShapeName[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'pill']
const validTones: Tone[] = ['coral', 'leaf', 'sky', 'sun', 'grape', 'ink']

const emptyActivity: ActivityStore = {
  attempts: [],
  sessions: [],
}
const autoAdvanceDelayMs = new URLSearchParams(window.location.search).get('testFast') === '1' ? 120 : 2000

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

function normalizeVisual(input: unknown): VisualToken | null {
  if (!input || typeof input !== 'object') return null
  const item = input as Partial<VisualToken>
  if (!validShapes.includes(item.shape as ShapeName)) return null
  if (!validTones.includes(item.tone as Tone)) return null
  return {
    shape: item.shape as ShapeName,
    tone: item.tone as Tone,
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
  const finishRecordedRef = useRef(false)
  const sessionStartedAtRef = useRef<number | null>(null)

  const questionPool = useMemo(() => [...generatedQuestions, ...importedQuestions], [importedQuestions])
  const currentTrack = ageTracks.find((track) => track.key === selectedAge) ?? null
  const trackQuestions = useMemo(
    () => (selectedAge ? pickSessionQuestions(questionPool, selectedAge, sessionSeed) : []),
    [questionPool, selectedAge, sessionSeed],
  )
  const currentQuestion = trackQuestions[questionIndex] ?? null
  const score = answers.length
  const finished = selectedAge !== null && questionIndex >= trackQuestions.length
  const totalApproved = questionPool.filter((question) => question.status === 'approved').length

  useEffect(() => {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    window.localStorage.setItem(activityStorageKey, JSON.stringify(activity))
  }, [activity])

  useEffect(() => {
    window.localStorage.setItem(importedStorageKey, JSON.stringify(importedQuestions))
  }, [importedQuestions])

  function startTrack(age: AgeKey) {
    setScreen('home')
    setSelectedAge(age)
    setQuestionIndex(0)
    setAnswers([])
    setPickedOption(null)
    setSessionSeed(Date.now())
    finishRecordedRef.current = false
    sessionStartedAtRef.current = Date.now()
  }

  function goHome() {
    setScreen('home')
    setSelectedAge(null)
    setQuestionIndex(0)
    setAnswers([])
    setPickedOption(null)
    finishRecordedRef.current = false
    sessionStartedAtRef.current = null
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
    setPickedOption(optionId)
    recordAttempt(currentQuestion, optionId, correct)
    if (correct) {
      setAnswers((existing) => [...existing, { questionId: currentQuestion.id, optionId }])
    }
  }

  function finishTrack() {
    if (!selectedAge) return
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - (sessionStartedAtRef.current ?? Date.now())) / 1000),
    )

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
    setSelectedAge(null)
    setScreen('parent')
  }

  function showAdminMode() {
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
              <Brain size={26} strokeWidth={2.4} />
            </span>
            <div>
              <h1>小小思维岛</h1>
              <p>每天 5 分钟小练习</p>
            </div>
          </div>
          <div className="top-actions">
            <button className="small-tool-button" type="button" onClick={showParentMode}>
              <BarChart3 size={18} aria-hidden="true" />
              家长
            </button>
            <button className="small-tool-button" type="button" onClick={showAdminMode}>
              <Database size={18} aria-hidden="true" />
              题库
            </button>
          </div>
        </header>

        {screen === 'parent' && (
          <section className="panel-screen" aria-labelledby="parent-title">
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
                <h3>最近错题</h3>
                <div className="wrong-list">
                  {wrongAttempts.length ? (
                    wrongAttempts.map((attempt) => (
                      <div className="wrong-item" key={attempt.id}>
                        <span>{attempt.skill}</span>
                        <strong>{attempt.prompt}</strong>
                        <p>{attempt.retry}</p>
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
          <section className="panel-screen" aria-labelledby="admin-title">
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
                <div className="mini-badges" aria-hidden="true">
                  <span>看一看</span>
                  <span>想一想</span>
                  <span>点一点</span>
                </div>
              </div>

              <div className="age-grid">
                {ageTracks.map((track) => {
                  const stored = progress[track.key]
                  const count = getQuestionCountByAge(questionPool, track.key)
                  return (
                    <button
                      className={`age-card tone-border-${track.accent}`}
                      key={track.key}
                      aria-label={`开始 ${track.label} 练习`}
                      type="button"
                      onClick={() => startTrack(track.key)}
                    >
                      <span className="age-big">{track.short}</span>
                      <span className="age-label">{track.label}</span>
                      <span className="age-focus">{track.focus}</span>
                      <span className="age-meta">
                        {stored ? `已玩 ${stored.plays} 次 · 最好 ${stored.best}/${stored.lastTotal}` : '未开始'}
                        <br />
                        题库 {count} 道 · 今日 {sessionQuestionCount} 题
                      </span>
                      <ChevronRight size={24} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="practice-preview" aria-label="题目预览">
              <div className="preview-stage">
                <span className="friendly-face" aria-hidden="true">
                  <span />
                  <span />
                </span>
                <VisualRow
                  tokens={[
                    { shape: 'circle', tone: 'coral' },
                    { shape: 'square', tone: 'sky' },
                    { shape: 'triangle', tone: 'leaf' },
                    { shape: 'star', tone: 'sun' },
                  ]}
                />
              </div>
              <div className="preview-note">
                <Shapes size={22} aria-hidden="true" />
                <span>已准备 {totalApproved} 道原创题。</span>
              </div>
            </section>
          </>
        )}
      </main>
    )
  }

  if (finished || !currentQuestion || !currentTrack) {
    return (
      <main className="app-shell result-screen">
        <header className="quiz-topbar">
          <button className="icon-button" type="button" onClick={goHome} aria-label="返回首页">
            <Home size={22} aria-hidden="true" />
          </button>
          <span>{currentTrack?.label ?? '练习'}</span>
        </header>

        <section className="result-panel" aria-live="polite">
          <span className="result-icon">
            <Trophy size={52} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <p className="eyebrow">完成</p>
          <h2>{score} / {trackQuestions.length}</h2>
          <p>这组练习已经做完了，错题已记录到家长模式。</p>
          <div className="result-actions">
            <button className="primary-button" type="button" onClick={() => startTrack(selectedAge)}>
              <RotateCcw size={20} aria-hidden="true" />
              再玩一次
            </button>
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

  return (
    <main className="app-shell quiz-screen">
      <div className="play-stickers quiz-stickers" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="quiz-topbar">
        <button className="icon-button" type="button" onClick={goHome} aria-label="返回年龄选择">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <div className="quiz-title">
          <span>{currentTrack.label}</span>
          <strong>{questionIndex + 1} / {trackQuestions.length}</strong>
        </div>
      </header>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <section className="question-area">
        <div className="skill-chip">
          <Star size={17} aria-hidden="true" />
          {currentQuestion.skill}
        </div>
        <h2>{currentQuestion.prompt}</h2>

        <div className={`question-stage template-${currentQuestion.template}`}>
          <QuestionStage
            question={currentQuestion}
            disabled={Boolean(pickedOption)}
            pickedOption={pickedOption}
            onAnswer={chooseOption}
          />
        </div>
      </section>

      <section className={`option-grid template-${currentQuestion.template}`} aria-label="答案选项">
        {currentQuestion.options.map((option) => {
          const isPicked = pickedOption === option.id
          const isCorrect = option.id === currentQuestion.answerId
          const pickedCorrectly = pickedOption === currentQuestion.answerId
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
              className={`option-button template-${currentQuestion.template} ${stateClass}`}
              disabled={Boolean(pickedOption)}
              draggable={currentQuestion.template === 'drag' && !pickedOption}
              key={option.id}
              type="button"
              onClick={() => chooseOption(option.id)}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', option.id)}
            >
              <OptionContent option={option} />
            </button>
          )
        })}
      </section>

      {pickedOption && (
        <section className={answeredCorrectly ? 'feedback correct' : 'feedback wrong'} aria-live="polite">
          <div className="feedback-copy">
            {answeredCorrectly ? (
              <CheckCircle2 size={25} aria-hidden="true" />
            ) : (
              <XCircle size={25} aria-hidden="true" />
            )}
            <p>{answeredCorrectly ? currentQuestion.success : currentQuestion.retry}</p>
          </div>
          <div className="auto-hint" aria-hidden="true">
            <span />
            {answeredCorrectly ? '马上下一题' : '马上再试'}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
