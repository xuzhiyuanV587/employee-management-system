import api from './index'
import type { ContractTemplate, ContractRecord, ContractQuery } from '../types/contract'
import type { PaginatedResult } from '../types/employee'

// Backend returns { list, pagination: { page, pageSize, total, totalPages } }
interface BackendListResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 上传合同模板
export function uploadContract(file: File, name: string): Promise<ContractTemplate> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)

  return api.post('/contracts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data as ContractTemplate)
}

// 获取模板列表
export function getContracts(query: ContractQuery): Promise<PaginatedResult<ContractTemplate>> {
  return api.get('/contracts', { params: query }).then(res => {
    const result = res.data as BackendListResponse<ContractTemplate>
    return {
      data: result.list,
      total: result.pagination.total,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize
    }
  })
}

// 获取模板详情
export function getContract(id: number): Promise<ContractTemplate> {
  return api.get(`/contracts/${id}`).then(res => res.data as ContractTemplate)
}

// 删除模板
export function deleteContract(id: number): Promise<void> {
  return api.delete(`/contracts/${id}`).then(() => undefined)
}

// 重新识别空白项
export function reparseContract(id: number, rule: string, customPattern?: string): Promise<ContractTemplate> {
  return api.post(`/contracts/${id}/reparse`, {
    placeholder_rule: rule,
    custom_pattern: customPattern
  }).then(res => res.data as ContractTemplate)
}

// 填写空白项生成合同
export function fillContract(id: number, fillData: Record<string, string>): Promise<ContractRecord> {
  return api.post(`/contracts/${id}/fill`, { fill_data: fillData }).then(res => res.data as ContractRecord)
}

// 获取使用记录
export function getContractRecords(id: number, query: { page: number; pageSize: number }): Promise<PaginatedResult<ContractRecord>> {
  return api.get(`/contracts/${id}/records`, { params: query }).then(res => {
    const result = res.data as BackendListResponse<ContractRecord>
    return {
      data: result.list,
      total: result.pagination.total,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize
    }
  })
}

// 获取单条记录
export function getContractRecord(recordId: number): Promise<ContractRecord> {
  return api.get(`/contracts/records/${recordId}`).then(res => res.data as ContractRecord)
}

// 下载已填写合同
export function downloadContractRecord(recordId: number): Promise<Blob> {
  return api.get(`/contracts/records/${recordId}/download`, {
    responseType: 'blob'
  }).then(res => res.data as Blob)
}

// 删除使用记录
export function deleteContractRecord(recordId: number): Promise<void> {
  return api.delete(`/contracts/records/${recordId}`).then(() => undefined)
}
