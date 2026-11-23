# 照片位（换猫只改这里）

第一版**不抠图**：照片直接放进来，前端用「椭圆柔边遮罩 + 低饱和暖调」贴到米色底上。
`cat-idle.png` / `cat-sleep.png` 现在是**矢量占位图渲染出来的**，只为把路径跑通。

## 放什么

| 文件 | 用在哪 | 建议 |
|:---|:---|:---|
| `cat-idle.png` | 白天 / 专注 | 坐姿、正面或 3/4 侧、猫身占画面 70% 以上、背景干净（墙/地板都行） |
| `cat-sleep.png` | 睡前 | 趴着或蜷着、最好闭眼；没有就先用睡姿相近的一张 |

## 怎么换

1. 覆盖同名文件（保持文件名，代码不用改）
2. 刷新页面即可；`body.has-photo` 自动打上，矢量占位图自动隐藏
3. 缺文件 → 自动退回矢量图，不会白屏

## 参数在哪调

`index.html` 里三处，都是纯数值，改完刷新就行：

```css
.cat-photo{
  filter:saturate(.82) sepia(.10) brightness(1.03) contrast(.97);   /* 低饱和暖调 */
  -webkit-mask-image:radial-gradient(closest-side at 50% 50%,
      #000 58%, rgba(0,0,0,.85) 76%, transparent 97%);              /* 柔边羽化 */
}
.fish-overlay{ --fish-w:15%; --fish-right:24%; --fish-top:34%; }     /* 小鱼干位置 */
```

- 边缘还想要更软 → 把 `58%` 调小、`97%` 调大
- 太黄 / 太灰 → 调 `sepia` 与 `saturate`
- 照片本身偏暗 → 调 `brightness`

## 第二版（等第一版跑通再说）

抠图（rembg 一类本地模型）把猫从背景切出来 → 可以换任意底色、做睁眼/闭眼变体。
到那时把 `mask-image` 去掉、改成透明 PNG 即可，结构不用动。

## 2026-11-22 更新：已换洛洛插画 + WebP 化

| 文件 | 现在是什么 | 大小 |
|:---|:---|:---|
| `cat-idle.png` / `cat-sleep.png` | 龙羽落地的插画原图（透明底，**兜底用**） | 436KB / 448KB |
| `cat-idle.webp` / `cat-sleep.webp` | 同一张图转 WebP q90（612px / 716px ≈2× 显示尺寸） | **65KB / 46KB** |

代码优先取 `.webp`，失败退 `.png`，再失败退矢量占位图（三级兜底）。

**注意**：`index.html` 里两张 `<img>` 都**故意不写 src** —— 写了就由 HTML 先下载 PNG，
JS 再切 WebP，等于白下 880KB（实测发生过）。src 由 JS 在需要时设置，睡前那张懒加载。

抠图：`scripts/keyout_magenta.py`（品红底色键）。`tmp/luoluo/matte.py` 写死米白底、
tol 对纯白底失配（tol≤20 一个像素都不吃、tol=40 会吃掉白肚皮），已不走它。
