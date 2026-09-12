# 部署步骤

## 当前阶段：准备

服务器已经支持云平台注入的 `PORT` 环境变量，并默认只在本机使用 `127.0.0.1:8000`。公开部署时必须配置随机的 `ADMIN_TOKEN`，让研究者汇总 API 需要令牌；`.gitignore` 会排除本地 `data.json`，避免把开发测试记录上传到代码仓库。

## 推荐流程

1. 在 GitHub 创建一个新的私有或公开仓库。
2. 在项目目录执行 `git init`、`git add`、`git commit` 和 `git push`，把源代码上传。
3. 在 Render 创建 Web Service，连接该 GitHub 仓库。
4. 使用 Python runtime，启动命令填写 `python3 server.py`。
5. 部署完成后，用 Render 提供的 `https://...onrender.com` 地址测试首页、提交、反馈和汇总 API。
6. 确认公开网址正常后，再邀请真实参与者。

## 需要项目负责人亲自完成

- 创建 GitHub 和 Render 账户并接受其服务条款。
- 决定仓库公开或私有。
- 保存部署平台提供的 URL。
- 不要上传 `data.json`、密码、API 密钥或真实参与者原始数据。
- 部署后检查数据保留、休眠策略和费用限制。
