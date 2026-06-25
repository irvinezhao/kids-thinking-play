import type {
  AgeKey,
  AgeTrack,
  Difficulty,
  ItemName,
  Option,
  Question,
  ShapeName,
  Tone,
  VisualToken,
} from '../types'

export const ageTracks: AgeTrack[] = [
  {
    key: 'age2',
    label: '2-3 岁',
    short: '2 岁',
    focus: '颜色、形状、多少',
    accent: 'coral',
  },
  {
    key: 'age3',
    label: '3-4 岁',
    short: '3 岁',
    focus: '分类、顺序、观察',
    accent: 'leaf',
  },
  {
    key: 'age4',
    label: '4-5 岁',
    short: '4 岁',
    focus: '规律、推理、空间',
    accent: 'sky',
  },
]

export const sessionQuestionCount = 10

const questionFamilyCount = 30
const shapes: ShapeName[] = ['circle', 'square', 'triangle', 'diamond', 'star']
const tones: Tone[] = ['coral', 'leaf', 'sky', 'sun', 'grape']
const shapeNames: Record<ShapeName, string> = {
  circle: '圆形',
  square: '方形',
  triangle: '三角形',
  diamond: '菱形',
  star: '星星',
  pill: '胶囊',
}
const toneNames: Record<Tone, string> = {
  coral: '红色',
  leaf: '绿色',
  sky: '蓝色',
  sun: '黄色',
  grape: '紫色',
  ink: '深色',
}
const sides = ['左边', '右边'] as const
const optionIds = ['a', 'b', 'c'] as const
const itemShapes: Record<ItemName, ShapeName> = {
  apple: 'circle',
  banana: 'pill',
  grapes: 'circle',
  carrot: 'triangle',
  hat: 'pill',
  sock: 'pill',
  scarf: 'pill',
  cookie: 'circle',
  car: 'square',
  boat: 'pill',
  plane: 'triangle',
  ball: 'circle',
  blocks: 'square',
  pinwheel: 'star',
  cat: 'circle',
  dog: 'square',
  bird: 'triangle',
  spoon: 'pill',
  bowl: 'circle',
  cup: 'square',
  drum: 'circle',
  bell: 'diamond',
  maraca: 'pill',
}
const itemTones: Record<ItemName, Tone> = {
  apple: 'coral',
  banana: 'sun',
  grapes: 'grape',
  carrot: 'coral',
  hat: 'grape',
  sock: 'leaf',
  scarf: 'sun',
  cookie: 'coral',
  car: 'sky',
  boat: 'leaf',
  plane: 'sun',
  ball: 'coral',
  blocks: 'sky',
  pinwheel: 'grape',
  cat: 'sun',
  dog: 'coral',
  bird: 'sky',
  spoon: 'sky',
  bowl: 'sun',
  cup: 'leaf',
  drum: 'grape',
  bell: 'sun',
  maraca: 'leaf',
}
const itemNames: Record<ItemName, string> = {
  apple: '苹果',
  banana: '香蕉',
  grapes: '葡萄',
  carrot: '胡萝卜',
  hat: '帽子',
  sock: '袜子',
  scarf: '围巾',
  cookie: '饼干',
  car: '小车',
  boat: '小船',
  plane: '飞机',
  ball: '皮球',
  blocks: '积木',
  pinwheel: '风车',
  cat: '小猫',
  dog: '小狗',
  bird: '小鸟',
  spoon: '勺子',
  bowl: '碗',
  cup: '杯子',
  drum: '小鼓',
  bell: '铃铛',
  maraca: '沙锤',
}

