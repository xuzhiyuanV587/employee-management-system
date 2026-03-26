<template>
  <div class="employee-create">
    <PageHeader title="创建员工" backable />

    <el-card shadow="never" style="max-width: 800px; margin-top: 16px">
      <EmployeeForm
        submit-text="创建"
        @submit="handleSubmit"
        @cancel="router.back()"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '../stores/employee'
import type { Employee } from '../types/employee'
import EmployeeForm from '../components/EmployeeForm.vue'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const store = useEmployeeStore()

async function handleSubmit(data: Partial<Employee>) {
  try {
    const result = await store.addEmployee(data as Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>)
    ElMessage.success('创建成功')
    router.push(`/detail/${result.id}`)
  } catch {
    ElMessage.error('创建失败')
  }
}
</script>

<style scoped>
.employee-create {
  padding: 20px;
}
</style>
