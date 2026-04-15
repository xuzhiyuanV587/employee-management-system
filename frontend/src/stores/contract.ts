import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ContractTemplate, ContractRecord, ContractQuery } from '../types/contract'
import type { PaginatedResult } from '../types/employee'
import * as contractApi from '../api/contract'

export const useContractStore = defineStore('contract', () => {
  const templates = ref<ContractTemplate[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentTemplate = ref<ContractTemplate | null>(null)

  const query = ref<ContractQuery>({
    keyword: '',
    page: 1,
    pageSize: 10
  })

  // 使用记录
  const records = ref<ContractRecord[]>([])
  const recordsTotal = ref(0)
  const recordsQuery = ref({
    page: 1,
    pageSize: 10
  })

  async function fetchTemplates() {
    loading.value = true
    try {
      const result: PaginatedResult<ContractTemplate> = await contractApi.getContracts(query.value)
      templates.value = result.data
      total.value = result.total
    } catch (error) {
      console.error('Failed to fetch contract templates:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTemplate(id: number) {
    loading.value = true
    try {
      currentTemplate.value = await contractApi.getContract(id)
    } catch (error) {
      console.error('Failed to fetch contract template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function uploadTemplate(file: File, name: string) {
    loading.value = true
    try {
      const result = await contractApi.uploadContract(file, name)
      await fetchTemplates()
      return result
    } catch (error) {
      console.error('Failed to upload contract template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function removeTemplate(id: number) {
    await contractApi.deleteContract(id)
    await fetchTemplates()
  }

  async function reparseTemplate(id: number, rule: string, customPattern?: string) {
    loading.value = true
    try {
      const result = await contractApi.reparseContract(id, rule, customPattern)
      currentTemplate.value = result
      return result
    } catch (error) {
      console.error('Failed to reparse contract template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fillTemplate(id: number, fillData: Record<string, string>) {
    loading.value = true
    try {
      const result = await contractApi.fillContract(id, fillData)
      return result
    } catch (error) {
      console.error('Failed to fill contract template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchRecords(templateId: number) {
    loading.value = true
    try {
      const result: PaginatedResult<ContractRecord> = await contractApi.getContractRecords(
        templateId,
        recordsQuery.value
      )
      records.value = result.data
      recordsTotal.value = result.total
    } catch (error) {
      console.error('Failed to fetch contract records:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function downloadRecord(recordId: number, filename: string) {
    try {
      const blob = await contractApi.downloadContractRecord(recordId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download contract record:', error)
      throw error
    }
  }

  function resetQuery() {
    query.value = {
      keyword: '',
      page: 1,
      pageSize: 10
    }
  }

  function resetRecordsQuery() {
    recordsQuery.value = {
      page: 1,
      pageSize: 10
    }
  }

  return {
    templates,
    total,
    loading,
    currentTemplate,
    query,
    records,
    recordsTotal,
    recordsQuery,
    fetchTemplates,
    fetchTemplate,
    uploadTemplate,
    removeTemplate,
    reparseTemplate,
    fillTemplate,
    fetchRecords,
    downloadRecord,
    resetQuery,
    resetRecordsQuery
  }
})
