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
  orange: 'circle',
  strawberry: 'diamond',
  pear: 'pill',
  carrot: 'triangle',
  hat: 'pill',
  sock: 'pill',
  scarf: 'pill',
  shirt: 'square',
  pants: 'pill',
  shoe: 'pill',
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
  orange: 'sun',
  strawberry: 'coral',
  pear: 'leaf',
  carrot: 'coral',
  hat: 'grape',
  sock: 'leaf',
  scarf: 'sun',
  shirt: 'sky',
  pants: 'sky',
  shoe: 'coral',
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
  orange: '橙子',
  strawberry: '草莓',
  pear: '梨',
  carrot: '胡萝卜',
  hat: '帽子',
  sock: '袜子',
  scarf: '围巾',
  shirt: '上衣',
  pants: '裤子',
  shoe: '鞋子',
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
      { text: '橙子', item: 'orange' as ItemName },
      { text: '草莓', item: 'strawberry' as ItemName },
      { text: '梨', item: 'pear' as ItemName },
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
      { text: '上衣', item: 'shirt' as ItemName },
      { text: '裤子', item: 'pants' as ItemName },
      { text: '鞋子', item: 'shoe' as ItemName },
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
      option('wrong-1', [itemVisual(examples[0].item)], examples[0].text),
      option('wrong-2', [itemVisual(examples[1].item)], examples[1].text),
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

