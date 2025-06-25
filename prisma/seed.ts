import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员用户
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123456'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '系统管理员',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('管理员用户创建成功:')
    console.log('邮箱:', adminEmail)
    console.log('密码:', adminPassword)
    console.log('用户ID:', admin.id)
  } else {
    console.log('管理员用户已存在')
  }

  // 创建示例专家数据
  const sampleExperts = [
    {
      name: '张三',
      field: '人工智能,机器学习',
      specialty: '深度学习,自然语言处理',
      organization: 'XX大学计算机学院',
      contact: 'zhangsan@example.com',
      education: '博士',
      title: '教授',
      researchDirection: '计算机视觉与模式识别',
      awards: '2023年国家科技进步奖二等奖\n2022年省级科技创新奖',
      achievements: '发表SCI论文50余篇\n主持国家自然科学基金项目3项',
      bio: '张三教授是人工智能领域的知名专家，在深度学习和计算机视觉方面有着丰富的研究经验。主要研究方向包括图像识别、自然语言处理等。'
    },
    {
      name: '李四',
      field: '数据科学,统计学',
      specialty: '数据挖掘,预测分析',
      organization: 'YY研究院',
      contact: 'lisi@example.com',
      education: '博士',
      title: '研究员',
      researchDirection: '大数据分析与应用',
      awards: '2022年优秀青年科学家奖',
      achievements: '出版专著《数据科学导论》\n开发多个数据分析平台',
      bio: '李四博士专注于数据科学研究，在大数据处理和分析方面有着深厚的理论基础和丰富的实践经验。'
    },
    {
      name: '王五',
      field: '网络安全,信息安全',
      specialty: '密码学,安全协议',
      organization: 'ZZ科技公司',
      contact: 'wangwu@example.com',
      education: '硕士',
      title: '高级工程师',
      researchDirection: '网络安全防护技术',
      awards: '2021年网络安全技术创新奖',
      achievements: '获得发明专利10余项\n参与制定行业安全标准3项',
      bio: '王五工程师在网络安全领域有着丰富的实战经验，专注于企业级安全解决方案的设计与实施。'
    }
  ]

  for (const expertData of sampleExperts) {
    const existingExpert = await prisma.expert.findFirst({
      where: { name: expertData.name }
    })

    if (!existingExpert) {
      await prisma.expert.create({
        data: expertData
      })
      console.log(`创建示例专家: ${expertData.name}`)
    }
  }

  console.log('数据库初始化完成')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
