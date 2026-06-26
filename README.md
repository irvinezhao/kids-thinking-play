# 小小思维岛

面向 2-5 岁儿童的幼儿益智答题 App 原型。第一版是 Vite + React + TypeScript 的移动端优先 Web/PWA，可以继续扩展成微信小程序、iOS/Android 或后台题库系统。

在线预览：[https://irvinezhao.github.io/kids-thinking-play/](https://irvinezhao.github.io/kids-thinking-play/)

## 当前原型

- 年龄入口：2-3 岁、3-4 岁、4-5 岁
- 答题流程：选年龄后进入每日 10 题练习
- 原创题库：每个年龄段 150 道，共 450 道，含精选题、生成题、更细标签和难度
- 生活物品：水果、衣物、动物、交通工具等分类题会显示统一风格的原创 CSS 小插图，不再只显示文字和抽象形状
- 视觉风格：更柔和的绘本纸背景、小岛伙伴主视觉、玩具贴纸式年龄入口和答题舞台
- 年龄分层：3-4 岁偏分类、配对、左右和观察；4-5 岁偏三步规律、类比、矩阵补缺、数量合成和路径迷宫
- 题型模板：普通选择、拖拽分类、连线配对、找阴影、路径迷宫、左右判断、矩阵补缺、数量合成
- 即时反馈：答对等待 2 秒自动下一题；答错等待 2 秒重新作答，支持烟花/气泡动效、鼓励提示音、静音和重播
- 题目朗读：每道题进入后自动播放同步中文题干，优先使用浏览器可用的普通话人声，照顾还不识字的孩子
- 主题切换：支持白天/黑夜模式，选择会保存在本地
- 家长模式：错题记录、能力雷达、每日练习时长、近况正确率、错题重练
- 内容后台：题目 JSON 导入、标签、难度、年龄段审核、通过后进入孩子端题库
- 本地进度：记录每个年龄段已玩次数和最好成绩

## 测试截图

以下截图由 Playwright 在移动端 390×844 和桌面端 1024×768 视口生成，用于覆盖首页、答题、反馈、结果、家长模式和内容后台的核心流程。

| 首页 | 答题 | 答对反馈 |
| --- | --- | --- |
| <img src="docs/screenshots/home-mobile.png" width="220" alt="首页年龄选择截图"> | <img src="docs/screenshots/quiz-mobile.png" width="220" alt="答题页截图"> | <img src="docs/screenshots/feedback-mobile.png" width="220" alt="答对反馈截图"> |

| 结果 | 家长模式 | 内容后台 |
| --- | --- | --- |
| <img src="docs/screenshots/result-mobile.png" width="220" alt="结果页截图"> | <img src="docs/screenshots/parent-mobile.png" width="220" alt="家长模式截图"> | <img src="docs/screenshots/admin-mobile.png" width="220" alt="内容后台截图"> |

桌面端首页：

<img src="docs/screenshots/home-desktop.png" width="620" alt="桌面端首页截图">

## 版权边界

不要直接复制《左右脑思维训练》或其他实体书的题目、插图、答案、版式、目录结构。更稳妥的做法是：

- 用通用能力点做原创题库，例如颜色、形状、数量、分类、规律、空间、逻辑类比
- 购买或取得正版授权后，再导入对应内容
- 自研插图、动效和题目模板，形成自己的题库资产

## 题目 JSON 格式

后台支持粘贴单题对象或题目数组。导入后默认待审核，点击“全部通过”后才会进入孩子端题库。

```json
{
  "age": "age3",
  "template": "shadow",
  "skill": "找阴影",
  "prompt": "哪一个是小星星的影子？",
  "scene": [{ "shape": "star", "tone": "sun" }],
  "answerId": "a",
  "options": [
    { "id": "a", "visuals": [{ "shape": "star", "tone": "ink" }] },
    { "id": "b", "visuals": [{ "shape": "circle", "tone": "ink" }] }
  ],
  "success": "星星的影子也是星星形状。",
  "retry": "影子只看外面的轮廓。",
  "tags": ["观察力", "形状", "空间"],
  "difficulty": 2,
  "status": "needsReview"
}
```

## 下一步

1. 继续把精选题扩到每个年龄段 30-50 道，并人工校对难度梯度
2. 给家长模式增加周报、能力趋势和错题分类筛选
3. 把本地内容后台替换成真正的管理后台和数据库
4. 做 PWA 离线缓存、微信小程序或 Capacitor 打包

## 开发

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
npm run lint
python smoke_test.py
```
