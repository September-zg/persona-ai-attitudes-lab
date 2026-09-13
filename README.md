# Personality & AI Attitudes Lab



一个用于课程作业和研究探索的在线测评平台，帮助参与者完成两部分匿名问卷：

- **人格**：基于 Mini-IPIP 的五大人格简短测评（20 题）
- **AI 态度**：探索对人工智能的感知效益、信任与使用意愿（6 题）

完成时间约 3–5 分钟。结果仅用于教育和研究探索，不用于临床诊断、招聘筛选或个人能力判断。

## 在线入口

- **参与者测评**：https://persona-ai-attitudes-lab.onrender.com/
- **研究者仪表盘**：https://persona-ai-attitudes-lab.onrender.com/index.html?view=admin
- **源码仓库**：https://github.com/September-zg/personality-ai-attitudes-lab

研究者页面需要单独设置的管理员密码。密码不写入 README、源码或公开材料。

## 平台功能

- 首页介绍、知情同意和匿名参与
- 1–5 分李克特量表、进度提示、漏答检查和返回修改
- 服务端重新计分，支持反向计分并拒绝非法答案
- 个人结果摘要、五大人格图表和维度解释
- 研究者汇总仪表盘：参与者人数、均值、分布、逐题回答、Cronbach’s α 和相关分析
- 可选的使用体验反馈
- 权限控制的数据导出与备份

## 仓库内容与提交材料

本仓库按模版的 A–E 要求组织材料：

| 作业要求 | 本仓库位置 |
| --- | --- |
| A. 已部署的 Web 应用 | 上方“参与者测评”链接；部署核验见 [`docs/verification.md`](docs/verification.md) |
| B. 源代码与使用说明 | `server.py`、`index.html`、`questionnaire.js`、`scoring.py` 及本 README |
| C. AI 辅助开发记录 | [`docs/AI_DEVELOPMENT_RECORD.md`](docs/AI_DEVELOPMENT_RECORD.md) |
| D. 至少 10 名参与者的试点评估 | [`docs/PILOT_EVALUATION.md`](docs/PILOT_EVALUATION.md)、[`docs/pilot-evaluation.md`](docs/pilot-evaluation.md) 和 [`docs/evidence/README.md`](docs/evidence/README.md) |
| E. 技术报告 | [`docs/TECHNICAL_REPORT.md`](docs/TECHNICAL_REPORT.md) |

量表定义和计分规则见 [`docs/measurement-spec.md`](docs/measurement-spec.md)；统计方法见 [`docs/analysis-methods.md`](docs/analysis-methods.md)。

## 本地运行

需要 Python 3。项目使用 Python 标准库，不需要 npm、第三方 Python 包或 API 密钥。

```bash
git clone https://github.com/September-zg/personality-ai-attitudes-lab.git
cd personality-ai-attitudes-lab
python3 server.py
```

然后打开 <http://localhost:8000/>。Windows 可使用 `py server.py`。运行测试：

```bash
python3 -m unittest discover -s tests
python3 scoring_examples.py
node --test tests/test_analysis.cjs   # 可选
```

## 研究者访问与数据

本地研究者页面可通过环境变量设置密码：

```bash
ADMIN_TOKEN='your-local-password' python3 server.py
```

数据默认写入 `data.json`。该文件不应提交到 GitHub，也不应包含姓名、邮箱、手机号或其他不必要的身份信息。Render 免费服务的本地文件可能在重启或重新部署后丢失，因此正式研究应接入持久化数据库并保留备份。

## 测量边界

Mini-IPIP 题目使用项目中文翻译；AI 态度题为探索性自编题。当前版本没有正式中文量表验证或常模，不作因果推断。试点数据只用于检查流程、可用性和描述性结果，不能替代正式心理测量验证。

## 数据口径

正式试点评估使用 11 位独立参与者和 7 条反馈。服务器后续产生的测试记录不计入正式试点证据；如果研究者页面显示更多记录，应以证据文件中的筛选口径为准，并在报告中说明。

本仓库保留根目录源码结构，以便直接运行 `python3 server.py`；`src/README.md` 说明各源码文件职责。仓库中的模块化脚本主要用于开发和测试，实际部署入口以 `index.html` 为准。

## 当前状态

当前部署入口使用根目录 `app.js`；仓库中的 `questionnaire.js` 和 `analysis.js` 保留用于模块化开发与测试。源码布局说明见 `src/README.md`。

代码和计分测试已完成；测试结果与部署核验记录在 [`docs/verification.md`](docs/verification.md)。公开提交时请同时提供源码链接、部署链接和上述 A–E 材料，并确保不公开管理员密码或参与者原始数据。


## 题目来源与复用依据

人格部分参考 Donnellan, Oswald, Baird & Lucas (2006), *The Mini-IPIP Scales: Tiny-Yet-Effective Measures of the Big Five Factors of Personality*, DOI: [10.1037/1040-3590.18.2.192](https://doi.org/10.1037/1040-3590.18.2.192)。[IPIP 官方许可说明](https://ipip.ori.org/newPermission.htm)确认 IPIP 题目和量表属于公有领域，可使用、修改和翻译。这不表示本项目中文翻译已经验证，也不表示论文全文属于公有领域。AI 态度题为项目自编题，每个子维度仅两题，结果仅作探索性描述。
