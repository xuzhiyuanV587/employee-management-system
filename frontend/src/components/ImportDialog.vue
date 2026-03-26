<template>
  <el-dialog
    v-model="visible"
    title="导入员工数据"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="!previewData.length" class="upload-area">
      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls,.csv"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx, .xls, .csv 格式文件
          </div>
        </template>
      </el-upload>
      <el-button type="primary" link @click="handleDownloadTemplate" style="margin-top: 8px">
        下载导入模板
      </el-button>
    </div>

    <div v-else class="preview-area">
      <el-alert
        :title="`共解析 ${previewData.length} 条数据，${errorCount} 条有误`"
        :type="errorCount > 0 ? 'warning' : 'success'"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
      />
      <el-table :data="previewData" max-height="400" border size="small">
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="department" label="部门" width="80" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="hireDate" label="入职日期" width="100" />
        <el-table-column prop="status" label="状态" width="70" />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="handleReset" v-if="previewData.length">重新选择</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :disabled="!previewData.length || importing"
        :loading="importing"
        @click="handleImport"
      >
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import type { Employee } from '../types/employee'
import { parseExcelFile, mapFields, downloadTemplate } from '../utils/excel'
import { validatePhone, validateEmail } from '../utils/validation'
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../types/employee'

const visible = defineModel<boolean>('modelValue', { default: false })

const emit = defineEmits<{
  success: [result: { success: number; failed: number }]
}>()

const previewData = ref<Partial<Employee>[]>([])
const importing = ref(false)

const errorCount = computed(() => {
  return previewData.value.filter(row => {
    return !row.name || !row.department || !row.position ||
      !row.phone || !validatePhone(row.phone) ||
      !row.email || !validateEmail(row.email) ||
      !row.hireDate || !row.status ||
      (row.department && !DEPARTMENTS.includes(row.department as typeof DEPARTMENTS[number])) ||
      (row.status && !EMPLOYEE_STATUSES.includes(row.status as typeof EMPLOYEE_STATUSES[number]))
  }).length
})

async function handleFileChange(file: UploadFile) {
  if (!file.raw) return
  try {
    const rawData = await parseExcelFile(file.raw)
    previewData.value = mapFields(rawData)
  } catch {
    ElMessage.error('文件解析失败，请检查文件格式')
  }
}

function handleDownloadTemplate() {
  downloadTemplate()
}

function handleReset() {
  previewData.value = []
}

async function handleImport() {
  importing.value = true
  try {
    const { importEmployees } = await import('../api/employee')
    const result = await importEmployees(previewData.value as Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>[])
    emit('success', { success: result.success, failed: result.failed })
    if (result.failed > 0) {
      ElMessage.warning(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`)
    } else {
      ElMessage.success(`成功导入 ${result.success} 条数据`)
    }
    handleClose()
  } catch {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

function handleClose() {
  previewData.value = []
  visible.value = false
}
</script>

<style scoped>
.upload-area {
  text-align: center;
}
</style>