function curatedAge2Questions(): Question[] {
  const sameApple = withAnswer(
    [option('correct', [itemVisual('apple')], '苹果'), option('wrong-1', [itemVisual('banana')], '香蕉'), option('wrong-2', [itemVisual('carrot')], '胡萝卜')],
    0,
    2000,
  )
  const moreBananas = withAnswer(
    [
      option('wrong', [itemVisual('banana', true), itemVisual('banana', true)], '2 个'),
      option('correct', [itemVisual('banana', true), itemVisual('banana', true), itemVisual('banana', true)], '3 个'),
    ],
    1,
    2001,
  )
  const shoe = withAnswer(
    [option('correct', [itemVisual('shoe')], '鞋子'), option('wrong-1', [itemVisual('cup')], '杯子'), option('wrong-2', [itemVisual('pear')], '梨')],
    0,
    2002,
  )
  const appleShadow = withAnswer(
    [
      option('correct', [{ ...itemVisual('apple'), tone: 'ink' }], '苹果影子'),
      option('wrong-1', [{ ...itemVisual('banana'), tone: 'ink' }], '香蕉影子'),
      option('wrong-2', [{ ...itemVisual('hat'), tone: 'ink' }], '帽子影子'),
    ],
    0,
    2003,
  )
  const fruitBasket = withAnswer(
    [option('correct', [itemVisual('orange')], '橙子'), option('wrong-1', [itemVisual('sock')], '袜子'), option('wrong-2', [itemVisual('car')], '小车')],
    0,
    2004,
  )
  const countStrawberry = withAnswer(
    [{ id: 'correct', text: '3 个' }, { id: 'wrong-1', text: '2 个' }, { id: 'wrong-2', text: '4 个' }],
    0,
    2005,
  )
  const roundSnack = withAnswer(
    [option('correct', [itemVisual('cookie')], '饼干'), option('wrong-1', [itemVisual('banana')], '香蕉'), option('wrong-2', [itemVisual('scarf')], '围巾')],
    0,
    2006,
  )
  const oddClothes = withAnswer(
    [option('wrong-1', [itemVisual('hat')], '帽子'), option('wrong-2', [itemVisual('sock')], '袜子'), option('correct', [itemVisual('apple')], '苹果')],
    2,
    2007,
  )

  return [
    makeQuestion(2000, {
      age: 'age2',
      template: 'choice',
      skill: '找相同',
      prompt: '哪一个和小苹果一样？',
      scene: [itemVisual('apple')],
      answerId: sameApple.answerId,
      options: sameApple.options,
      success: '找到同样的小苹果啦。',
      retry: '先看颜色，再看是不是圆圆的苹果。',
      tags: ['精选', '观察力', '水果', '形色匹配'],
      difficulty: 1,
    }),
    makeQuestion(2001, {
      age: 'age2',
      template: 'choice',
      skill: '比多少',
      prompt: '哪一组香蕉更多？',
      scene: [visual('pill', 'sun', false, '多')],
      answerId: moreBananas.answerId,
      options: moreBananas.options,
      success: '三个香蕉比两个香蕉更多。',
      retry: '可以一个一个数香蕉。',
      tags: ['精选', '数量', '比较', '水果'],
      difficulty: 1,
    }),
    makeQuestion(2002, {
      age: 'age2',
      template: 'choice',
      skill: '生活常识',
      prompt: '哪一个可以穿在脚上？',
      scene: [visual('pill', 'leaf', false, '脚')],
      answerId: shoe.answerId,
      options: shoe.options,
      success: '鞋子可以穿在脚上。',
      retry: '想一想出门时脚上穿什么。',
      tags: ['精选', '常识', '衣物'],
      difficulty: 1,
    }),
    makeQuestion(2003, {
      age: 'age2',
      template: 'shadow',
      skill: '找阴影',
      prompt: '哪一个是苹果的影子？',
      scene: [itemVisual('apple')],
      answerId: appleShadow.answerId,
      options: appleShadow.options,
      success: '苹果的影子也是圆圆的苹果轮廓。',
      retry: '影子只看外面的样子。',
      tags: ['精选', '观察力', '空间', '水果'],
      difficulty: 1,
    }),
    makeQuestion(2004, {
      age: 'age2',
      template: 'drag',
      skill: '拖拽分类',
      prompt: '把水果拖到果篮里',
      scene: [itemVisual('apple', true), itemVisual('pear', true)],
      answerId: fruitBasket.answerId,
      options: fruitBasket.options,
      success: '橙子是水果，放进果篮。',
      retry: '果篮里要放可以吃的水果。',
      tags: ['精选', '分类', '水果', '手眼协调'],
      difficulty: 1,
      meta: { dropLabel: '果篮' },
    }),
    makeQuestion(2005, {
      age: 'age2',
      template: 'choice',
      skill: '数一数',
      prompt: '这里有几个草莓？',
      scene: [itemVisual('strawberry', true), itemVisual('strawberry', true), itemVisual('strawberry', true)],
      answerId: countStrawberry.answerId,
      options: countStrawberry.options,
      success: '一共有 3 个草莓。',
      retry: '用手指点着，一个一个数。',
      tags: ['精选', '数量', '数数', '水果'],
      difficulty: 1,
    }),
    makeQuestion(2006, {
      age: 'age2',
      template: 'choice',
      skill: '找形状',
      prompt: '哪一个是圆圆的点心？',
      scene: [visual('circle', 'coral', false, '圆')],
      answerId: roundSnack.answerId,
      options: roundSnack.options,
      success: '饼干是圆圆的点心。',
      retry: '找外面圆圆的那个。',
      tags: ['精选', '形状', '常识', '食物'],
      difficulty: 1,
    }),
    makeQuestion(2007, {
      age: 'age2',
      template: 'choice',
      skill: '找不同',
      prompt: '哪一个不是衣物？',
      scene: [itemVisual('hat', true), itemVisual('sock', true)],
      answerId: oddClothes.answerId,
      options: oddClothes.options,
      success: '苹果可以吃，不是衣物。',
      retry: '衣物是可以穿戴在身上的。',
      tags: ['精选', '分类', '衣物', '常识'],
      difficulty: 1,
    }),
  ]
}

