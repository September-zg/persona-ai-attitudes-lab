# 技术报告

> 这是提交模板。只填写已经验证的事实，不要编造公网网址、参与者、反馈或测试结果。

## 1. 项目和目的

- 项目名称：Persona & AI Attitudes Lab
- 项目目的：探索短版五大人格自评与 AI 态度之间的描述性关系。
- 使用边界：教育/研究探索，不是临床、医学、招聘或诊断工具。

## 2. 测量设计

- 人格框架：五个维度的 20 道 Mini-IPIP 形式题目，每个维度 4 题。
- 翻译状态：中文题目由项目翻译，不宣称是经过验证的中文版本。
- AI 态度维度：感知效益、信任与采纳、风险顾虑。
- 作答量尺：人格题使用“与自己的符合程度”，AI 态度题使用“同意程度”，均为 1–5 分。
- 反向计分：`6 - 原始回答`；维度分数为键控题目的平均值。

## 3. 系统实现

- 前端：原生 HTML、CSS 和 JavaScript。
- 本地后端：不依赖第三方库的 Python HTTP 服务器和 JSON 存储。
- 服务端计分：`scoring.py` 检查回答范围，并根据原始回答重新计算分数。
- 研究者访问：设置 `ADMIN_TOKEN` 后，汇总和导出接口需要匹配的 `X-Admin-Token`。这是共享令牌保护，不是完整账户系统。
- 隐私：默认不收集姓名和联系方式；运行时 `data.json` 不加入版本控制。

## 4. 分析方法

使用 [`analysis-methods.md`](analysis-methods.md) 说明提交次数、逐题回答分布、维度平均分、各题组 Cronbach α、Pearson 相关和反馈摘要，并说明小样本和非因果限制。

## 5. 验证证据

- 已执行 `python3 -m py_compile server.py scoring.py scoring_examples.py seed_synthetic.py`。
- 已执行 `python3 -m unittest discover -s tests`，18 项测试全部通过。
- 已执行 `python3 scoring_examples.py`，显示 `scoring specification checks passed`。
- 2026-09-13 已在 Render 验证服务状态为 Live，当前部署提交为 `bdc5b16`。
- 公网首页可访问；直接打开研究者入口会显示“研究者登录”，未认证的 `/api/summary` 请求在 Render 日志中返回 401。
- 合成验证数据必须单独记录，不能计入真实试点。

## 6. 试点结果

- 公网网站：<https://persona-ai-attitudes-lab.onrender.com/>；已于 2026-09-13 验证 Render 状态为 Live。
- GitHub 仓库：<https://github.com/September-zg/persona-ai-attitudes-lab>。
- 研究者入口：<https://persona-ai-attitudes-lab.onrender.com/index.html?view=admin>；使用共享 `ADMIN_TOKEN` 登录。
- 独立参与者人数：待项目负责人招募并记录至少 10 名真实志愿者后填写。
- 完成情况和反馈：待真实试点评估后填写；当前仓库中的合成数据不代表真实参与者。

## 7. 限制和下一步

说明本地 JSON 存储、共享令牌而非完整账户认证、参与者独立性、探索性 AI 态度题、中文翻译状态、小样本限制，以及由真实反馈支持的下一步改进。
