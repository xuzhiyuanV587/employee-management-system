<template>
  <div class="employee-edit">
    <PageHeader title="编辑员工" backable />

    <el-card v-loading="store.loading" shadow="never" style="max-width: 800px; margin-top: 16px">
      <EmployeeForm
        v-if="store.currentEmployee"
        :initial-data="store.currentEmployee"
        submit-text="保存"
        @submit="handleSubmit"
        @cancel="router.back()"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '../stores/employee'
import type { Employee } from '../types/employee'
import EmployeeForm from '../components/EmployeeForm.vue'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const store = useEmployeeStore()

onMounted(() => {
  const id = Number(route.params.id)
  store.fetchEmployee(id)
})

async function handleSubmit(data: Partial<Employee>) {
  try {
    const id = Number(route.params.id)
    await store.editEmployee(id, data)
    ElMessage.success('保存成功')
    router.push(`/detail/${id}`)
  } catch {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.employee-edit {
  padding: 20px;
}
</style>