const categorySets = [
  {
    label: '水果',
    inside: [
      { text: '苹果', item: 'apple' as ItemName },
      { text: '香蕉', item: 'banana' as ItemName },
      { text: '葡萄', item: 'grapes' as ItemName },
    ],
    outside: { text: '胡萝卜', item: 'carrot' as ItemName },
  },
  {
    label: '交通工具',
    inside: [
      { text: '小车', item: 'car' as ItemName },
      { text: '小船', item: 'boat' as ItemName },
      { text: '飞机', item: 'plane' as ItemName },
    ],
    outside: { text: '皮球', item: 'ball' as ItemName },
  },
  {
    label: '玩具',
    inside: [
      { text: '积木', item: 'blocks' as ItemName },
      { text: '皮球', item: 'ball' as ItemName },
      { text: '风车', item: 'pinwheel' as ItemName },
    ],
    outside: { text: '袜子', item: 'sock' as ItemName },
  },
  {
    label: '动物',
    inside: [
      { text: '小猫', item: 'cat' as ItemName },
      { text: '小狗', item: 'dog' as ItemName },
      { text: '小鸟', item: 'bird' as ItemName },
    ],
    outside: { text: '帽子', item: 'hat' as ItemName },
  },
  {
    label: '衣物',
    inside: [
      { text: '帽子', item: 'hat' as ItemName },
      { text: '袜子', item: 'sock' as ItemName },
      { text: '围巾', item: 'scarf' as ItemName },
    ],
    outside: { text: '饼干', item: 'cookie' as ItemName },
  },
  {
    label: '餐具',
    inside: [
      { text: '勺子', item: 'spoon' as ItemName },
      { text: '碗', item: 'bowl' as ItemName },
      { text: '杯子', item: 'cup' as ItemName },
    ],
    outside: { text: '小鼓', item: 'drum' as ItemName },
  },
  {
    label: '乐器',
    inside: [
      { text: '小鼓', item: 'drum' as ItemName },
      { text: '铃铛', item: 'bell' as ItemName },
      { text: '沙锤', item: 'maraca' as ItemName },
    ],
    outside: { text: '小船', item: 'boat' as ItemName },
  },
]

function token(index: number, offset = 0, small = false): VisualToken {
  return {
    shape: shapes[(index + offset) % shapes.length],
    tone: tones[(index * 2 + offset) % tones.length],
    small,
  }
}

function visual(shape: ShapeName, tone: Tone, small = false, label?: string): VisualToken {
  return { shape, tone, small, label }
}

function itemVisual(item: ItemName, small = false): VisualToken {
  return {
    shape: itemShapes[item],
    tone: itemTones[item],
    item,
    label: itemNames[item],
    small,
  }
}

function option(id: string, visuals: VisualToken[], text?: string): Option {
  return { id, visuals, text }
}

function withAnswer(options: Option[], correctIndex: number, seed: number) {
  const offset = seed % options.length
  const marked = [...options.slice(offset), ...options.slice(0, offset)].map((item, index) => ({
    option: item,
    id: optionIds[index],
    correct: (index + offset) % options.length === correctIndex,
  }))
  const rotated = marked.map((item) => ({
    ...item.option,
    id: item.id,
  }))
  return {
    options: rotated,
    answerId: marked.find((item) => item.correct)?.id ?? 'a',
  }
}

function makeQuestion(
  seed: number,
  base: Omit<Question, 'id' | 'status' | 'source' | 'difficulty'> & { difficulty?: Difficulty },
): Question {
  return {
    ...base,
    difficulty: base.difficulty ?? 1,
    status: 'approved',
    source: 'generated',
    id: `${base.age}-${base.template}-${seed.toString().padStart(3, '0')}`,
  }
}

function matchQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const target = token(seed)
  const wrongShape = visual(shapes[(shapes.indexOf(target.shape) + 1) % shapes.length], target.tone)
  const wrongTone = visual(target.shape, tones[(tones.indexOf(target.tone) + 2) % tones.length])
  const result = withAnswer(
    [option('correct', [target]), option('wrong-1', [wrongShape]), option('wrong-2', [wrongTone])],
    0,
    seed,
  )

  return makeQuestion(seed, {
    age,
    template: 'choice',
    skill: '找相同',
    prompt: '哪一个和上面一样？',
    scene: [target],
    answerId: result.answerId,
    options: result.options,
    success: `找到了同样的${toneNames[target.tone]}${shapeNames[target.shape]}。`,
    retry: '再看看颜色和形状，要两个都一样。',
    tags: ['观察力', '颜色', '形状', '形色匹配'],
    difficulty,
  })
}

