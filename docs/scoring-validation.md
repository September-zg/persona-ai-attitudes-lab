# 计分验证记录

## 冻结规则

- 量尺范围为 1–5。
- 反向题使用 `6 - response`。
- 每个维度使用其题目的算术平均值。
- 缺失回答不能当作 0；当前前端在提交前阻止缺失回答。

## 独立检查

运行：

```bash
python3 scoring_examples.py
```

该脚本独立检查反向映射 `[1,2,3,4,5] → [5,4,3,2,1]`、平均值计算、混合正向/反向题以及边界范围。它不伪装成浏览器端自动化测试；浏览器端测试仍需在具备相应运行环境后完成。


## 服务端计分

`server.py` imports `scoring.py`, validates every answer as an integer from 1 to 5, and recomputes all dimension scores. Any client-provided `scores` field is ignored, so the stored score cannot be changed by editing the browser request.