function curatedAge3Questions(): Question[] {
  const notFruit = withAnswer(
    [option('wrong-1', [itemVisual('pear')], '梨'), option('wrong-2', [itemVisual('strawberry')], '草莓'), option('correct', [itemVisual('shoe')], '鞋子')],
    2,
    2100,
  )
  const notClothes = withAnswer(
    [option('wrong-1', [itemVisual('shirt')], '上衣'), option('wrong-2', [itemVisual('pants')], '裤子'), option('correct', [itemVisual('cookie')], '饼干')],
    2,
    2101,
  )
  const bodyWear = withAnswer(
    [option('correct', [itemVisual('shirt')], '上衣'), option('wrong-1', [itemVisual('boat')], '小船'), option('wrong-2', [itemVisual('orange')], '橙子')],
    0,
    2102,
  )
  const fruitPattern = withAnswer(
    [option('correct', [itemVisual('pear')], '梨'), option('wrong-1', [itemVisual('apple')], '苹果'), option('wrong-2', [itemVisual('banana')], '香蕉')],
    0,
    2103,
  )
  const leftShoe = withAnswer([{ id: 'a', text: '左边' }, { id: 'b', text: '右边' }], 0, 2104)
  const matchFruit = withAnswer(
    [option('correct', [itemVisual('orange')], '橙子'), option('wrong-1', [itemVisual('hat')], '帽子'), option('wrong-2', [itemVisual('car')], '小车')],
    0,
    2105,
  )
  const hatShadow = withAnswer(
    [
      option('correct', [{ ...itemVisual('hat'), tone: 'ink' }], '帽子影子'),
      option('wrong-1', [{ ...itemVisual('cup'), tone: 'ink' }], '杯子影子'),
      option('wrong-2', [{ ...itemVisual('shoe'), tone: 'ink' }], '鞋子影子'),
    ],
    0,
    2106,
  )
  const closet = withAnswer(
    [option('correct', [itemVisual('pants')], '裤子'), option('wrong-1', [itemVisual('apple')], '苹果'), option('wrong-2', [itemVisual('drum')], '小鼓')],
    0,
    2107,
  )
  const instrument = withAnswer(
    [option('correct', [itemVisual('bell')], '铃铛'), option('wrong-1', [itemVisual('cup')], '杯子'), option('wrong-2', [itemVisual('shoe')], '鞋子')],
    0,
    2108,
  )

  return [
    makeQuestion(2100, {
      age: 'age3',
      template: 'choice',
      skill: '分类',
      prompt: '哪一个不是水果？',
      scene: [itemVisual('apple', true), itemVisual('banana', true), visual('pill', 'leaf', false, '水果')],
      answerId: notFruit.answerId,
      options: notFruit.options,
      success: '鞋子是衣物，不是水果。',
      retry: '水果是可以吃的，比如梨和草莓。',
      tags: ['精选', '分类', '水果', '常识'],
      difficulty: 2,
    }),
    makeQuestion(2101, {
      age: 'age3',
      template: 'choice',
      skill: '分类',
      prompt: '哪一个不是衣物？',
      scene: [itemVisual('shirt', true), itemVisual('pants', true), visual('pill', 'sky', false, '衣物')],
      answerId: notClothes.answerId,
      options: notClothes.options,
      success: '饼干可以吃，不是衣物。',
      retry: '衣物是可以穿戴的东西。',
      tags: ['精选', '分类', '衣物', '常识'],
      difficulty: 2,
    }),
    makeQuestion(2102, {
      age: 'age3',
      template: 'choice',
      skill: '生活常识',
      prompt: '哪一个可以穿在身上？',
      scene: [visual('pill', 'sky', false, '穿')],
      answerId: bodyWear.answerId,
      options: bodyWear.options,
      success: '上衣可以穿在身上。',
      retry: '想一想早上换衣服时会穿什么。',
      tags: ['精选', '常识', '衣物'],
      difficulty: 2,
    }),
    makeQuestion(2103, {
      age: 'age3',
      template: 'choice',
      skill: '规律',
      prompt: '苹果、香蕉、梨，又是苹果、香蕉，后面是什么？',
      scene: [itemVisual('apple', true), itemVisual('banana', true), itemVisual('pear', true), itemVisual('apple', true), itemVisual('banana', true), visual('pill', 'ink', false, '?')],
      answerId: fruitPattern.answerId,
      options: fruitPattern.options,
      success: '苹果、香蕉、梨三个一组重复。',
      retry: '从第一个水果开始慢慢念一遍。',
      tags: ['精选', '规律', '水果', '逻辑'],
      difficulty: 2,
    }),
    makeQuestion(2104, {
      age: 'age3',
      template: 'leftRight',
      skill: '左右判断',
      prompt: '鞋子在小猫的哪一边？',
      scene: [itemVisual('shoe'), itemVisual('cat'), itemVisual('cup')],
      answerId: leftShoe.answerId,
      options: leftShoe.options,
      success: '鞋子在小猫的左边。',
      retry: '先找到中间的小猫，再看鞋子在哪边。',
      tags: ['精选', '空间', '左右', '生活物品'],
      difficulty: 2,
      meta: { left: itemVisual('shoe'), target: itemVisual('shoe'), right: itemVisual('cup'), relation: 'side' },
    }),
    makeQuestion(2105, {
      age: 'age3',
      template: 'connect',
      skill: '连线配对',
      prompt: '把同类水果连起来',
      scene: [itemVisual('apple')],
      answerId: matchFruit.answerId,
      options: matchFruit.options,
      success: '苹果和橙子都是水果。',
      retry: '先想一想哪个也可以吃、也属于水果。',
      tags: ['精选', '配对', '分类', '水果'],
      difficulty: 2,
      meta: { relation: 'count' },
    }),
    makeQuestion(2106, {
      age: 'age3',
      template: 'shadow',
      skill: '找阴影',
      prompt: '哪一个是帽子的影子？',
      scene: [itemVisual('hat')],
      answerId: hatShadow.answerId,
      options: hatShadow.options,
      success: '帽子的影子保留了帽檐的轮廓。',
      retry: '不要看颜色，只看外形轮廓。',
      tags: ['精选', '观察力', '空间', '衣物'],
      difficulty: 2,
    }),
    makeQuestion(2107, {
      age: 'age3',
      template: 'drag',
      skill: '拖拽分类',
      prompt: '把衣物放进衣柜',
      scene: [itemVisual('shirt', true), itemVisual('hat', true)],
      answerId: closet.answerId,
      options: closet.options,
      success: '裤子是衣物，放进衣柜。',
      retry: '衣柜里放可以穿戴的东西。',
      tags: ['精选', '分类', '衣物', '手眼协调'],
      difficulty: 2,
      meta: { dropLabel: '衣柜' },
    }),
    makeQuestion(2108, {
      age: 'age3',
      template: 'choice',
      skill: '分类',
      prompt: '哪一个是乐器？',
      scene: [itemVisual('drum', true), itemVisual('maraca', true), visual('pill', 'sun', false, '乐器')],
      answerId: instrument.answerId,
      options: instrument.options,
      success: '铃铛会发出声音，是乐器。',
      retry: '乐器是可以发出音乐声音的东西。',
      tags: ['精选', '分类', '乐器', '常识'],
      difficulty: 2,
    }),
  ]
}

