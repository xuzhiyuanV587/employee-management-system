<template>
  <el-dialog
    v-model="visible"
    title="导出员工数据"
    width="500px"
    @close="handleClose"
  >
    <el-form label-width="100px">
      <el-form-item label="导出范围">
        <el-radio-group v-model="exportRange">
          <el-radio value="current">当前筛选结果</el-radio>
          <el-radio value="all">全部数据</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="导出字段">
        <el-checkbox-group v-model="selectedFields">
          <el-checkbox v-for="field in exportFields" :key="field.value" :value="field.value">
            {{ field.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleExport" :loading="exporting">
        导出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Employee } from '../types/employee'
import { exportToExcel } from '../utils/excel'

const visible = defineModel<boolean>('modelValue', { default: false })

const props = defineProps<{
  data: Employee[]
  allData: () => Promise<Employee[]>
}>()

const exportRange = ref<'current' | 'all'>('current')
const exporting = ref(false)

const exportFields = [
  { label: '姓名', value: 'name' },
  { label: '工号', value: 'employeeId' },
  { label: '部门', value: 'department' },
  { label: '职位', value: 'position' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '入职日期', value: 'hireDate' },
  { label: '状态', value: 'status' },
  { label: '性别', value: 'gender' },
  { label: '生日', value: 'birthday' },
  { label: '地址', value: 'address' },
  { label: '备注', value: 'remark' }
]

const selectedFields = ref(exportFields.map(f => f.value))

async function handleExport() {
  if (!selectedFields.value.length) {
    ElMessage.warning('请至少选择一个导出字段')
    return
  }
  exporting.value = true
  try {
    let data: Employee[]
    if (exportRange.value === 'all') {
      data = await props.allData()
    } else {
      data = props.data
    }
    exportToExcel(data)
    ElMessage.success('导出成功')
    handleClose()
  } catch {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

function handleClose() {
  visible.value = false
}
</script>
