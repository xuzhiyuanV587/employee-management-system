<template>
  <div class="employee-table">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      border
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="employeeId" label="工号" width="180" sortable />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100">
        <template #default="{ row }">
          <el-tag>{{ row.department }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="position" label="职位" width="130" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="hireDate" label="入职日期" width="120" sortable />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('view', row)">查看</el-button>
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button v-if="row.status !== '离职'" link type="warning" @click="$emit('resign', row)">离职</el-button>
          <el-popconfirm title="确定删除该员工吗？" @confirm="$emit('delete', row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Employee, EmployeeStatus } from '../types/employee'

const props = defineProps<{
  data: Employee[]
  total: number
  loading: boolean
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  view: [row: Employee]
  edit: [row: Employee]
  delete: [row: Employee]
  resign: [row: Employee]
  'selection-change': [selected: Employee[]]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

watch(() => props.page, (val) => { currentPage.value = val })
watch(() => props.pageSize, (val) => { currentPageSize.value = val })

function statusTagType(status: EmployeeStatus) {
  const map: Record<EmployeeStatus, string> = {
    '在职': 'success',
    '离职': 'danger',
    '试用期': 'warning'
  }
  return map[status] || 'info'
}

function handleSelectionChange(selected: Employee[]) {
  emit('selection-change', selected)
}

function handlePageChange(page: number) {
  emit('page-change', page)
}

function handleSizeChange(size: number) {
  emit('size-change', size)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
