<template>
  <div class="contract-list">
    <PageHeader title="合同模板管理">
      <template #actions>
        <el-upload
          ref="uploadRef"
          :http-request="handleUpload"
          accept=".docx"
          :show-file-list="false"
          :auto-upload="true"
          :before-upload="beforeUpload"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon> 上传合同模板
          </el-button>
        </el-upload>
      </template>
    </PageHeader>

    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="store.query" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="store.query.keyword"
            placeholder="搜索模板名称"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
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

    <!-- 模板列表 -->
    <el-card shadow="never" style="margin-top: 16px">
      <el-table
        v-loading="store.loading"
        :data="store.templates"
        style="width: 100%"
      >
        <el-table-column prop="name" label="模板名称" min-width="160" />
        <el-table-column prop="original_filename" label="原始文件名" min-width="160" />
        <el-table-column label="空白项数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.placeholders?.length ?? 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="识别规则" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.placeholder_rule === 'underscore' ? 'primary' : 'warning'">
              {{ row.placeholder_rule === 'underscore' ? '下划线' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="upload_by" label="上传人" width="100" align="center" />
        <el-table-column label="上传时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="handleView(row)">查看</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="store.query.page"
          v-model:page-size="store.query.pageSize"
          :total="store.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleSearch"
          @size-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 上传命名对话框 -->
    <el-dialog
      v-model="showNameDialog"
      title="设置模板名称"
      width="420px"
      :close-on-click-modal="false"
      @close="handleNameDialogClose"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input
            v-model="uploadForm.name"
            placeholder="请输入模板名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="文件名">
          <span class="file-name-text">{{ uploadForm.filename }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleNameDialogClose">取消</el-button>
        <el-button type="primary" :loading="store.loading" @click="handleConfirmUpload">确认上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Search, RefreshLeft } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import { useContractStore } from '../stores/contract'
import type { ContractTemplate } from '../types/contract'

const router = useRouter()
const store = useContractStore()
const uploadRef = ref()
const showNameDialog = ref(false)
const pendingFile = ref<File | null>(null)

const uploadForm = reactive({
  name: '',
  filename: ''
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function beforeUpload(file: File): boolean {
  if (!file.name.endsWith('.docx')) {
    ElMessage.error('只支持 .docx 格式的文件')
    return false
  }
  return true
}

function handleUpload(options: { file: File }) {
  pendingFile.value = options.file
  uploadForm.name = options.file.name.replace(/\.docx$/, '')
  uploadForm.filename = options.file.name
  showNameDialog.value = true
}

function handleNameDialogClose() {
  showNameDialog.value = false
  pendingFile.value = null
  uploadForm.name = ''
  uploadForm.filename = ''
}

async function handleConfirmUpload() {
  if (!uploadForm.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }
  if (!pendingFile.value) {
    ElMessage.error('文件丢失，请重新选择')
    return
  }
  try {
    await store.uploadTemplate(pendingFile.value, uploadForm.name.trim())
    ElMessage.success('模板上传成功')
    handleNameDialogClose()
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  }
}

function handleView(row: ContractTemplate) {
  router.push(`/contracts/${row.id}`)
}

async function handleDelete(row: ContractTemplate) {
  try {
    await ElMessageBox.confirm(`确定要删除模板「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })
    await store.removeTemplate(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function handleSearch() {
  store.fetchTemplates()
}

function handleReset() {
  store.resetQuery()
  store.fetchTemplates()
}

onMounted(() => {
  store.fetchTemplates()
})
</script>

<style scoped>
.contract-list {
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

.file-name-text {
  color: #606266;
  font-size: 14px;
}
</style>
