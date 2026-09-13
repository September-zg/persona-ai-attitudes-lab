# 验证记录



核验日期：2026-09-13。每项结果只代表这里列出的条件与案例。

## 本地实现与测试

| 检查 | 命令 / 方法 | 已观察结果 |
|---|---|---|
| Python 计分、权限与 HTTP 行为 | `python3 -m unittest discover -s tests` | 24 项通过 |
| 固定计分示例 | `python3 scoring_examples.py` | `scoring specification checks passed` |
| 跨语言计分与统计 | `node --test tests/test_analysis.cjs` | 5 项通过 |
| 浏览器交互 | `BROWSER_CHANNEL=chrome node tests/browser-smoke.cjs`，使用本机 Playwright | 同意、漏答、返回修改、保存失败重试、结果图、反馈、研究者权限及手机宽度检查通过 |
| 真实试点分数复核 | 导出后逐份调用 `scoring.compute_scores`，与原存储分数比较 | 11 份全部一致，0 份分数差异 |
| 试点证据生成 | `node tools/analyze-export.cjs 私有备份.json docs/evidence/pilot-summary.json` | 11 份有效回答、7 条反馈、0 条合成记录 |

测试运行于 macOS，Python 3.14、Node.js 与本机 Chrome。HTTP 和浏览器测试使用独立临时数据文件，未向公网试点插入测试答卷。浏览器测试覆盖 1100 像素桌面与 390 像素窄屏，并检查页面无横向溢出；这不等于已在所有手机及浏览器上测试。

第一次浏览器启动发现抽取题目脚本后的全局变量冲突，修复后重新通过。测试自动生成的界面截图位于本机 `outputs/local-test-*.png`；它们是测试记录，不是参与者试点证据。

原始试点备份 SHA-256：`16548c32535c5ba0bbe97dd25cf0f3670b9b7423bf438c2d5796889f89bda17f`。原始文件、研究者密码和逐人答案均不发布到仓库。

## 公网发布

本节在发布后根据实际核验追加；此提交中的本地测试通过，不代替 Render 发布成功。当前线上已部署恢复后的旧版 UI。`/api/import` 已通过管理员令牌验证并成功导入备份；导入后服务器实时汇总包含原有试点数据及后续测试记录。正式试点证据仍以 `docs/evidence/pilot-summary.json` 的 11/7 快照为准。

## 仍未验证

- 新版图表、解释和五项反馈尚未由原 11 位参与者重新评估。
- Windows 启动说明尚未在 Windows 机器实测。
- Render 免费实例 JSON 文件不保证长期持久性；本次备份与恢复不能替代数据库。
- 计分正确不代表题目或中文翻译的信效度已得到验证。


## 本次文档核验

确认 GitHub 已补充匿名汇总 JSON 和本验证文件；恢复 UI 的入口为单一 app.js。本次没有重新执行历史版本的全部自动化测试，历史通过数量不作为当前部署的通过声明。线上曾核对到 12 条提交、8 条反馈，固定试点快照为 11/7。后续部署可能影响非持久 JSON 数据，必须在部署结束后另行核对和恢复备份。