function countQuestion(age: AgeKey, seed: number): Question {
  const leftCount = (seed % 3) + 1
  const rightCount = leftCount + 1 + (seed % 2)
  const tone = tones[seed % tones.length]
  const left = Array.from({ length: leftCount }, () => visual('circle', tone, true))
  const right = Array.from({ length: rightCount }, () => visual('circle', tone, true))
  const result = withAnswer([option('wrong', left), option('correct', right)], 1, seed)

  return makeQuestion(100 + seed, {
    age,
    template: 'choice',
    skill: '比多少',
    prompt: '哪一组更多？',
    scene: [
      visual('pill', 'leaf', false, '多'),
      visual('pill', 'ink', false, '少'),
    ],
    answerId: result.answerId,
    options: result.options,
    success: `这一组有 ${rightCount} 个，更多。`,
    retry: '可以一个一个点着数。',
    tags: ['数量', '比较', '数数'],
    difficulty: 1,
  })
}

function oddQuestion(age: AgeKey, seed: number): Question {
  const same = token(seed)
  const different =
    seed % 2 === 0
      ? visual(shapes[(shapes.indexOf(same.shape) + 2) % shapes.length], same.tone)
      : visual(same.shape, tones[(tones.indexOf(same.tone) + 1) % tones.length])
  const oddIndex = seed % 3
  const scene = [same, same, same].map((item, index) => (index === oddIndex ? different : item))
  const result = withAnswer(
    scene.map((item, index) => option(index === oddIndex ? 'correct' : `wrong-${index}`, [item])),
    oddIndex,
    seed,
  )

  return makeQuestion(200 + seed, {
    age,
    template: 'choice',
    skill: '找不同',
    prompt: '哪一个不一样？',
    scene,
    answerId: result.answerId,
    options: result.options,
    success: '找到了不一样的那个。',
    retry: '先看颜色，再看形状。',
    tags: ['观察力', '分类', '差异辨别'],
    difficulty: 1,
  })
}

function shadowQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const target = token(seed)
  const wrongShape = visual(shapes[(shapes.indexOf(target.shape) + 1) % shapes.length], 'ink')
  const wrongShape2 = visual(shapes[(shapes.indexOf(target.shape) + 3) % shapes.length], 'ink')
  const correctShadow = visual(target.shape, 'ink')
  const result = withAnswer(
    [option('correct', [correctShadow]), option('wrong-1', [wrongShape]), option('wrong-2', [wrongShape2])],
    0,
    seed,
  )

  return makeQuestion(300 + seed, {
    age,
    template: 'shadow',
    skill: '找阴影',
    prompt: '哪一个是它的影子？',
    scene: [target],
    answerId: result.answerId,
    options: result.options,
    success: `影子的形状和${shapeNames[target.shape]}一样。`,
    retry: '影子只看轮廓，不看颜色。',
    tags: ['观察力', '形状', '空间'],
    difficulty,
    meta: { target, relation: 'shape' },
  })
}

function leftRightQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const center = visual('star', 'sun')
  const left = token(seed + 1)
  const right = token(seed + 3)
  const answerSide = seed % 2 === 0 ? 'a' : 'b'
  const target = answerSide === 'a' ? left : right

  return makeQuestion(400 + seed, {
    age,
    template: 'leftRight',
    skill: '左右判断',
    prompt: `${toneNames[target.tone]}${shapeNames[target.shape]}在星星的哪一边？`,
    scene: [left, center, right],
    answerId: answerSide,
    options: [
      { id: 'a', text: sides[0] },
      { id: 'b', text: sides[1] },
    ],
    success: `${toneNames[target.tone]}${shapeNames[target.shape]}在${answerSide === 'a' ? '左边' : '右边'}。`,
    retry: '先找到中间的星星，再看目标在哪边。',
    tags: ['空间', '左右'],
    difficulty,
    meta: { left, target, right, relation: 'side' },
  })
}

function dragQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const targetTone = tones[seed % tones.length]
  const targetShape = shapes[seed % shapes.length]
  const useShapeBox = difficulty > 1 && seed % 3 === 1
  const correct = useShapeBox
    ? visual(targetShape, tones[(seed + 2) % tones.length])
    : visual(shapes[seed % shapes.length], targetTone)
  const wrong1 = useShapeBox
    ? visual(shapes[(seed + 1) % shapes.length], correct.tone)
    : visual(shapes[(seed + 1) % shapes.length], tones[(seed + 1) % tones.length])
  const wrong2 = useShapeBox
    ? visual(shapes[(seed + 2) % shapes.length], tones[(seed + 3) % tones.length])
    : visual(shapes[(seed + 2) % shapes.length], tones[(seed + 2) % tones.length])
  const result = withAnswer(
    [option('correct', [correct]), option('wrong-1', [wrong1]), option('wrong-2', [wrong2])],
    0,
    seed,
  )
  const ruleLabel = useShapeBox ? shapeNames[targetShape] : toneNames[targetTone]

  return makeQuestion(500 + seed, {
    age,
    template: 'drag',
    skill: '拖拽分类',
    prompt: `把${ruleLabel}小块拖到盒子里`,
    scene: [visual('pill', useShapeBox ? 'sky' : targetTone, false, ruleLabel)],
    answerId: result.answerId,
    options: result.options,
    success: `放进了${ruleLabel}盒子。`,
    retry: `盒子要收${ruleLabel}的小块。`,
    tags: useShapeBox ? ['分类', '形状', '手眼协调'] : ['分类', '颜色', '手眼协调'],
    difficulty,
    meta: { dropLabel: `${ruleLabel}盒子`, relation: useShapeBox ? 'shape' : 'tone' },
  })
}

function sequenceQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const first = token(seed)
  const second = token(seed + 1)
  const third = difficulty === 3 ? token(seed + 2) : first
  const pattern = difficulty === 3 ? [first, second, third, first, second] : [first, second, first]
  const correct = difficulty === 3 ? third : second
  const result = withAnswer(
    [
      option('correct', [correct]),
      option('wrong-1', [token(seed + 3)]),
      option('wrong-2', [token(seed + 4)]),
    ],
    0,
    seed,
  )

  return makeQuestion(600 + seed, {
    age,
    template: 'choice',
    skill: difficulty === 3 ? '三步规律' : '规律',
    prompt: '问号处应该是什么？',
    scene: [...pattern, visual('pill', 'ink', false, '?')],
    answerId: result.answerId,
    options: result.options,
    success: difficulty === 3 ? '前三个是一组，再重复一次。' : '规律是一个一个轮流出现。',
    retry: '从第一个开始慢慢念一遍。',
    tags: ['规律', '逻辑'],
    difficulty,
  })
}

function categoryQuestion(age: AgeKey, seed: number): Question {
  const set = categorySets[seed % categorySets.length]
  const inside = set.inside
  const outside = set.outside
  const insideOffset = seed % inside.length
  const examples = [inside[insideOffset], inside[(insideOffset + 1) % inside.length]]
  const result = withAnswer(
    [
      option('wrong-1', [itemVisual(inside[0].item)], inside[0].text),
      option('wrong-2', [itemVisual(inside[1].item)], inside[1].text),
      option('correct', [itemVisual(outside.item)], outside.text),
    ],
    2,
    seed,
  )

  return makeQuestion(700 + seed, {
    age,
    template: 'choice',
    skill: '分类',
    prompt: `哪一个不是${set.label}？`,
    scene: [
      visual('pill', 'leaf', false, set.label),
      itemVisual(examples[0].item, true),
      itemVisual(examples[1].item, true),
    ],
    answerId: result.answerId,
    options: result.options,
    success: `${outside.text}不属于${set.label}。`,
    retry: `想一想哪些是${set.label}。`,
    tags: ['分类', '常识', set.label],
    difficulty: 2,
  })
}

function connectQuestion(age: AgeKey, seed: number, difficulty: Difficulty): Question {
  const left = token(seed)
  const correct = seed % 2 === 0 ? visual(left.shape, tones[(seed + 2) % tones.length]) : visual(shapes[(seed + 2) % shapes.length], left.tone)
  const wrong1 = token(seed + 3)
  const wrong2 = token(seed + 4)
  const relation = seed % 2 === 0 ? 'shape' : 'tone'
  const result = withAnswer(
    [option('correct', [correct]), option('wrong-1', [wrong1]), option('wrong-2', [wrong2])],
    0,
    seed,
  )

  return makeQuestion(800 + seed, {
    age,
    template: 'connect',
    skill: '连线配对',
    prompt: relation === 'shape' ? '把同形状的连起来' : '把同颜色的连起来',
    scene: [left],
    answerId: result.answerId,
    options: result.options,
    success: relation === 'shape' ? '它们是同一种形状。' : '它们是同一种颜色。',
    retry: relation === 'shape' ? '先只看形状。' : '先只看颜色。',
    tags: ['配对', relation === 'shape' ? '形状' : '颜色', '观察力'],
    difficulty,
    meta: { left, relation },
  })
}

