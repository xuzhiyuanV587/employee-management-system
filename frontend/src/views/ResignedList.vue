<template>
  <div class="resigned-list">
    <PageHeader title="离职员工管理" />

    <el-card class="filter-card" shadow="never">
      <el-form :model="store.resignedQuery" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="store.resignedQuery.keyword"
            placeholder="姓名/工号/手机号"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="store.resignedQuery.department" placeholder="全部" clearable style="width: 130px">
            <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="离职日期">
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
      <el-table :data="store.resignedEmployees" v-loading="store.loading" stripe border style="width: 100%">
        <el-table-column prop="employeeId" label="工号" width="180" sortable />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.department }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="130" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="hireDate" label="入职日期" width="120" sortable />
        <el-table-column prop="resignDate" label="离职日期" width="120" sortable />
        <el-table-column prop="resignReason" label="离职原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90">
          <template #default>
            <el-tag type="danger">离职</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/detail/${row.id}`)">查看</el-button>
            <el-button link type="success" @click="handlePrint(row)">打印证明</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="store.resignedQuery.page"
          v-model:page-size="store.resignedQuery.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="store.resignedTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { useEmployeeStore } from '../stores/employee'
import { DEPARTMENTS } from '../types/employee'
import type { Employee } from '../types/employee'
import { printResignCertificate } from '../utils/printCertificate'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()
const store = useEmployeeStore()
const dateRange = ref<[string, string] | null>(null)

onMounted(() => {
  store.fetchResignedEmployees()
})

function handleSearch() {
  store.resignedQuery.page = 1
  store.fetchResignedEmployees()
}

function handleReset() {
  store.resetResignedQuery()
  dateRange.value = null
  store.fetchResignedEmployees()
}

function handleDateChange(val: [string, string] | null) {
  store.resignedQuery.resignDateStart = val ? val[0] : ''
  store.resignedQuery.resignDateEnd = val ? val[1] : ''
}

function handlePageChange(page: number) {
  store.resignedQuery.page = page
  store.fetchResignedEmployees()
}

function handleSizeChange(size: number) {
  store.resignedQuery.pageSize = size
  store.resignedQuery.page = 1
  store.fetchResignedEmployees()
}

function handlePrint(row: Employee) {
  printResignCertificate(row)
}
</script>

<style scoped>
.resigned-list {
  padding: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>