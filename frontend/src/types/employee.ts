export interface Employee {
  id?: number
  name: string
  employeeId: string
  department: Department
  position: string
  phone: string
  email: string
  hireDate: string
  status: EmployeeStatus
  gender?: Gender
  birthday?: string
  address?: string
  remark?: string
  resignDate?: string
  resignReason?: string
  createdAt?: string
  updatedAt?: string
}

export type Department = '技术部' | '产品部' | '市场部' | '财务部' | '人事部' | '运营部'

export type EmployeeStatus = '在职' | '离职' | '试用期'

export type Gender = '男' | '女'

export const DEPARTMENTS: Department[] = ['技术部', '产品部', '市场部', '财务部', '人事部', '运营部']

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['在职', '离职', '试用期']

export const GENDERS: Gender[] = ['男', '女']

export interface EmployeeQuery {
  keyword?: string
  department?: Department | ''
  status?: EmployeeStatus | ''
  hireDateStart?: string
  hireDateEnd?: string
  page: number
  pageSize: number
}

export interface ResignedQuery {
  keyword?: string
  department?: Department | ''
  resignDateStart?: string
  resignDateEnd?: string
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
