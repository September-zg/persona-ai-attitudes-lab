# Persona & AI Attitudes Lab

一个用于教育/研究探索的测评平台原型，包含五大人格结构和 AI 态度问卷，并提供 Python API。

## 在线访问

- 普通测评者入口：<https://persona-ai-attitudes-lab.onrender.com/>
- 研究者入口：<https://persona-ai-attitudes-lab.onrender.com/index.html?view=admin>（需要 Render 环境中的管理员令牌）
- 源码仓库：<https://github.com/September-zg/persona-ai-attitudes-lab>

Render 已验证部署到提交 `bdc5b16`，服务状态为 Live。普通入口和研究者入口使用同一部署；研究者入口会先显示登录框，汇总接口未带令牌时返回 401。

## 本地运行

有两种运行方式：

- **离线预览**：直接在浏览器打开 `index.html`。结果和反馈只保存在当前浏览器的 `localStorage` 中，适合查看界面和测试基本交互。
- **本地服务器**：运行下方的 Python 命令。问卷提交和反馈会写入项目根目录的 `data.json`，研究者汇总页通过服务器 API 读取汇总结果。

## 本地服务器预览

具备 Python 3 时可运行：

```bash
python3 server.py
```

然后访问 <http://localhost:8000/index.html>。服务器提供 `/api/responses`、`/api/feedback` 和 `/api/summary` 的基础接口。提交答案时，服务器会重新计算并保存分数；浏览器本地存储仍作为离线回退。按 `Ctrl+C`（macOS 为 `Control+C`）可停止服务器。

公开部署时，在平台环境变量中设置一个随机的 `ADMIN_TOKEN`。设置后，打开研究者页面会要求输入令牌，汇总和导出请求通过 `X-Admin-Token` 发送。不要把令牌写入代码、README 或 GitHub；正式部署还应启用 HTTPS。

## 测量与计分

- 人格部分采用五大人格结构的 20 道 Mini-IPIP 形式题目，每个维度 4 题。
- AI 态度部分包含感知效益、信任与采纳、风险顾虑 3 个探索性子维度，每个子维度 2 题。
- 所有题目使用 1–5 分量尺；提交前要求所有题目都有回答。
- 反向题使用 `6 - 原始回答` 计算，维度分数是该维度键控题目的平均值。
- 计分规则固定写在 `scoring.py`，服务器会忽略浏览器提交的分数并从原始答案重新计算。
- 当前中文人格题目是项目翻译，AI 态度题是探索性自编题目，不能宣称为正式验证量表。

计分测试可运行：

```bash
python3 -m unittest discover -s tests
python3 scoring_examples.py
```

未完成题目会被拒绝；超出 1–5 或非整数的回答也会被拒绝。浏览器端完整流程需要按照 [`docs/local-test-checklist.md`](docs/local-test-checklist.md) 手动验证。

## 当前阶段限制

- 这是原生 HTML/CSS/JavaScript 原型，当前使用本地 JSON 文件保存服务器运行数据，尚未接入正式数据库。
- 本地存储不提供跨设备同步或生产级隐私保护。
- 服务器支持通过 `ADMIN_TOKEN` 保护研究者汇总接口；未设置令牌时仅适合本地开发，公开部署必须设置令牌并使用 HTTPS。
- Mini-IPIP 中文题目是项目翻译，不能宣称为经过验证的中文版。
- AI 态度量表为探索性项目量表，尚未完成信度或效度验证。

## 下一阶段

下一阶段应加入更完整的管理员账户体系、访问审计、正式数据库、匿名导出和自动化 API/浏览器测试。


## 提交材料

课程通知中的截止时间是 **2026-09-13 23:59**。提交前需要创建自己的 GitHub 仓库，并把真实仓库链接私信发给老师。公网测评网址验证无误后，再填写到本 README 和 [`docs/TECHNICAL_REPORT.md`](docs/TECHNICAL_REPORT.md) 中，不要填写虚构网址。

- AI 辅助开发记录：[`docs/AI_DEVELOPMENT_RECORD.md`](docs/AI_DEVELOPMENT_RECORD.md)
- 试点评估：[`docs/PILOT_EVALUATION.md`](docs/PILOT_EVALUATION.md)
- 技术报告：[`docs/TECHNICAL_REPORT.md`](docs/TECHNICAL_REPORT.md)
- GitHub 提交指南：[`docs/COMMIT_GUIDE.md`](docs/COMMIT_GUIDE.md)
- 分析方法：[`docs/analysis-methods.md`](docs/analysis-methods.md)
- 本地测试清单：[`docs/local-test-checklist.md`](docs/local-test-checklist.md)

## 提交链接

- 公网测评网站：<https://persona-ai-attitudes-lab.onrender.com/>
- GitHub 源码仓库：<https://github.com/September-zg/persona-ai-attitudes-lab>
- 试点评估：需要项目负责人邀请至少 10 名彼此独立的真实志愿者后填写；仓库中的合成数据不能作为试点证据。
