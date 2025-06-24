# 专家管理系统部署脚本
# 使用方法: .\deploy.ps1

param(
    [string]$ServerIP = "43.134.166.112",
    [string]$KeyPath = "d:\sss.pem",
    [string]$Username = "ubuntu"
)

Write-Host "开始部署专家管理系统..." -ForegroundColor Green

# 1. 创建部署包
Write-Host "正在创建部署包..." -ForegroundColor Yellow
$deployDir = "deploy-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# 复制必要文件
Copy-Item ".next" -Destination "$deployDir\.next" -Recurse
Copy-Item "public" -Destination "$deployDir\public" -Recurse
Copy-Item "prisma" -Destination "$deployDir\prisma" -Recurse
Copy-Item "package.json" -Destination "$deployDir\package.json"
Copy-Item "package-lock.json" -Destination "$deployDir\package-lock.json"
Copy-Item "next.config.ts" -Destination "$deployDir\next.config.ts"

# 创建生产环境配置
@"
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_URL="http://$ServerIP:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
"@ | Out-File -FilePath "$deployDir\.env.production" -Encoding UTF8

Write-Host "部署包创建完成！" -ForegroundColor Green

# 2. 压缩部署包
Write-Host "正在压缩部署包..." -ForegroundColor Yellow
if (Test-Path "expert-system-deploy.zip") {
    Remove-Item "expert-system-deploy.zip"
}
Compress-Archive -Path "$deployDir\*" -DestinationPath "expert-system-deploy.zip"

Write-Host "压缩完成！文件: expert-system-deploy.zip" -ForegroundColor Green

# 3. 尝试上传到服务器
Write-Host "正在尝试上传到服务器..." -ForegroundColor Yellow

try {
    # 使用SCP上传文件
    scp -i $KeyPath -o StrictHostKeyChecking=no expert-system-deploy.zip ${Username}@${ServerIP}:~/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "文件上传成功！" -ForegroundColor Green
        
        # 连接服务器并部署
        Write-Host "正在服务器上部署..." -ForegroundColor Yellow
        
        $deployCommands = @"
cd ~
unzip -o expert-system-deploy.zip
sudo apt update
sudo apt install -y nodejs npm
npm install --production
sudo npm install -g pm2
pm2 stop expert-system 2>/dev/null || true
pm2 delete expert-system 2>/dev/null || true
pm2 start npm --name expert-system -- start
pm2 save
pm2 startup
echo "部署完成！访问地址: http://$ServerIP:3000"
"@
        
        $deployCommands | ssh -i $KeyPath ${Username}@${ServerIP}
        
    } else {
        Write-Host "文件上传失败！" -ForegroundColor Red
        Write-Host "请检查网络连接和服务器配置" -ForegroundColor Yellow
    }
} catch {
    Write-Host "部署过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "部署脚本执行完成！" -ForegroundColor Green