function analogyQuestion(age: AgeKey, seed: number): Question {
  const shape = shapes[seed % shapes.length]
  const tone = tones[seed % tones.length]
  const otherShape = shapes[(seed + 2) % shapes.length]
  const correct = visual(otherShape, tone, true)
  const result = withAnswer(
    [
      option('correct', [correct]),
      option('wrong-1', [visual(otherShape, tone)]),
      option('wrong-2', [visual(shape, tone, true)]),
    ],
    0,
    seed,
  )

  return makeQuestion(900 + seed, {
    age,
    template: 'choice',
    skill: '类比',
    prompt: '大图形变小图形，后面会变成？',
    scene: [
      visual(shape, tone),
      visual(shape, tone, true),
      visual(otherShape, tone),
      visual('pill', 'ink', false, '?'),
    ],
    answerId: result.answerId,
    options: result.options,
    success: '变化规则是从大变小，形状不变。',
    retry: '先看前两个图形发生了什么变化。',
    tags: ['逻辑', '类比', '空间'],
    difficulty: 3,
  })
}

function matrixQuestion(age: AgeKey, seed: number): Question {
  const baseShape = shapes[seed % shapes.length]
  const nextShape = shapes[(seed + 2) % shapes.length]
  const sourceTone = tones[(seed + 1) % tones.length]
  const targetTone = tones[(seed + 3) % tones.length]
  const applyTone = seed % 2 === 0
  const topLeft = visual(baseShape, sourceTone)
  const topRight = applyTone ? visual(baseShape, targetTone) : visual(nextShape, sourceTone)
  const bottomLeft = applyTone ? visual(nextShape, sourceTone) : visual(baseShape, targetTone)
  const correct = applyTone ? visual(nextShape, targetTone) : visual(nextShape, targetTone)
  const wrong1 = applyTone ? visual(baseShape, targetTone) : visual(baseShape, sourceTone)
  const wrong2 = applyTone ? visual(nextShape, sourceTone) : visual(shapes[(seed + 4) % shapes.length], targetTone)
  const result = withAnswer(
    [option('correct', [correct]), option('wrong-1', [wrong1]), option('wrong-2', [wrong2])],
    0,
    seed,
  )

  return makeQuestion(1100 + seed, {
    age,
    template: 'choice',
    skill: '矩阵补缺',
    prompt: '上面怎么变，下面也这样变，问号处是什么？',
    scene: [
      topLeft,
      topRight,
      visual('pill', 'ink', false, '→'),
      bottomLeft,
      visual('pill', 'ink', false, '?'),
    ],
    answerId: result.answerId,
    options: result.options,
    success: applyTone ? '规则是换颜色，形状保持不变。' : '规则是换形状，颜色保持不变。',
    retry: '先看上面两个图形哪里变了，再把同样的变化用到下面。',
    tags: ['逻辑', '规律', '矩阵', applyTone ? '颜色' : '形状'],
    difficulty: 3,
  })
}

function sumQuestion(age: AgeKey, seed: number): Question {
  const leftCount = 1 + (seed % 3)
  const rightCount = 1 + ((seed + 1) % 3)
  const total = leftCount + rightCount
  const tone = tones[(seed + 2) % tones.length]
  const shape = shapes[seed % shapes.length]
  const result = withAnswer(
    [
      { id: 'correct', text: `${total} 个` },
      { id: 'wrong-1', text: `${Math.max(1, total - 1)} 个` },
      { id: 'wrong-2', text: `${total + 1} 个` },
    ],
    0,
    seed,
  )

  return makeQuestion(1200 + seed, {
    age,
    template: 'choice',
    skill: '数量合成',
    prompt: '两边合起来一共有几个？',
    scene: [
      ...Array.from({ length: leftCount }, () => visual(shape, tone, true)),
      visual('pill', 'ink', false, '+'),
      ...Array.from({ length: rightCount }, () => visual(shape, tone, true)),
    ],
    answerId: result.answerId,
    options: result.options,
    success: `${leftCount} 个加 ${rightCount} 个，一共 ${total} 个。`,
    retry: '先数左边，再接着数右边。',
    tags: ['数量', '合成', '逻辑'],
    difficulty: 3,
  })
}

