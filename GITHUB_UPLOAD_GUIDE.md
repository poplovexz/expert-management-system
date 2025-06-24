# GitHub上传指南

## 步骤1：在GitHub上创建新仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `expert-management-system`
   - Description: `专家管理系统 - Next.js + Prisma + NextAuth`
   - 选择 Public 或 Private
   - **不要**勾选 "Add a README file"
   - **不要**勾选 "Add .gitignore"
   - **不要**勾选 "Choose a license"
4. 点击 "Create repository"

## 步骤2：运行上传脚本

在项目目录中双击运行 `upload-to-github.bat` 文件，或者在命令行中执行：

```cmd
upload-to-github.bat
```

## 步骤3：手动执行Git命令

如果批处理脚本有问题，可以手动执行以下命令：

```cmd
# 打开命令提示符，切换到项目目录
cd /d "d:\zhuanjia\expert-management-system"

# 设置Git路径
set PATH=%PATH%;"C:\Program Files\Git\bin"

# 初始化Git仓库
git init

# 配置用户信息
git config user.name "poplovexz"
git config user.email "129678290+poplovexz@users.noreply.github.com"

# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交：专家管理系统"

# 添加远程仓库（替换为您的实际仓库URL）
git remote add origin https://github.com/poplovexz/expert-management-system.git

# 设置主分支
git branch -M main

# 推送到GitHub
git push -u origin main
```

## 步骤4：验证上传

1. 刷新GitHub仓库页面
2. 确认所有文件都已上传
3. 检查README.md是否正确显示

## 注意事项

- 确保您已登录GitHub账户
- 如果推送时要求身份验证，使用GitHub Personal Access Token
- 敏感文件（如.env文件）已被.gitignore排除

## 创建Personal Access Token（如果需要）

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 点击 "Generate new token"
3. 选择适当的权限（至少需要repo权限）
4. 复制生成的token
5. 在Git推送时使用token作为密码

## 项目结构

上传后的项目将包含：
- `/src` - 源代码
- `/prisma` - 数据库模式和种子数据
- `/public` - 静态资源
- `package.json` - 项目依赖
- `README.md` - 项目说明
- 部署相关文件

## 后续部署

上传到GitHub后，您可以：
1. 在服务器上克隆仓库
2. 使用GitHub Actions进行自动部署
3. 连接到Vercel等平台进行部署
