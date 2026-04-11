<template>
  <div class="file-list">
    <PageHeader title="下载管理">
      <template #actions>
        <el-button @click="fetchFiles">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </template>
    </PageHeader>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="files" v-loading="loading" stripe>
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column label="文件大小" width="120" align="right">
          <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">{{ formatTime(row.uploadedAt) }}</template>
        </el-table-column>
        <el-table-column prop="fileHash" label="文件哈希" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-text type="info" size="small">{{ row.fileHash }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDownload(row)">
              <el-icon><Download /></el-icon> 下载
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && files.length === 0" description="暂无上传文件" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import {
  getUploadedFiles,
  downloadFile,
  deleteUploadedFile,
  type UploadedFile
} from '../api/upload'

const files = ref<UploadedFile[]>([])
const loading = ref(false)

onMounted(() => {
  fetchFiles()
})

async function fetchFiles() {
  loading.value = true
  try {
    files.value = await getUploadedFiles()
  } catch {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function handleDownload(file: UploadedFile) {
  try {
    const blob = await downloadFile(file.storedName)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('下载失败')
  }
}

async function handleDelete(file: UploadedFile) {
  try {
    await ElMessageBox.confirm(
      `确定删除文件「${file.fileName}」吗？删除后不可恢复。`,
      '删除文件',
      { type: 'warning' }
    )
    await deleteUploadedFile(file.storedName)
    ElMessage.success('删除成功')
    fetchFiles()
  } catch {
    // cancelled
  }
}
</script>

<style scoped>
.file-list {
  padding: 20px;
}
</style>
