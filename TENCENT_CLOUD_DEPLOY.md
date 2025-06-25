# 腾讯云部署指南

## 前置条件检查

### 1. 腾讯云服务器状态检查
- 登录腾讯云控制台：https://console.cloud.tencent.com/cvm
- 确认服务器状态为"运行中"
- 记录服务器公网IP：43.134.166.112

### 2. 安全组配置
在腾讯云控制台 > 云服务器 > 安全组中配置：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH连接 |
| TCP | 3000 | 0.0.0.0/0 | Next.js应用 |
| TCP | 80 | 0.0.0.0/0 | HTTP访问 |
| TCP | 443 | 0.0.0.0/0 | HTTPS访问 |

### 3. SSH连接测试
```bash
# 测试SSH连接
ssh -i "d:\sss.pem" ubuntu@43.134.166.112

# 如果连接失败，尝试：
# 1. 检查密钥文件权限
# 2. 使用腾讯云VNC控制台
# 3. 重启服务器
```

## 部署方案

### 方案A：使用腾讯云VNC控制台（推荐）
1. 在腾讯云控制台点击"登录"
2. 选择"VNC登录"
3. 直接在浏览器中操作服务器

### 方案B：修复SSH连接
1. 检查安全组22端口是否开放
2. 确认SSH服务是否启动
3. 验证密钥文件格式

## 自动部署脚本

将以下脚本保存为 `auto-deploy.sh` 并在服务器上运行：

```bash
#!/bin/bash
set -e

echo "=== 腾讯云专家管理系统自动部署脚本 ==="

# 更新系统
echo "1. 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18.x
echo "2. 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Git
echo "3. 安装Git..."
sudo apt install -y git

# 验证安装
echo "4. 验证安装..."
node --version
npm --version
git --version

# 克隆项目
echo "5. 克隆项目..."
cd ~
if [ -d "expert-management-system" ]; then
    rm -rf expert-management-system
fi
git clone https://github.com/poplovexz/expert-management-system.git
cd expert-management-system

# 安装依赖
echo "6. 安装项目依赖..."
npm install

# 构建项目
echo "7. 构建项目..."
npm run build

# 配置环境变量
echo "8. 配置环境变量..."
cat > .env.production << EOF
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_URL="http://43.134.166.112:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF

# 初始化数据库
echo "9. 初始化数据库..."
npx prisma db push
npx prisma db seed

# 安装PM2
echo "10. 安装PM2..."
sudo npm install -g pm2

# 启动应用
echo "11. 启动应用..."
pm2 stop expert-system 2>/dev/null || true
pm2 delete expert-system 2>/dev/null || true
pm2 start npm --name expert-system -- start
pm2 save
pm2 startup

# 配置防火墙
echo "12. 配置防火墙..."
sudo ufw allow 3000
sudo ufw allow 22
sudo ufw --force enable

echo "=== 部署完成！==="
echo "访问地址: http://43.134.166.112:3000"
echo "管理命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs expert-system"
echo "  重启应用: pm2 restart expert-system"
```

## 手动部署步骤

如果自动脚本失败，可以手动执行：

### 1. 连接服务器
```bash
# 使用VNC控制台或SSH
ssh -i "d:\sss.pem" ubuntu@43.134.166.112
```

### 2. 安装环境
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Git
sudo apt install -y git
```

### 3. 克隆和部署
```bash
# 克隆项目
git clone https://github.com/poplovexz/expert-management-system.git
cd expert-management-system

# 安装依赖
npm install

# 构建项目
npm run build

# 配置环境
cp .env.production .env

# 初始化数据库
npx prisma db push
npx prisma db seed

# 安装和启动PM2
sudo npm install -g pm2
pm2 start npm --name expert-system -- start
pm2 save
pm2 startup
```

## 故障排除

### SSH连接问题
1. 检查安全组22端口
2. 确认服务器状态
3. 验证密钥文件
4. 使用VNC控制台

### 应用启动问题
```bash
# 查看PM2状态
pm2 status

# 查看应用日志
pm2 logs expert-system

# 重启应用
pm2 restart expert-system
```

### 端口访问问题
1. 检查安全组3000端口
2. 确认防火墙设置
3. 验证应用是否正常启动

## 访问应用

部署成功后，访问：
- 应用地址：http://43.134.166.112:3000
- 默认管理员账户需要通过注册页面创建
