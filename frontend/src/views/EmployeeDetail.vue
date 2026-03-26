<template>
  <div class="employee-detail">
    <PageHeader title="员工详情" backable>
      <template #actions v-if="store.currentEmployee">
        <el-button v-if="store.currentEmployee.status === '离职'" type="success" @click="handlePrint">
          打印离职证明
        </el-button>
        <el-button type="primary" @click="router.push(`/edit/${store.currentEmployee.id}`)">
          编辑
        </el-button>
        <el-popconfirm title="确定删除该员工吗？" @confirm="handleDelete">
          <template #reference>
            <el-button type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </PageHeader>

    <el-card v-loading="store.loading" shadow="never" style="max-width: 800px; margin-top: 16px">
      <template v-if="store.currentEmployee">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ store.currentEmployee.name }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ store.currentEmployee.employeeId }}</el-descriptions-item>
          <el-descriptions-item label="部门">
            <el-tag>{{ store.currentEmployee.department }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="职位">{{ store.currentEmployee.position }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ store.currentEmployee.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ store.currentEmployee.email }}</el-descriptions-item>
          <el-descriptions-item label="入职日期">{{ store.currentEmployee.hireDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(store.currentEmployee.status)">
              {{ store.currentEmployee.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="性别">{{ store.currentEmployee.gender || '-' }}</el-descriptions-item>
          <el-descriptions-item label="生日">{{ store.currentEmployee.birthday || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ store.currentEmployee.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ store.currentEmployee.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="store.currentEmployee.status === '离职'" label="离职日期">
            {{ store.currentEmployee.resignDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="store.currentEmployee.status === '离职'" label="离职原因">
            {{ store.currentEmployee.resignReason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ store.currentEmployee.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ store.currentEmployee.updatedAt || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEmployeeStore } from '../stores/employee'
import type { EmployeeStatus } from '../types/employee'
import { printResignCertificate } from '../utils/printCertificate'
import PageHeader from '../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const store = useEmployeeStore()

onMounted(() => {
  const id = Number(route.params.id)
  store.fetchEmployee(id)
})

function statusTagType(status: EmployeeStatus) {
  const map: Record<EmployeeStatus, string> = {
    '在职': 'success',
    '离职': 'danger',
    '试用期': 'warning'
  }
  return map[status] || 'info'
}

async function handleDelete() {
  try {
    await store.removeEmployee(store.currentEmployee!.id!)
    ElMessage.success('删除成功')
    router.push('/')
  } catch {
    ElMessage.error('删除失败')
  }
}

function handlePrint() {
  if (store.currentEmployee) {
    printResignCertificate(store.currentEmployee)
  }
}
</script>

<style scoped>
.employee-detail {
  padding: 20px;
}
</style>
