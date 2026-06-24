import type { CSSProperties } from 'react'
import type { Option, Question, VisualToken } from '../types'

export function ShapeTile({ token }: { token: VisualToken }) {
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
        <ShapeTile key={`${token.shape}-${token.tone}-${token.label ?? ''}-${index}`} token={token} />
      ))}
    </div>
  )
}

function DragStage({
  question,
  disabled,
  onAnswer,
}: {
  question: Question
  disabled: boolean
  onAnswer: (optionId: string) => void
}) {
  return (
    <div
      className="drop-zone"
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

function ConnectStage({ question, pickedOption }: { question: Question; pickedOption: string | null }) {
  const picked = question.options.find((option) => option.id === pickedOption)

  return (
    <div className="connect-board">
      <div className="connect-node">
        <span>左边</span>
        <VisualRow tokens={question.scene} />
      </div>
      <div className={pickedOption ? 'connect-line is-visible' : 'connect-line'} />
      <div className="connect-node">
        <span>{picked?.text ?? '选一个'}</span>
        {picked?.visuals ? <VisualRow tokens={picked.visuals} /> : <span className="connect-placeholder" />}
      </div>
    </div>
  )
}

function MazeStage({ question }: { question: Question }) {
  const maze = question.meta?.maze
  if (!maze) return <VisualRow tokens={question.scene} />

  return (
    <div className="maze-board" style={{ '--maze-size': maze.size } as CSSProperties}>
      {Array.from({ length: maze.size * maze.size }, (_, cell) => {
        const exit = maze.exits.find((item) => item.cell === cell)
        const isPath = maze.path.includes(cell)
        return (
          <span className={isPath ? 'maze-cell is-path' : 'maze-cell'} key={cell}>
            {cell === maze.path[0] && <strong>起点</strong>}
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
}: {
  question: Question
  disabled: boolean
  pickedOption: string | null
  onAnswer: (optionId: string) => void
}) {
  if (question.template === 'drag') {
    return <DragStage question={question} disabled={disabled} onAnswer={onAnswer} />
  }

  if (question.template === 'connect') {
    return <ConnectStage question={question} pickedOption={pickedOption} />
  }

  if (question.template === 'maze') {
    return <MazeStage question={question} />
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
