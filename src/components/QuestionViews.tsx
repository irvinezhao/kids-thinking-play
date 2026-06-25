import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { Option, Question, VisualToken } from '../types'

export type StageGesture = {
  template: 'drag' | 'connect'
  overTarget: boolean
} | null

const itemEmoji: Record<NonNullable<VisualToken['item']>, string> = {
  apple: '🍎',
  banana: '🍌',
  grapes: '🍇',
  carrot: '🥕',
  hat: '🧢',
  sock: '🧦',
  scarf: '🧣',
  cookie: '🍪',
  car: '🚗',
  boat: '⛵',
  plane: '✈️',
  ball: '⚽',
  blocks: '🧱',
  pinwheel: '✦',
  cat: '🐱',
  dog: '🐶',
  bird: '🐦',
  spoon: '🥄',
  bowl: '🥣',
  cup: '🥛',
  drum: '🥁',
  bell: '🔔',
  maraca: '🎵',
}

function ObjectTile({ token }: { token: VisualToken }) {
  const className = [
    'object-tile',
    `object-${token.item}`,
    `tone-${token.tone}`,
    token.small ? 'is-small' : '',
    token.tone === 'ink' ? 'is-shadow' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} aria-label={token.label ?? token.item}>
      <span className="object-picture">{token.item ? itemEmoji[token.item] : ''}</span>
    </span>
  )
}

export function ShapeTile({ token }: { token: VisualToken }) {
  if (token.item) {
    return <ObjectTile token={token} />
  }

  const className = [
    'shape-tile',
    `shape-${token.shape}`,
    `tone-${token.tone}`,
    token.small ? 'is-small' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} aria-label={token.label ?? token.shape}>
      {token.label && <span>{token.label}</span>}
    </span>
  )
}

export function VisualRow({ tokens, stacked = false }: { tokens: VisualToken[]; stacked?: boolean }) {
  return (
    <div className={stacked ? 'visual-row stacked' : 'visual-row'}>
      {tokens.map((token, index) => (
        <ShapeTile
          key={`${token.item ?? token.shape}-${token.tone}-${token.label ?? ''}-${index}`}
          token={token}
        />
      ))}
    </div>
  )
}

function DragStage({
  question,
  disabled,
  onAnswer,
  gesture,
}: {
  question: Question
  disabled: boolean
  onAnswer: (optionId: string) => void
  gesture: StageGesture
}) {
  const isActive = gesture?.template === 'drag'
  return (
    <div
      className={[
        'drop-zone',
        isActive ? 'is-gesture-active' : '',
        isActive && gesture.overTarget ? 'is-over-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const optionId = event.dataTransfer.getData('text/plain')
        if (optionId && !disabled) onAnswer(optionId)
      }}
    >
      <span className="drop-label">{question.meta?.dropLabel ?? '放到这里'}</span>
      <VisualRow tokens={question.scene} />
    </div>
  )
}

