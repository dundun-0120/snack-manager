# 部署到 Vercel 指南

## 快速部署步骤

### 1. 准备 GitHub 仓库

```bash
# 在 GitHub 创建新仓库，然后推送代码
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/snack-manager.git
git push -u origin main
```

### 2. 部署到 Vercel

**方式一：Vercel 官网（推荐）**

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择 `snack-manager` 仓库
5. 点击 "Deploy"
6. 等待部署完成，获得 HTTPS 链接

**方式二：Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd snack-manager
vercel

# 按提示操作，完成后会显示 HTTPS 链接
```

### 3. 绑定自定义域名（可选）

1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的域名（如 `snack.yourdomain.com`）
3. 按提示添加 DNS 记录
4. 自动获得 HTTPS 证书

### 4. 配置环境变量（可选）

如果使用了 API Key，在 Vercel 设置中添加：

```
VITE_API_KEY=你的API密钥
```

## 注意事项

1. **数据存储**：Vercel 是无服务器架构，数据存储在浏览器 localStorage 中
2. **多设备同步**：使用"分享链接"功能在不同设备间同步数据
3. **升级方案**：以后可以迁移到云服务器，数据通过导出/导入迁移

## 升级路线图

```
现在：Vercel 免费托管（适合个人使用）
  ↓
未来：阿里云/腾讯云服务器（适合多人使用）
  ↓
最终：本地 NAS/树莓派（完全自主控制）
```
