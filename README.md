# 绩效算分公式撰写（DSH 插件）

左侧栏「绩效算分公式」入口 + 中央工作台面板。把绩效衡量标准批量翻译成可直接配置到绩效系统的算分公式，
按 `performance-formula-writer` 技能的口径执行：A–F 六类识别、31 条标准计算规则库匹配、七列配置表、
额外变量汇总、疑问指标单独复列。

## 使用

1. 左侧栏点击算分公式图标（全局面板区，与 Plugins / Schedules 并列）。
2. 填写「得分上限（满分）」，如 `120`。
3. 每行一条衡量标准：

   ```
   指标描述 | 衡量标准
   指标描述：衡量标准
   只写衡量标准（自动命名）
   [100] 指标描述 | 衡量标准      ← 行首方括号可为该指标单独指定满分
   ```

4. 点「生成公式」，得到七列表格；「复制 Markdown」可直接粘进对话或文档。

面板内始终保留本次草稿，切换面板回来后不会丢失。

## 规则能力

| 类型 | 判定 | 输出 |
|:---:|---|---|
| A | 每次 / 每项 / 每单 / 每批扣 X 分 | `MAX(满 - 完*X, 0)`；多事件取最高单次扣分 |
| B | 较目标值每低 / 每超 X 个百分点扣 Y 分 | 正向 `MAX(MIN(满, 满+(完-目)*k), 0)`；负向 `MAX(MIN(满, 满-(完-目)*k), 0)` |
| C | 区间给固定分 | 嵌套 `IF`，区间左闭右开 |
| D | 得分 = 表达式 / 直接取完成值 | 分段 `IF` + `MAX/MIN` 控制上下限 |
| E | ≥X 得满分，每低 Y 扣 Z | 线性用 `k`，每满一步扣一次用 `FLOOR` |
| F | 否决项 + 扣分、事件 + 偏差、多维累加 | 否决置于最外层 `IF`；事件与偏差共存时按系统两字段约束删除事件扣分 |

- 达成率 / 完成率类一律以 `考核项.完成值 / 考核项.目标值` 表达，不另设字段。
- 命中 31 条标准库时沿用其规则名称；公式封顶与该指标满分一致则原样采用，不一致则按满分套用同构模板，
  并在「疑问指标」中标注。
- 每行输出都会带上「疑问点 / 当前口径 / 待确认」，口径推断不会静默写入表格。

## 数据

所有解析与计算都在页面本地完成，无网络请求、无文件写入。

## 安装

在 DSH 左侧栏 **插件 → 添加插件** 里粘贴仓库地址：

```
github:stevengualu/performance-formula-writer
```

要锁版本就加 tag：`github:stevengualu/performance-formula-writer#v1.0.0`。
装有 `dsh` CLI 的话等价于：

```bash
dsh plugin add github:stevengualu/performance-formula-writer
```

安装完成点「立即启用」；左侧栏没出现图标就重启一次 DSH。不要手工改 profile 的
`package.json` / `cordis.patch.yml`，交给插件管理器维护。

## 发版

维护者用 `scripts/release.sh`：

```bash
./scripts/release.sh init      # 首次：建仓、配 origin、推 main
./scripts/release.sh 1.1.0     # 发版：改版本号、commit、打 tag、push、建 Release
```

凭据放在 `~/.dsh/github-token`（chmod 600），仓库配置在 `.release.env`（已 gitignore）。
脚本会读取 macOS 系统代理，因为 git 本身不认系统代理设置。
```