function ConnectStage({
  question,
  pickedOption,
  gesture,
}: {
  question: Question
  pickedOption: string | null
  gesture: StageGesture
}) {
  const picked = question.options.find((option) => option.id === pickedOption)
  const isActive = gesture?.template === 'connect'

  return (
    <div className={isActive ? 'connect-board is-gesture-active' : 'connect-board'}>
      <div className="connect-node">
        <span>左边</span>
        <VisualRow tokens={question.scene} />
      </div>
      <div
        className={[
          'connect-line',
          pickedOption ? 'is-visible' : '',
          isActive ? 'is-preview' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <div
        className={[
          'connect-node',
          'connect-target',
          isActive ? 'is-gesture-active' : '',
          isActive && gesture.overTarget ? 'is-over-target' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{picked?.text ?? '选一个'}</span>
        {picked?.visuals ? <VisualRow tokens={picked.visuals} /> : <span className="connect-placeholder" />}
      </div>
    </div>
  )
}

function MazeStage({
  question,
  disabled,
  pickedOption,
  onAnswer,
}: {
  question: Question
  disabled: boolean
  pickedOption: string | null
  onAnswer: (optionId: string) => void
}) {
  const maze = question.meta?.maze
  const boardRef = useRef<HTMLDivElement | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const missTimerRef = useRef<number | null>(null)
  const [traceCells, setTraceCells] = useState<number[]>([])
  const [isTracing, setIsTracing] = useState(false)
  const [missed, setMissed] = useState(false)

  useEffect(() => {
    if (!pickedOption) {
      pointerIdRef.current = null
      setTraceCells([])
      setIsTracing(false)
    }
  }, [pickedOption, question.id])

  useEffect(
    () => () => {
      if (missTimerRef.current) window.clearTimeout(missTimerRef.current)
    },
    [],
  )

  if (!maze) return <VisualRow tokens={question.scene} />

  const mazeMeta = maze
  const startCell = mazeMeta.path[0] ?? 0

  function cellFromPoint(x: number, y: number) {
    const element = document.elementFromPoint(x, y)
    const cellElement = element?.closest<HTMLElement>('[data-maze-cell]')
    if (!cellElement || !boardRef.current?.contains(cellElement)) return null
    const cell = Number(cellElement.dataset.mazeCell)
    return Number.isFinite(cell) ? cell : null
  }

  function markCell(cell: number) {
    setTraceCells((existing) => (existing.includes(cell) ? existing : [...existing, cell]))
  }

  function flashMiss() {
    setMissed(true)
    if (missTimerRef.current) window.clearTimeout(missTimerRef.current)
    missTimerRef.current = window.setTimeout(() => setMissed(false), 420)
  }

  function answerExitCell(cell: number | null) {
    if (cell === null || disabled) return false
    const exit = mazeMeta.exits.find((item) => item.cell === cell)
    if (!exit) return false
    onAnswer(exit.id)
    return true
  }

  function beginTrace(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (cell === null) return

    if (cell !== startCell) {
      if (!answerExitCell(cell)) flashMiss()
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    pointerIdRef.current = event.pointerId
    setMissed(false)
    setIsTracing(true)
    setTraceCells([cell])
  }

  function moveTrace(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isTracing || pointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (cell !== null) markCell(cell)
  }

  function endTrace(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isTracing || pointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    const cell = cellFromPoint(event.clientX, event.clientY)
    setIsTracing(false)
    pointerIdRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!answerExitCell(cell)) {
      flashMiss()
      setTraceCells([])
    }
  }

  return (
    <div
      aria-label="路径迷宫"
      className={[
        'maze-board',
        isTracing ? 'is-tracing' : '',
        missed ? 'is-miss' : '',
        pickedOption ? 'is-answered' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerCancel={endTrace}
      onPointerDown={beginTrace}
      onPointerMove={moveTrace}
      onPointerUp={endTrace}
      ref={boardRef}
      role="img"
      style={{ '--maze-size': mazeMeta.size } as CSSProperties}
    >
      {Array.from({ length: mazeMeta.size * mazeMeta.size }, (_, cell) => {
        const exit = mazeMeta.exits.find((item) => item.cell === cell)
        const isRoad = mazeMeta.path.includes(cell)
        const isTraced = traceCells.includes(cell)
        return (
          <span
            className={[
              'maze-cell',
              isRoad ? 'is-road' : '',
              isTraced ? 'is-traced' : '',
              cell === startCell ? 'is-start' : '',
              exit ? 'is-exit' : '',
              pickedOption === exit?.id ? 'is-picked-exit' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-maze-cell={cell}
            key={cell}
          >
            {cell === startCell && <strong>起点</strong>}
            {exit && <em>{exit.label.replace('出口 ', '')}</em>}
          </span>
        )
      })}
    </div>
  )
}

function LeftRightStage({ question }: { question: Question }) {
  const [left, center, right] = question.scene
  return (
    <div className="side-board">
      <div className="side-lane">
        <span>左</span>
        {left && <ShapeTile token={left} />}
      </div>
      <div className="side-center">{center && <ShapeTile token={center} />}</div>
      <div className="side-lane">
        <span>右</span>
        {right && <ShapeTile token={right} />}
      </div>
    </div>
  )
}

export function QuestionStage({
  question,
  disabled,
  pickedOption,
  onAnswer,
  stageGesture,
}: {
  question: Question
  disabled: boolean
  pickedOption: string | null
  onAnswer: (optionId: string) => void
  stageGesture?: StageGesture
}) {
  if (question.template === 'drag') {
    return <DragStage question={question} disabled={disabled} onAnswer={onAnswer} gesture={stageGesture ?? null} />
  }

  if (question.template === 'connect') {
    return <ConnectStage question={question} pickedOption={pickedOption} gesture={stageGesture ?? null} />
  }

  if (question.template === 'maze') {
    return (
      <MazeStage
        question={question}
        disabled={disabled}
        pickedOption={pickedOption}
        onAnswer={onAnswer}
      />
    )
  }

  if (question.template === 'leftRight') {
    return <LeftRightStage question={question} />
  }

  return <VisualRow tokens={question.scene} stacked={question.id.includes('top-item')} />
}

export function OptionContent({ option }: { option: Option }) {
  return (
    <>
      {option.visuals && <VisualRow tokens={option.visuals} />}
      {option.text && <span className="option-text">{option.text}</span>}
    </>
  )
}
