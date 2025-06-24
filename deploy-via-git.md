# Git部署方案

## 步骤1：推送代码到GitHub

```bash
# 在本地项目目录执行
git add .
git commit -m "准备部署"
git push origin main
```

## 步骤2：在服务器上克隆项目

如果能通过其他方式连接到服务器（如VNC），执行：

```bash
# 在服务器上执行
cd ~
git clone https://github.com/你的用户名/expert-management-system.git
cd expert-management-system

# 安装依赖
sudo apt update
sudo apt install -y nodejs npm
npm install

# 构建项目
npm run build

# 设置环境变量
cp .env.production .env

# 安装PM2
sudo npm install -g pm2

# 启动应用
pm2 start npm --name expert-system -- start
pm2 save
pm2 startup
```

## 步骤3：配置防火墙

```bash
# 开放3000端口
sudo ufw allow 3000
sudo ufw enable
```

访问地址：http://43.134.166.112:3000
