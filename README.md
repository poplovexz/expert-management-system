# 专家人员管理系统

一个基于 Next.js 14 的现代化专家人员信息管理与展示系统，支持用户认证、专家信息录入、批量导入和展示功能。

## 🚀 功能特性

### 核心功能
- **用户认证系统**: 支持邮箱注册/登录，JWT令牌认证
- **权限管理**: 普通用户（查看）和管理员（完整CRUD）权限
- **专家信息管理**: 完整的增删改查功能
- **照片管理**: 支持专家照片上传和展示
- **证书管理**: 支持多个证书的添加、编辑和文件上传
- **高级搜索**: 按姓名、专业领域、特长搜索
- **分页展示**: 优化的分页组件，每页10条记录
- **CSV批量导入**: 支持Excel导出的CSV文件批量导入，包含照片和证书信息
- **响应式设计**: 完美适配移动端和PC端

### 技术特性
- **现代化技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: SQLite + Prisma ORM
- **表单验证**: React Hook Form + Zod
- **文件处理**: Papaparse CSV解析
- **安全性**: 密码加密、JWT认证、XSS防护

## 🛠️ 技术栈

- **前端框架**: Next.js 14.x (App Router)
- **UI框架**: Tailwind CSS 4.x
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js
- **表单处理**: React Hook Form + Zod
- **CSV解析**: Papaparse
- **开发语言**: TypeScript

## 📦 安装和运行

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **环境配置**
```bash
# .env 文件已配置，包含以下变量：
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

3. **数据库初始化**
```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push

# 初始化示例数据
npm run db:seed
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 👤 默认账户

系统初始化后会创建以下默认账户：

**管理员账户**
- 邮箱: `admin@example.com`
- 密码: `admin123456`
- 权限: 管理员（完整功能）

## 📊 数据模型

### 用户表 (users)
- id: 主键
- email: 邮箱（唯一）
- password: 加密密码
- role: 角色（user/admin）
- createdAt/updatedAt: 时间戳

### 专家表 (experts)
- id: 主键
- name: 姓名（必填）
- field: 专业领域（必填，逗号分隔）
- specialty: 专家特长（必填，逗号分隔）
- organization: 工作单位
- contact: 联系方式
- education: 学历
- title: 职称
- researchDirection: 研究方向
- awards: 获奖经历
- achievements: 代表性成果
- bio: 个人简介（限500字）
- photoUrl: 照片URL
- createdAt/updatedAt: 时间戳

### 证书表 (certificates)
- id: 主键
- expertId: 关联专家ID
- name: 证书名称（必填）
- issuer: 颁发机构
- issueDate: 颁发日期
- expiryDate: 过期日期
- fileUrl: 证书文件URL
- description: 证书描述
- createdAt/updatedAt: 时间戳

## 📥 CSV导入格式

### 必填字段
- `name`: 姓名
- `field`: 专业领域（多个用逗号分隔）
- `specialty`: 专家特长（多个用逗号分隔）

### 可选字段
- `organization`: 工作单位
- `contact`: 联系方式
- `education`: 学历
- `title`: 职称
- `research_direction`: 研究方向
- `awards`: 获奖经历
- `achievements`: 代表性成果
- `bio`: 个人简介
- `photo_url`: 照片链接（完整URL）
- `certificates`: 证书信息（JSON格式）

### CSV示例
```csv
name,field,specialty,organization,contact,education,title,research_direction,awards,achievements,bio,photo_url,certificates
张三,"人工智能,机器学习","深度学习,NLP",XX大学,zhangsan@example.com,博士,教授,计算机视觉,"2023年某奖","论文:AI综述",AI领域专家,https://example.com/photo.jpg,"[{""name"":""高级工程师证书"",""issuer"":""工信部"",""issueDate"":""2023-01-01""}]"
```

### 证书JSON格式示例
```json
[
  {
    "name": "高级工程师证书",
    "issuer": "工信部",
    "issueDate": "2023-01-01",
    "expiryDate": "2028-01-01",
    "description": "高级软件工程师资格证书"
  },
  {
    "name": "项目管理证书",
    "issuer": "PMI",
    "issueDate": "2022-06-01"
  }
]
```

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库相关
npm run db:seed      # 初始化示例数据
npm run db:reset     # 重置数据库并初始化数据
npx prisma studio    # 打开数据库管理界面
```

## 🚀 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 传统服务器部署
1. 构建项目: `npm run build`
2. 上传构建文件到服务器
3. 配置环境变量
4. 启动服务: `npm start`

## 🔒 安全特性

- JWT 令牌认证
- 密码 bcrypt 加密存储
- XSS 攻击防护
- CSRF 保护
- 文件上传安全检查
- SQL 注入防护（Prisma ORM）

---

**专家人员管理系统** - 让专家信息管理更简单、更高效！
