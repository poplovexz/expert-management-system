@echo off
echo 正在上传专家管理系统到GitHub...

REM 设置Git路径
set GIT_PATH="C:\Program Files\Git\bin\git.exe"

REM 检查Git是否存在
if not exist %GIT_PATH% (
    echo Git未找到，请确保Git已正确安装
    pause
    exit /b 1
)

REM 初始化Git仓库
echo 初始化Git仓库...
%GIT_PATH% init

REM 配置Git用户信息（如果需要）
echo 配置Git用户信息...
%GIT_PATH% config user.name "poplovexz"
%GIT_PATH% config user.email "129678290+poplovexz@users.noreply.github.com"

REM 添加所有文件
echo 添加文件到Git...
%GIT_PATH% add .

REM 提交更改
echo 提交更改...
%GIT_PATH% commit -m "初始提交：专家管理系统"

REM 添加远程仓库（需要用户手动创建GitHub仓库后替换URL）
echo.
echo 请在GitHub上创建一个新的仓库，然后运行以下命令：
echo.
echo %GIT_PATH% remote add origin https://github.com/poplovexz/expert-management-system.git
echo %GIT_PATH% branch -M main
echo %GIT_PATH% push -u origin main
echo.

pause
