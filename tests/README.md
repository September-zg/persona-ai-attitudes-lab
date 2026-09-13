# 自动化测试

```bash
python3 -m unittest discover -s tests
python3 scoring_examples.py
node --test tests/test_analysis.cjs
```

Python 测试使用临时文件和仅绑定127.0.0.1的临时端口；不会写公网数据。覆盖26题方向、边界、非法回答、服务端重算、GET/HEAD私有路径阻止、密码、重复重试、旧反馈兼容及备份只追加恢复。

Node测试核对前端题目键与Python一致，验证分布边界、合成数据排除、已知α/相关结果及旧反馈缺失指标。

浏览器回归脚本 `browser-smoke.cjs` 需要开发环境安装 Playwright 和浏览器。运行 `node tests/browser-smoke.cjs`；若使用已安装Chrome可设置 `BROWSER_CHANNEL=chrome`。脚本创建独立浏览器和临时数据服务器，检查同意、漏答、返回修改、保存失败重试、结果图、反馈、权限和390px窄屏。截图位于本机 outputs，不是参与者试点证据。

最新实际执行结果见 [验证记录](../docs/verification.md)。
