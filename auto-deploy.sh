#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 错误处理
handle_error() {
    log_error "部署过程中发生错误，请检查上面的错误信息"
    log_info "您可以手动执行失败的步骤，或联系技术支持"
    exit 1
}

trap handle_error ERR

echo "================================================================"
echo "           腾讯云专家管理系统自动部署脚本 v2.0"
echo "================================================================"
echo "GitHub仓库: https://github.com/poplovexz/expert-management-system"
echo "部署目标: http://43.134.166.112:3000"
echo "================================================================"

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    log_warning "检测到root用户，建议使用普通用户运行此脚本"
    log_info "继续使用root用户部署..."
fi

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me || echo "43.134.166.112")
log_info "检测到服务器IP: $SERVER_IP"

# 1. 更新系统
log_info "1. 更新系统包..."
sudo apt update
sudo apt upgrade -y
log_success "系统更新完成"

# 2. 安装Node.js
log_info "2. 检查并安装Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_info "Node.js已安装: $NODE_VERSION"
else
    log_info "安装Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js安装完成"
fi

# 3. 安装Git
log_info "3. 检查并安装Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_info "Git已安装: $GIT_VERSION"
else
    sudo apt install -y git
    log_success "Git安装完成"
fi

# 4. 安装其他必要工具
log_info "4. 安装必要工具..."
sudo apt install -y curl wget unzip build-essential
log_success "必要工具安装完成"

# 5. 验证安装
log_info "5. 验证环境..."
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Git: $(git --version)"

# 6. 克隆项目
log_info "6. 克隆项目代码..."
cd ~
if [ -d "expert-management-system" ]; then
    log_warning "项目目录已存在，正在备份..."
    mv expert-management-system expert-management-system.backup.$(date +%Y%m%d_%H%M%S)
fi

git clone https://github.com/poplovexz/expert-management-system.git
cd expert-management-system
log_success "项目克隆完成"

# 7. 安装项目依赖
log_info "7. 安装项目依赖..."
npm install --production
log_success "依赖安装完成"

# 8. 构建项目
log_info "8. 构建项目..."
npm run build
log_success "项目构建完成"

# 9. 配置环境变量
log_info "9. 配置生产环境..."
SECRET_KEY=$(openssl rand -base64 32)
cat > .env.production << EOF
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_URL="http://43.134.166.112:3000"
NEXTAUTH_SECRET="$SECRET_KEY"
NODE_ENV="production"
EOF

# 复制环境文件
cp .env.production .env
log_success "环境配置完成"

# 10. 初始化数据库
log_info "10. 初始化数据库..."
npx prisma db push --force-reset
npx prisma db seed
log_success "数据库初始化完成"

# 11. 安装PM2
log_info "11. 安装PM2进程管理器..."
if command -v pm2 &> /dev/null; then
    log_info "PM2已安装"
else
    sudo npm install -g pm2
    log_success "PM2安装完成"
fi

# 12. 启动应用
log_info "12. 启动应用服务..."
pm2 stop expert-system 2>/dev/null || true
pm2 delete expert-system 2>/dev/null || true

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'expert-system',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/expert-management-system',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
log_success "应用启动完成"

# 13. 配置防火墙
log_info "13. 配置防火墙..."
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
log_success "防火墙配置完成"

# 14. 创建管理脚本
log_info "14. 创建管理脚本..."
cat > ~/manage-expert-system.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        pm2 start expert-system
        ;;
    stop)
        pm2 stop expert-system
        ;;
    restart)
        pm2 restart expert-system
        ;;
    status)
        pm2 status expert-system
        ;;
    logs)
        pm2 logs expert-system
        ;;
    update)
        cd ~/expert-management-system
        git pull origin main
        npm install --production
        npm run build
        pm2 restart expert-system
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|update}"
        exit 1
        ;;
esac
EOF

chmod +x ~/manage-expert-system.sh
log_success "管理脚本创建完成"

echo "================================================================"
log_success "🎉 部署完成！"
echo "================================================================"
echo ""
echo "📱 访问地址: http://43.134.166.112:3000"
echo ""
echo "🔧 管理命令:"
echo "  启动应用: ~/manage-expert-system.sh start"
echo "  停止应用: ~/manage-expert-system.sh stop"
echo "  重启应用: ~/manage-expert-system.sh restart"
echo "  查看状态: ~/manage-expert-system.sh status"
echo "  查看日志: ~/manage-expert-system.sh logs"
echo "  更新应用: ~/manage-expert-system.sh update"
echo ""
echo "📊 PM2命令:"
echo "  pm2 status     - 查看所有进程状态"
echo "  pm2 logs       - 查看所有日志"
echo "  pm2 monit      - 监控面板"
echo ""
echo "🔍 故障排除:"
echo "  如果无法访问，请检查腾讯云安全组是否开放3000端口"
echo "  查看应用日志: pm2 logs expert-system"
echo ""
log_success "请在浏览器中访问 http://43.134.166.112:3000 测试应用"
