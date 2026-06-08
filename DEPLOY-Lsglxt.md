# lsglxt.com 部署指南

## 部署流程概览

```
购买域名 → 推送到GitHub → 部署到Vercel → 绑定域名 → 完成HTTPS
```

---

## 第一步：购买域名 lsglxt.com

### 推荐平台

| 平台 | 价格 | 链接 |
|------|------|------|
| 阿里云 | ~¥69/年 | https://wanwang.aliyun.com |
| 腾讯云 | ~¥69/年 | https://dnspod.cloud.tencent.com |
| GoDaddy | ~$12/年 | https://www.godaddy.com |

### 购买步骤

1. 访问阿里云万网：https://wanwang.aliyun.com
2. 搜索 `lsglxt.com`
3. 如果显示"可注册"，加入购物车
4. 完成实名认证（需要身份证）
5. 支付购买

---

## 第二步：推送到 GitHub

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`snack-manager`
3. 选择 "Public"
4. 点击 "Create repository"

### 2. 推送代码

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/snack-manager.git

# 推送代码
git push -u origin main
```

---

## 第三步：部署到 Vercel

### 方式一：网页部署（推荐）

1. 访问 https://vercel.com
2. 点击 "Sign Up" → 选择 "Continue with GitHub"
3. 授权 Vercel 访问你的 GitHub 仓库
4. 点击 "Add New Project"
5. 选择 `snack-manager` 仓库
6. 点击 "Deploy"
7. 等待 1-2 分钟，部署完成

你会得到一个默认域名，如：`https://snack-manager-xxx.vercel.app`

### 方式二：命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd snack-manager
vercel --prod
```

---

## 第四步：绑定自定义域名 lsglxt.com

### 1. 在 Vercel 添加域名

1. 进入 Vercel 项目 Dashboard
2. 点击 "Settings" → "Domains"
3. 输入 `lsglxt.com`
4. 点击 "Add"

### 2. 配置 DNS 解析（阿里云示例）

1. 登录阿里云控制台
2. 进入 "域名" → 找到 `lsglxt.com`
3. 点击 "解析"
4. 添加以下记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 76.76.21.21 | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

> 注意：Vercel 会显示你需要的具体记录值，以 Vercel 显示的为准

### 3. 等待生效

- DNS 生效通常需要 5-30 分钟
- Vercel 会自动申请 HTTPS 证书
- 完成后访问 https://lsglxt.com

---

## 第五步：验证部署

访问以下链接检查：

- ✅ https://lsglxt.com - 主域名
- ✅ https://www.lsglxt.com - www子域名
- ✅ 浏览器显示 🔒 安全锁标志

---

## 常见问题

### Q: 域名已被注册怎么办？
A: 尝试其他后缀：
- lsglxt.cn（中国域名）
- lsglxt.net
- lsglxt.app

### Q: 如何更新网站内容？
```bash
git add .
git commit -m "更新内容"
git push
# Vercel 会自动重新部署
```

### Q: 如何配置 API Key？
1. 进入 Vercel 项目 Settings → Environment Variables
2. 添加变量名和值
3. 重新部署

---

## 升级路线图

```
现在：Vercel 免费托管 + lsglxt.com 域名
  ↓
未来：阿里云服务器（数据持久化、多人协作）
  ↓
最终：本地 NAS/树莓派（完全自主控制）
```
