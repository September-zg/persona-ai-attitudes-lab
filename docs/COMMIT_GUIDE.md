# GitHub 提交指南

课程通知中的截止时间是 **2026-09-13 23:59**。项目负责人需要创建 GitHub 仓库、检查文件，并将仓库链接私信发送给老师。

## 提交前检查

1. 运行 `python3 scoring_examples.py` 和全部测试。
2. 确认 `data.json` 没有被加入提交；它已被 `.gitignore` 排除。
3. 正式试点前清除合成验证记录。
4. 只填写已经验证的 GitHub 地址和公网网站地址。
5. 检查没有密码、API 密钥、参与者身份或真实原始数据。

## 推荐命令

```bash
git init
git add .
git status
git commit -m "build: submit assessment platform"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

仓库负责人需要自行完成 GitHub 登录和权限确认。公开部署时，还要在部署平台设置随机的 `ADMIN_TOKEN`，不能把令牌写进仓库。

## 提交链接

- 公网测评网站：创建并验证后填写；
- GitHub 源码仓库：创建并推送后填写。
