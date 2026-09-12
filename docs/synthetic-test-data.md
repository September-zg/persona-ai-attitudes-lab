# 合成验证数据

`data/synthetic_responses_10.json` 和 `test-fixtures/synthetic_responses_10.json` 各包含 10 条明确标记的合成回答，只用于本地验证。它们不是真实参与者，不能写入试点评估结果。

## 预期结果

合成回答经过设计，使反向计分后的题目值形成可预测模式。因此可以用来检查：

- 每个维度的平均分；
- 每个题组的 Cronbach α；
- 人格维度与 AI 态度维度的 Pearson 相关；
- 每道题 1–5 分的回答分布。

正式试点前必须移除运行时 `data.json` 中的合成记录。合成文件可以保留在仓库中作为可复现的测试证据，但必须保持 `syntheticTest: true` 标记。