function curatedAge4Questions(): Question[] {
  const fruitMatrix = withAnswer(
    [option('correct', [itemVisual('strawberry')], '草莓'), option('wrong-1', [itemVisual('shoe')], '鞋子'), option('wrong-2', [itemVisual('carrot')], '胡萝卜')],
    0,
    2200,
  )
  const fiveApples = withAnswer(
    [{ id: 'correct', text: '5 个' }, { id: 'wrong-1', text: '4 个' }, { id: 'wrong-2', text: '6 个' }],
    0,
    2201,
  )
  const smallHat = withAnswer(
    [option('correct', [itemVisual('hat', true)], '小帽子'), option('wrong-1', [itemVisual('shoe', true)], '小鞋子'), option('wrong-2', [itemVisual('hat')], '大帽子')],
    0,
    2202,
  )
  const edibleGroup = withAnswer(
    [
      option('correct', [itemVisual('apple', true), itemVisual('cookie', true)], '都能吃'),
      option('wrong-1', [itemVisual('shirt', true), itemVisual('shoe', true)], '都能穿'),
      option('wrong-2', [itemVisual('car', true), itemVisual('boat', true)], '都能走'),
    ],
    0,
    2203,
  )
  const flyPair = withAnswer(
    [option('correct', [itemVisual('bird')], '小鸟'), option('wrong-1', [itemVisual('boat')], '小船'), option('wrong-2', [itemVisual('bowl')], '碗')],
    0,
    2204,
  )
  const rightCup = withAnswer([{ id: 'a', text: '左边' }, { id: 'b', text: '右边' }], 1, 2205)
  const carShadow = withAnswer(
    [
      option('correct', [{ ...itemVisual('car'), tone: 'ink' }], '小车影子'),
      option('wrong-1', [{ ...itemVisual('boat'), tone: 'ink' }], '小船影子'),
      option('wrong-2', [{ ...itemVisual('drum'), tone: 'ink' }], '小鼓影子'),
    ],
    0,
    2206,
  )
  const complexPattern = withAnswer(
    [option('correct', [itemVisual('pear')], '梨'), option('wrong-1', [itemVisual('apple')], '苹果'), option('wrong-2', [itemVisual('strawberry')], '草莓')],
    0,
    2207,
  )

  return [
    makeQuestion(2200, {
      age: 'age4',
      template: 'choice',
      skill: '矩阵补缺',
      prompt: '上面都换成水果，下面也这样换，问号处是什么？',
      scene: [itemVisual('shoe'), itemVisual('orange'), visual('pill', 'ink', false, '→'), itemVisual('hat'), visual('pill', 'ink', false, '?')],
      answerId: fruitMatrix.answerId,
      options: fruitMatrix.options,
      success: '上面从衣物换成水果，下面也要换成水果。',
      retry: '先看上面两个物品属于哪一类，再照着变。',
      tags: ['精选', '逻辑', '分类', '矩阵'],
      difficulty: 3,
    }),
    makeQuestion(2201, {
      age: 'age4',
      template: 'choice',
      skill: '数量合成',
      prompt: '两边苹果合起来一共有几个？',
      scene: [itemVisual('apple', true), itemVisual('apple', true), visual('pill', 'ink', false, '+'), itemVisual('apple', true), itemVisual('apple', true), itemVisual('apple', true)],
      answerId: fiveApples.answerId,
      options: fiveApples.options,
      success: '2 个加 3 个，一共 5 个。',
      retry: '先数左边 2 个，再接着数右边 3 个。',
      tags: ['精选', '数量', '合成', '水果'],
      difficulty: 3,
    }),
    makeQuestion(2202, {
      age: 'age4',
      template: 'choice',
      skill: '类比',
      prompt: '大杯子变小杯子，大帽子会变成？',
      scene: [itemVisual('cup'), itemVisual('cup', true), itemVisual('hat'), visual('pill', 'ink', false, '?')],
      answerId: smallHat.answerId,
      options: smallHat.options,
      success: '变化规则是从大变小，物品不变。',
      retry: '先看杯子发生了什么变化。',
      tags: ['精选', '逻辑', '类比', '大小'],
      difficulty: 3,
    }),
    makeQuestion(2203, {
      age: 'age4',
      template: 'choice',
      skill: '组合分类',
      prompt: '哪一组都能吃？',
      scene: [visual('pill', 'leaf', false, '都能吃')],
      answerId: edibleGroup.answerId,
      options: edibleGroup.options,
      success: '苹果和饼干都能吃。',
      retry: '要两个都符合“能吃”。',
      tags: ['精选', '分类', '组合判断', '常识'],
      difficulty: 3,
    }),
    makeQuestion(2204, {
      age: 'age4',
      template: 'connect',
      skill: '连线推理',
      prompt: '飞机会飞，哪一个也会飞？',
      scene: [itemVisual('plane')],
      answerId: flyPair.answerId,
      options: flyPair.options,
      success: '小鸟也会飞。',
      retry: '想一想哪些东西在天上飞。',
      tags: ['精选', '配对', '类比', '常识'],
      difficulty: 3,
      meta: { relation: 'count' },
    }),
    makeQuestion(2205, {
      age: 'age4',
      template: 'leftRight',
      skill: '左右判断',
      prompt: '杯子在小狗的哪一边？',
      scene: [itemVisual('shoe'), itemVisual('dog'), itemVisual('cup')],
      answerId: rightCup.answerId,
      options: rightCup.options,
      success: '杯子在小狗的右边。',
      retry: '先找到中间的小狗，再看杯子在哪边。',
      tags: ['精选', '空间', '左右', '生活物品'],
      difficulty: 3,
      meta: { target: itemVisual('cup'), left: itemVisual('shoe'), right: itemVisual('cup'), relation: 'side' },
    }),
    makeQuestion(2206, {
      age: 'age4',
      template: 'shadow',
      skill: '找阴影',
      prompt: '哪一个是小车的影子？',
      scene: [itemVisual('car')],
      answerId: carShadow.answerId,
      options: carShadow.options,
      success: '小车的影子保留了车身和轮子的轮廓。',
      retry: '只看外形轮廓，不看颜色。',
      tags: ['精选', '观察力', '空间', '交通工具'],
      difficulty: 3,
    }),
    makeQuestion(2207, {
      age: 'age4',
      template: 'choice',
      skill: '三步规律',
      prompt: '苹果、草莓、梨、苹果、草莓，后面是什么？',
      scene: [itemVisual('apple', true), itemVisual('strawberry', true), itemVisual('pear', true), itemVisual('apple', true), itemVisual('strawberry', true), visual('pill', 'ink', false, '?')],
      answerId: complexPattern.answerId,
      options: complexPattern.options,
      success: '三个水果一组重复，后面是梨。',
      retry: '把前三个当成一组，再看第二组缺什么。',
      tags: ['精选', '规律', '逻辑', '水果'],
      difficulty: 3,
    }),
  ]
}

