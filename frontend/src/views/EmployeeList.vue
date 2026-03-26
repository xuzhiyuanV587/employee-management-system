<template>
  <div class="employee-list">
    <PageHeader title="员工管理">
      <template #actions>
        <el-button type="primary" @click="router.push('/create')">
          <el-icon><Plus /></el-icon> 新建员工
        </el-button>
        <el-button @click="showImport = true">
          <el-icon><Upload /></el-icon> 导入
        </el-button>
        <el-button @click="showExport = true">
          <el-icon><Download /></el-icon> 导出
        </el-button>
        <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> 批量删除 ({{ selectedRows.length }})
        </el-button>
      </template>
    </PageHeader>

    <el-card class="filter-card" shadow="never">
      <el-form :model="store.query" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="store.query.keyword"
            placeholder="姓名/工号/手机号"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="store.query.department" placeholder="全部" clearable style="width: 130px">
            <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="store.query.status" placeholder="全部" clearable style="width: 110px">
            <el-option v-for="s in EMPLOYEE_STATUSES" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <EmployeeTable
        :data="store.employees"
        :total="store.total"
        :loading="store.loading"
        :page="store.query.page"
        :page-size="store.query.pageSize"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @resign="handleResignClick"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <ImportDialog
      v-model="showImport"
      @success="handleImportSuccess"
    />

    <ExportDialog
      v-model="showExport"
      :data="store.employees"
      :all-data="getAllData"
    />

    <!-- 离职办理对话框 -->
    <el-dialog v-model="showResignDialog" title="办理离职" width="480px">
      <el-form :model="resignForm" label-width="100px">
        <el-form-item label="员工姓名">
          <el-input :model-value="resignTarget?.name" disabled />
        </el-form-item>
        <el-form-item label="离职日期" required>
          <el-date-picker
            v-model="resignForm.resignDate"
            type="date"
            placeholder="请选择离职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="离职原因">
          <el-input
            v-model="resignForm.resignReason"
            type="textarea"
            :rows="3"
            placeholder="请输入离职原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResignDialog = false">取消</el-button>
        <el-button type="primary" :loading="resignLoading" @click="handleResignConfirm">确认离职</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Delete, Search, RefreshLeft } from '@element-plus/icons-vue'
import { useEmployeeStore } from '../stores/employee'
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../types/employee'
import type { Employee } from '../types/employee'
import EmployeeTable from '../components/EmployeeTable.vue'
import ImportDialog from '../components/ImportDialog.vue'
import ExportDialog from '../components/ExportDialog.vue'
import PageHeader from '../components/PageHeader.vue'
import { printResignCertificate } from '../utils/printCertificate'

const router = useRouter()
const store = useEmployeeStore()

const selectedRows = ref<Employee[]>([])
const showImport = ref(false)
const showExport = ref(false)
const dateRange = ref<[string, string] | null>(null)

// 离职相关
const showResignDialog = ref(false)
const resignTarget = ref<Employee | null>(null)
const resignLoading = ref(false)
const resignForm = ref({ resignDate: '', resignReason: '' })

onMounted(() => {
  store.fetchEmployees()
})

function handleSearch() {
  store.query.page = 1
  store.fetchEmployees()
}

function handleReset() {
  store.resetQuery()
  dateRange.value = null
  store.fetchEmployees()
}

function handleDateChange(val: [string, string] | null) {
  store.query.hireDateStart = val ? val[0] : ''
  store.query.hireDateEnd = val ? val[1] : ''
}

function handleView(row: Employee) {
  router.push(`/detail/${row.id}`)
}

function handleEdit(row: Employee) {
  router.push(`/edit/${row.id}`)
}

async function handleDelete(row: Employee) {
  try {
    await store.removeEmployee(row.id!)
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 名员工吗？`, '批量删除', {
      type: 'warning'
    })
    const ids = selectedRows.value.map(r => r.id!)
    await store.batchRemove(ids)
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // cancelled
  }
}

function handleSelectionChange(selected: Employee[]) {
  selectedRows.value = selected
}

function handlePageChange(page: number) {
  store.query.page = page
  store.fetchEmployees()
}

function handleSizeChange(size: number) {
  store.query.pageSize = size
  store.query.page = 1
  store.fetchEmployees()
}

async function handleImportSuccess(result: { success: number; failed: number }) {
  ElMessage.success(`成功导入 ${result.success} 条数据`)
  store.fetchEmployees()
}

async function getAllData() {
  return await store.exportData()
}

function handleResignClick(row: Employee) {
  resignTarget.value = row
  resignForm.value = { resignDate: '', resignReason: '' }
  showResignDialog.value = true
}

async function handleResignConfirm() {
  if (!resignForm.value.resignDate) {
    ElMessage.warning('请选择离职日期')
    return
  }
  resignLoading.value = true
  try {
    await store.resignEmployee(resignTarget.value!.id!, resignForm.value)
    showResignDialog.value = false
    try {
      await ElMessageBox.confirm('离职办理成功，是否打印离职证明？', '提示', {
        confirmButtonText: '打印',
        cancelButtonText: '稍后',
        type: 'success'
      })
      printResignCertificate({
        ...resignTarget.value!,
        status: '离职',
        resignDate: resignForm.value.resignDate,
        resignReason: resignForm.value.resignReason
      })
    } catch {
      // 用户选择稍后
    }
  } catch {
    ElMessage.error('离职办理失败')
  } finally {
    resignLoading.value = false
  }
}
</script>

<style scoped>
.employee-list {
  padding: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
