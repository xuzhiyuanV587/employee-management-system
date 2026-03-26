import api from './index'
import type { Employee, EmployeeQuery, ResignedQuery, PaginatedResult } from '../types/employee'

// Backend returns { list, pagination: { page, pageSize, total, totalPages } }
interface BackendListResponse {
  list: Employee[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function getEmployees(query: EmployeeQuery): Promise<PaginatedResult<Employee>> {
  return api.get('/employees', { params: query }).then(res => {
    const result = res.data as BackendListResponse
    return {
      data: result.list,
      total: result.pagination.total,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize
    }
  })
}

export function getEmployee(id: number): Promise<Employee> {
  return api.get(`/employees/${id}`).then(res => res.data as Employee)
}

export function createEmployee(data: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  return api.post('/employees', data).then(res => res.data as Employee)
}

export function updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
  return api.put(`/employees/${id}`, data).then(res => res.data as Employee)
}

export function deleteEmployee(id: number): Promise<void> {
  return api.delete(`/employees/${id}`).then(() => undefined)
}

export function batchDeleteEmployees(ids: number[]): Promise<void> {
  return api.post('/employees/batch-delete', { ids }).then(() => undefined)
}

export function importEmployees(employees: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>[]): Promise<{ success: number; failed: number; errors: string[] }> {
  return api.post('/employees/import', { employees }).then(res => res.data as { success: number; failed: number; errors: string[] })
}

export function exportEmployees(query?: Partial<EmployeeQuery>): Promise<Employee[]> {
  // Backend export returns CSV file; for in-app export we fetch all data via list endpoint
  return api.get('/employees', {
    params: { ...query, page: 1, pageSize: 10000 }
  }).then(res => {
    const result = res.data as BackendListResponse
    return result.list
  })
}

export function resignEmployee(id: number, data: { resignDate: string; resignReason: string }): Promise<Employee> {
  return api.post(`/employees/resign/${id}`, data).then(res => res.data as Employee)
}

export function getResignedEmployees(query: ResignedQuery): Promise<PaginatedResult<Employee>> {
  return api.get('/employees/resigned', { params: query }).then(res => {
    const result = res.data as BackendListResponse
    return {
      data: result.list,
      total: result.pagination.total,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize
    }
  })
}