const ageQuestionTarget = questionFamilyCount * 5

function fillAgeQuestions(curated: Question[], generated: Question[]) {
  return [...curated, ...generated].slice(0, ageQuestionTarget)
}

function buildAge2(): Question[] {
  return fillAgeQuestions(curatedAge2Questions(), [
    ...Array.from({ length: questionFamilyCount }, (_, index) => matchQuestion('age2', index, 1)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => countQuestion('age2', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => oddQuestion('age2', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => shadowQuestion('age2', index, 1)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => dragQuestion('age2', index, 1)),
  ])
}

function buildAge3(): Question[] {
  return fillAgeQuestions(curatedAge3Questions(), [
    ...Array.from({ length: questionFamilyCount }, (_, index) => sequenceQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => categoryQuestion('age3', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => connectQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => shadowQuestion('age3', index, 2)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => leftRightQuestion('age3', index, 2)),
  ])
}

function buildAge4(): Question[] {
  return fillAgeQuestions(curatedAge4Questions(), [
    ...Array.from({ length: questionFamilyCount }, (_, index) => sequenceQuestion('age4', index, 3)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => analogyQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => matrixQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => mazeQuestion('age4', index)),
    ...Array.from({ length: questionFamilyCount }, (_, index) => sumQuestion('age4', index)),
  ])
}

export const generatedQuestions: Question[] = [...buildAge2(), ...buildAge3(), ...buildAge4()]

export function getQuestionCountByAge(questions: Question[], age: AgeKey) {
  return questions.filter((question) => question.age === age && question.status === 'approved').length
}

function hashQuestion(seed: number, id: string) {
  let hash = Math.abs(seed) || 2166136261
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function pickSessionQuestions(questions: Question[], age: AgeKey, seed: number) {
  const pool = questions.filter((question) => question.age === age && question.status === 'approved')
  if (pool.length <= sessionQuestionCount) return pool

  const picked: Question[] = []
  const skillCounts = new Map<string, number>()
  const sorted = [...pool].sort((a, b) => hashQuestion(seed, a.id) - hashQuestion(seed, b.id))
  const featured = sorted.filter((question) => question.tags.includes('精选')).slice(0, 3)

  function addQuestion(question: Question) {
    if (picked.some((item) => item.id === question.id)) return false
    picked.push(question)
    skillCounts.set(question.skill, (skillCounts.get(question.skill) ?? 0) + 1)
    return true
  }

  featured.forEach(addQuestion)

  for (const question of sorted) {
    if (picked.length >= sessionQuestionCount) break
    if ((skillCounts.get(question.skill) ?? 0) >= 2) continue
    addQuestion(question)
  }

  for (const question of sorted) {
    if (picked.length >= sessionQuestionCount) break
    addQuestion(question)
  }

  return picked.sort((a, b) => {
    const aFeatured = a.tags.includes('精选') ? 0 : 1
    const bFeatured = b.tags.includes('精选') ? 0 : 1
    if (aFeatured !== bFeatured) return aFeatured - bFeatured
    return hashQuestion(seed + 31, a.id) - hashQuestion(seed + 31, b.id)
  })
}
