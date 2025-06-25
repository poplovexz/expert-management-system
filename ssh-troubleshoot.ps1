# SSH连接故障排除脚本

param(
    [string]$ServerIP = "43.134.166.112",
    [string]$KeyPath = "d:\sss.pem",
    [string]$Username = "ubuntu"
)

Write-Host "=== SSH连接故障排除 ===" -ForegroundColor Cyan

# 1. 检查密钥文件
Write-Host "1. 检查SSH密钥文件..." -ForegroundColor Yellow
if (Test-Path $KeyPath) {
    Write-Host "✓ 密钥文件存在: $KeyPath" -ForegroundColor Green
    
    # 检查文件大小
    $fileSize = (Get-Item $KeyPath).Length
    Write-Host "  文件大小: $fileSize 字节" -ForegroundColor White
    
    # 显示文件前几行
    Write-Host "  文件内容预览:" -ForegroundColor White
    Get-Content $KeyPath -Head 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "✗ 密钥文件不存在: $KeyPath" -ForegroundColor Red
    Write-Host "请确认密钥文件路径是否正确" -ForegroundColor Yellow
    exit 1
}

# 2. 测试网络连通性
Write-Host "`n2. 测试网络连通性..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $ServerIP -Count 2 -Quiet -ErrorAction SilentlyContinue
if ($pingResult) {
    Write-Host "✓ 服务器网络可达" -ForegroundColor Green
} else {
    Write-Host "✗ 服务器网络不可达" -ForegroundColor Red
}

# 3. 测试SSH端口
Write-Host "`n3. 测试SSH端口(22)..." -ForegroundColor Yellow
$tcpTest = Test-NetConnection -ComputerName $ServerIP -Port 22 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
if ($tcpTest -and $tcpTest.TcpTestSucceeded) {
    Write-Host "✓ SSH端口(22)开放" -ForegroundColor Green
} else {
    Write-Host "✗ SSH端口(22)无法连接" -ForegroundColor Red
    Write-Host "  可能原因:" -ForegroundColor Yellow
    Write-Host "  - 腾讯云安全组未开放22端口" -ForegroundColor White
    Write-Host "  - 服务器防火墙阻止连接" -ForegroundColor White
    Write-Host "  - SSH服务未启动" -ForegroundColor White
}

# 4. 尝试SSH连接
Write-Host "`n4. 尝试SSH连接..." -ForegroundColor Yellow
Write-Host "执行命令: ssh -i `"$KeyPath`" -o ConnectTimeout=10 -o StrictHostKeyChecking=no $Username@$ServerIP" -ForegroundColor Gray

$sshResult = & ssh -i $KeyPath -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$Username@$ServerIP" "echo 'SSH连接成功'; exit" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSH连接成功" -ForegroundColor Green
} else {
    Write-Host "✗ SSH连接失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "错误信息: $sshResult" -ForegroundColor Gray
}

# 5. 提供解决方案
Write-Host "`n=== 解决方案建议 ===" -ForegroundColor Cyan

Write-Host "`n方案1: 检查腾讯云安全组配置" -ForegroundColor Yellow
Write-Host "1. 登录腾讯云控制台: https://console.cloud.tencent.com/cvm" -ForegroundColor White
Write-Host "2. 进入云服务器 > 安全组" -ForegroundColor White
Write-Host "3. 确保入站规则包含:" -ForegroundColor White
Write-Host "   - 协议: TCP, 端口: 22, 来源: 0.0.0.0/0" -ForegroundColor Gray
Write-Host "   - 协议: TCP, 端口: 3000, 来源: 0.0.0.0/0" -ForegroundColor Gray

Write-Host "`n方案2: 使用腾讯云VNC控制台" -ForegroundColor Yellow
Write-Host "1. 在腾讯云控制台找到您的服务器实例" -ForegroundColor White
Write-Host "2. 点击'登录'按钮" -ForegroundColor White
Write-Host "3. 选择'VNC登录'" -ForegroundColor White
Write-Host "4. 直接在浏览器中操作服务器" -ForegroundColor White

Write-Host "`n方案3: 重启服务器" -ForegroundColor Yellow
Write-Host "1. 在腾讯云控制台重启服务器" -ForegroundColor White
Write-Host "2. 等待服务器完全启动后重试连接" -ForegroundColor White

Write-Host "`n方案4: 检查SSH密钥格式" -ForegroundColor Yellow
Write-Host "1. 确认下载的是正确的.pem文件" -ForegroundColor White
Write-Host "2. 文件应该以'-----BEGIN RSA PRIVATE KEY-----'开头" -ForegroundColor White
Write-Host "3. 如果是.ppk格式，需要转换为.pem格式" -ForegroundColor White

Write-Host "`n推荐操作顺序:" -ForegroundColor Green
Write-Host "1. 首先使用VNC控制台连接服务器" -ForegroundColor White
Write-Host "2. 在VNC中运行部署脚本" -ForegroundColor White
Write-Host "3. 部署完成后再解决SSH问题" -ForegroundColor White

Write-Host "`n按任意键退出..." -ForegroundColor Gray
Read-Host
