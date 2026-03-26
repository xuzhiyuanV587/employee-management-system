import * as XLSX from 'xlsx'
import type { Employee } from '../types/employee'

const FIELD_MAP: Record<string, string> = {
  '姓名': 'name',
  '部门': 'department',
  '职位': 'position',
  '手机号': 'phone',
  '邮箱': 'email',
  '入职日期': 'hireDate',
  '状态': 'status',
  '性别': 'gender',
  '生日': 'birthday',
  '地址': 'address',
  '备注': 'remark',
  'name': 'name',
  'department': 'department',
  'position': 'position',
  'phone': 'phone',
  'email': 'email',
  'hireDate': 'hireDate',
  'status': 'status',
  'gender': 'gender',
  'birthday': 'birthday',
  'address': 'address',
  'remark': 'remark'
}

export function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false })
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function mapFields(data: Record<string, string>[]): Partial<Employee>[] {
  return data.map(row => {
    const mapped: Record<string, string> = {}
    for (const [key, value] of Object.entries(row)) {
      const fieldName = FIELD_MAP[key.trim()]
      if (fieldName) {
        mapped[fieldName] = value
      }
    }
    return mapped as Partial<Employee>
  })
}

export function exportToExcel(data: Employee[], filename: string = '员工数据') {
  const exportData = data.map(emp => ({
    '姓名': emp.name,
    '工号': emp.employeeId,
    '部门': emp.department,
    '职位': emp.position,
    '手机号': emp.phone,
    '邮箱': emp.email,
    '入职日期': emp.hireDate,
    '状态': emp.status,
    '性别': emp.gender || '',
    '生日': emp.birthday || '',
    '地址': emp.address || '',
    '备注': emp.remark || ''
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工数据')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function downloadTemplate() {
  const template = [
    {
      '姓名': '张三',
      '部门': '技术部',
      '职位': '前端工程师',
      '手机号': '13800138000',
      '邮箱': 'zhangsan@example.com',
      '入职日期': '2024-01-15',
      '状态': '在职',
      '性别': '男',
      '生日': '1990-05-20',
      '地址': '北京市朝阳区',
      '备注': ''
    }
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '导入模板')
  XLSX.writeFile(wb, '员工导入模板.xlsx')
}