function mazeQuestion(age: AgeKey, seed: number): Question {
  const mazeLayouts = [
    {
      exits: [
        { id: 'a', label: '出口 A', cell: 3 },
        { id: 'b', label: '出口 B', cell: 15 },
        { id: 'c', label: '出口 C', cell: 12 },
      ],
      paths: {
        a: [0, 1, 2, 3],
        b: [0, 4, 5, 9, 10, 14, 15],
        c: [0, 4, 8, 12],
      },
    },
    {
      exits: [
        { id: 'a', label: '出口 A', cell: 7 },
        { id: 'b', label: '出口 B', cell: 13 },
        { id: 'c', label: '出口 C', cell: 15 },
      ],
      paths: {
        a: [0, 1, 5, 6, 7],
        b: [0, 4, 8, 9, 13],
        c: [0, 1, 2, 6, 10, 14, 15],
      },
    },
    {
      exits: [
        { id: 'a', label: '出口 A', cell: 11 },
        { id: 'b', label: '出口 B', cell: 14 },
        { id: 'c', label: '出口 C', cell: 5 },
      ],
      paths: {
        a: [0, 4, 8, 9, 10, 11],
        b: [0, 1, 2, 6, 10, 14],
        c: [0, 1, 5],
      },
    },
  ] as const
  const layout = mazeLayouts[seed % mazeLayouts.length]
  const exits = [...layout.exits]
  const answerId = optionIds[seed % 3]
  const answerExit = exits.find((exit) => exit.id === answerId) ?? exits[0]

  return makeQuestion(1000 + seed, {
    age,
    template: 'maze',
    skill: '路径迷宫',
    prompt: '沿着小路会到哪个出口？',
    scene: [visual('star', 'sun')],
    answerId,
    options: exits.map((exit) => ({ id: exit.id, text: exit.label })),
    success: `小路通向${answerExit.label}。`,
    retry: '从起点开始，沿着连在一起的小格子走。',
    tags: ['空间', '路径', '逻辑'],
    difficulty: 3,
    meta: {
      maze: {
        size: 4,
        path: [...layout.paths[answerId]],
        exits,
      },
    },
  })
}

function buildAge2(): Question[] {
  return [
    ...Array.from({ length: questionFamilyCount }, (_, index) => matchQuestion('age2', index, 1)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => countQuestion('age2', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => oddQuestion('age2', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => shadowQuestion('age2', index, 1)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => dragQuestion('age2', index, 1)),
  ]
}

function buildAge3(): Question[] {
  return [
    ...Array.from({ length: questionFamilyCount }, (_, index) => sequenceQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => categoryQuestion('age3', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => connectQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => shadowQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => leftRightQuestion('age3', index, 2)),
  ]
}

function buildAge4(): Question[] {
  return [
    ...Array.from({ length: questionFamilyCount }, (_, index) => sequenceQuestion('age4', index, 3)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => analogyQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => matrixQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => mazeQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => sumQuestion('age4', index)),
  ]
}

export const generatedQuestions: Question[] = [...buildAge2(), ...buildAge3(), ...buildAge4()]

export function getQuestionCountByAge(questions: Question[], age: AgeKey) {
  return questions.filter((question) => question.age === age && question.status === 'approved').length
}

export function pickSessionQuestions(questions: Question[], age: AgeKey, seed: number) {
  const pool = questions.filter((question) => question.age === age && question.status === 'approved')
  if (pool.length <= sessionQuestionCount) return pool

  const picked: Question[] = []
  let cursor = Math.abs(seed) % pool.length
  while (picked.length < sessionQuestionCount) {
    const question = pool[cursor % pool.length]
    if (!picked.some((item) => item.id === question.id)) {
      picked.push(question)
    }
    cursor += 17
  }
  return picked
}
