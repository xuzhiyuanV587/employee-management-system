import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Employee, EmployeeQuery, ResignedQuery, PaginatedResult } from '../types/employee'
import * as employeeApi from '../api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentEmployee = ref<Employee | null>(null)

  const query = ref<EmployeeQuery>({
    keyword: '',
    department: '',
    status: '',
    hireDateStart: '',
    hireDateEnd: '',
    page: 1,
    pageSize: 10
  })

  // 离职员工
  const resignedEmployees = ref<Employee[]>([])
  const resignedTotal = ref(0)
  const resignedQuery = ref<ResignedQuery>({
    keyword: '',
    department: '',
    resignDateStart: '',
    resignDateEnd: '',
    page: 1,
    pageSize: 10
  })

  async function fetchEmployees() {
    loading.value = true
    try {
      const result: PaginatedResult<Employee> = await employeeApi.getEmployees(query.value)
      employees.value = result.data
      total.value = result.total
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchEmployee(id: number) {
    loading.value = true
    try {
      currentEmployee.value = await employeeApi.getEmployee(id)
    } catch (error) {
      console.error('Failed to fetch employee:', error)
    } finally {
      loading.value = false
    }
  }

  async function addEmployee(data: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>) {
    return await employeeApi.createEmployee(data)
  }

  async function editEmployee(id: number, data: Partial<Employee>) {
    return await employeeApi.updateEmployee(id, data)
  }

  async function removeEmployee(id: number) {
    await employeeApi.deleteEmployee(id)
    await fetchEmployees()
  }

  async function batchRemove(ids: number[]) {
    await employeeApi.batchDeleteEmployees(ids)
    await fetchEmployees()
  }

  async function importData(data: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>[]) {
    return await employeeApi.importEmployees(data)
  }

  async function exportData(params?: Partial<EmployeeQuery>) {
    return await employeeApi.exportEmployees(params)
  }

  async function resignEmployee(id: number, data: { resignDate: string; resignReason: string }) {
    await employeeApi.resignEmployee(id, data)
    await fetchEmployees()
  }

  async function fetchResignedEmployees() {
    loading.value = true
    try {
      const result: PaginatedResult<Employee> = await employeeApi.getResignedEmployees(resignedQuery.value)
      resignedEmployees.value = result.data
      resignedTotal.value = result.total
    } catch (error) {
      console.error('Failed to fetch resigned employees:', error)
    } finally {
      loading.value = false
    }
  }

  function resetResignedQuery() {
    resignedQuery.value = {
      keyword: '',
      department: '',
      resignDateStart: '',
      resignDateEnd: '',
      page: 1,
      pageSize: 10
    }
  }

  function resetQuery() {
    query.value = {
      keyword: '',
      department: '',
      status: '',
      hireDateStart: '',
      hireDateEnd: '',
      page: 1,
      pageSize: 10
    }
  }

  return {
    employees,
    total,
    loading,
    currentEmployee,
    query,
    resignedEmployees,
    resignedTotal,
    resignedQuery,
    fetchEmployees,
    fetchEmployee,
    addEmployee,
    editEmployee,
    removeEmployee,
    batchRemove,
    importData,
    exportData,
    resignEmployee,
    fetchResignedEmployees,
    resetResignedQuery,
    resetQuery
  }
})
