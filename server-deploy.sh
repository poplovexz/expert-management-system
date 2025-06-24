#!/bin/bash

# 专家管理系统服务器部署脚本
# 在Ubuntu服务器上运行此脚本

echo "开始部署专家管理系统..."

# 更新系统
sudo apt update

# 安装Node.js和npm
echo "安装Node.js和npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 检查Node.js版本
node --version
npm --version

# 如果项目文件已上传，解压并部署
if [ -f "expert-system-deploy.zip" ]; then
    echo "发现部署包，开始解压..."
    unzip -o expert-system-deploy.zip
    
    # 安装生产依赖
    echo "安装依赖..."
    npm install --production
    
    # 初始化数据库
    echo "初始化数据库..."
    npx prisma db push
    npx prisma db seed
    
    # 安装PM2
    echo "安装PM2..."
    sudo npm install -g pm2
    
    # 停止现有服务
    pm2 stop expert-system 2>/dev/null || true
    pm2 delete expert-system 2>/dev/null || true
    
    # 启动服务
    echo "启动服务..."
    pm2 start npm --name expert-system -- start
    pm2 save
    pm2 startup
    
    # 配置防火墙
    echo "配置防火墙..."
    sudo ufw allow 3000
    sudo ufw --force enable
    
    echo "部署完成！"
    echo "访问地址: http://$(curl -s ifconfig.me):3000"
    
else
    echo "未找到部署包 expert-system-deploy.zip"
    echo "请先上传部署包到服务器"
fi
