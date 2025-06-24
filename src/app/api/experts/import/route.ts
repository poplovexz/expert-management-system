import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import Papa from 'papaparse'

const expertSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  field: z.string().min(1, '专业领域不能为空'),
  specialty: z.string().min(1, '专家特长不能为空'),
  organization: z.string().optional(),
  contact: z.string().optional(),
  education: z.string().optional(),
  title: z.string().optional(),
  research_direction: z.string().optional(),
  awards: z.string().optional(),
  achievements: z.string().optional(),
  bio: z.string().max(500, '个人简介不能超过500字').optional(),
  photo_url: z.string().optional(),
  certificates: z.string().optional() // JSON字符串格式的证书数据
})

interface CSVRow {
  name: string
  field: string
  specialty: string
  organization?: string
  contact?: string
  education?: string
  title?: string
  research_direction?: string
  awards?: string
  achievements?: string
  bio?: string
  photo_url?: string
  certificates?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '请选择CSV文件' },
        { status: 400 }
      )
    }

    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: '请上传CSV格式文件' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    
    // 解析CSV
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // 标准化表头
        const headerMap: { [key: string]: string } = {
          '姓名': 'name',
          'name': 'name',
          '专业领域': 'field',
          'field': 'field',
          '专家特长': 'specialty',
          'specialty': 'specialty',
          '工作单位': 'organization',
          'organization': 'organization',
          '联系方式': 'contact',
          'contact': 'contact',
          '学历': 'education',
          'education': 'education',
          '职称': 'title',
          'title': 'title',
          '研究方向': 'research_direction',
          'research_direction': 'research_direction',
          '获奖经历': 'awards',
          'awards': 'awards',
          '代表性成果': 'achievements',
          'achievements': 'achievements',
          '个人简介': 'bio',
          'bio': 'bio',
          '照片链接': 'photo_url',
          'photo_url': 'photo_url',
          '证书信息': 'certificates',
          'certificates': 'certificates'
        }
        return headerMap[header.trim()] || header.trim()
      }
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV文件格式错误：' + parseResult.errors[0].message },
        { status: 400 }
      )
    }

    const rows = parseResult.data
    const errors: Array<{ row: number; field: string; message: string }> = []
    const validExperts: any[] = []

    // 验证每一行数据
    rows.forEach((row, index) => {
      const rowNumber = index + 2 // CSV行号（包含表头）

      try {
        // 数据转换
        const expertData = {
          name: row.name?.trim() || '',
          field: row.field?.trim() || '',
          specialty: row.specialty?.trim() || '',
          organization: row.organization?.trim() || undefined,
          contact: row.contact?.trim() || undefined,
          education: row.education?.trim() || undefined,
          title: row.title?.trim() || undefined,
          researchDirection: row.research_direction?.trim() || undefined,
          awards: row.awards?.trim() || undefined,
          achievements: row.achievements?.trim() || undefined,
          bio: row.bio?.trim() || undefined,
          photoUrl: row.photo_url?.trim() || undefined,
          certificates: row.certificates?.trim() || undefined
        }

        // 验证数据
        const validatedData = expertSchema.parse(expertData)
        validExperts.push(validatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              message: err.message
            })
          })
        } else {
          errors.push({
            row: rowNumber,
            field: 'unknown',
            message: '数据格式错误'
          })
        }
      }
    })

    // 如果有验证错误，返回错误信息
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors: errors.slice(0, 10) // 最多返回10个错误
      })
    }

    // 批量插入数据
    let imported = 0
    const batchSize = 50 // 每批处理50条记录

    for (let i = 0; i < validExperts.length; i += batchSize) {
      const batch = validExperts.slice(i, i + batchSize)

      try {
        // 分离专家数据和证书数据
        const expertsToInsert = batch.map((expert: any) => {
          const { certificates, ...expertData } = expert
          return expertData
        })

        // 批量插入专家数据
        const insertedExperts = await Promise.all(
          expertsToInsert.map(expertData =>
            prisma.expert.create({ data: expertData })
          )
        )

        // 处理证书数据
        for (let j = 0; j < batch.length; j++) {
          const originalExpert = batch[j]
          const insertedExpert = insertedExperts[j]

          if (originalExpert.certificates) {
            try {
              const certificatesData = JSON.parse(originalExpert.certificates)
              if (Array.isArray(certificatesData)) {
                for (const cert of certificatesData) {
                  await prisma.certificate.create({
                    data: {
                      expertId: insertedExpert.id,
                      name: cert.name || '',
                      issuer: cert.issuer || undefined,
                      issueDate: cert.issueDate || undefined,
                      expiryDate: cert.expiryDate || undefined,
                      fileUrl: cert.fileUrl || undefined,
                      description: cert.description || undefined
                    }
                  })
                }
              }
            } catch (certError) {
              console.error('Certificate parsing error:', certError)
              // 证书解析失败不影响专家数据导入
            }
          }
        }

        imported += batch.length
      } catch (error) {
        console.error('Batch insert error:', error)
        // 如果批量插入失败，尝试逐条插入
        for (const expert of batch) {
          try {
            const { certificates: certData, ...expertData } = expert
            const insertedExpert = await prisma.expert.create({ data: expertData })

            // 处理证书数据
            if (certData) {
              try {
                const certificatesData = JSON.parse(certData)
                if (Array.isArray(certificatesData)) {
                  for (const cert of certificatesData) {
                    await prisma.certificate.create({
                      data: {
                        expertId: insertedExpert.id,
                        name: cert.name || '',
                        issuer: cert.issuer || undefined,
                        issueDate: cert.issueDate || undefined,
                        expiryDate: cert.expiryDate || undefined,
                        fileUrl: cert.fileUrl || undefined,
                        description: cert.description || undefined
                      }
                    })
                  }
                }
              } catch (certError) {
                console.error('Certificate parsing error:', certError)
              }
            }

            imported++
          } catch (singleError) {
            console.error('Single insert error:', singleError)
            errors.push({
              row: validExperts.indexOf(expert) + 2,
              field: 'database',
              message: '数据库插入失败'
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.slice(0, 10)
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: '导入失败，请稍后重试' },
      { status: 500 }
    )
  }
}
