# 专家管理系统GitHub上传脚本

Write-Host "正在上传专家管理系统到GitHub..." -ForegroundColor Green

# 设置Git路径
$gitPath = "C:\Program Files\Git\bin\git.exe"

# 检查Git是否存在
if (-not (Test-Path $gitPath)) {
    Write-Host "Git未找到，请确保Git已正确安装" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

try {
    # 初始化Git仓库
    Write-Host "初始化Git仓库..." -ForegroundColor Yellow
    & $gitPath init
    
    # 配置Git用户信息
    Write-Host "配置Git用户信息..." -ForegroundColor Yellow
    & $gitPath config user.name "poplovexz"
    & $gitPath config user.email "129678290+poplovexz@users.noreply.github.com"
    
    # 添加所有文件
    Write-Host "添加文件到Git..." -ForegroundColor Yellow
    & $gitPath add .
    
    # 提交更改
    Write-Host "提交更改..." -ForegroundColor Yellow
    & $gitPath commit -m "初始提交：专家管理系统"
    
    Write-Host ""
    Write-Host "Git仓库初始化完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "接下来请按照以下步骤操作：" -ForegroundColor Cyan
    Write-Host "1. 在GitHub上创建新仓库 'expert-management-system'" -ForegroundColor White
    Write-Host "2. 复制仓库URL" -ForegroundColor White
    Write-Host "3. 运行以下命令：" -ForegroundColor White
    Write-Host ""
    Write-Host "`"$gitPath`" remote add origin https://github.com/poplovexz/expert-management-system.git" -ForegroundColor Yellow
    Write-Host "`"$gitPath`" branch -M main" -ForegroundColor Yellow
    Write-Host "`"$gitPath`" push -u origin main" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "发生错误: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "按任意键退出"
