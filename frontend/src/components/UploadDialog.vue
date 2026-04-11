<template>
  <el-dialog
    v-model="visible"
    title="大文件上传"
    width="560px"
    :close-on-click-modal="false"
    :close-on-press-escape="!uploading"
    :show-close="!uploading"
    @close="handleClose"
  >
    <!-- 阶段1：文件选择 -->
    <div v-if="currentPhase === 'idle'" class="upload-area">
      <el-upload
        drag
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
        <template #tip>
          <div class="el-upload__tip">支持任意格式文件，自动分片上传</div>
        </template>
      </el-upload>
    </div>

    <!-- 阶段2：上传中 -->
    <div v-else-if="currentPhase !== 'done'" class="progress-area">
      <div class="file-info">
        <el-icon :size="20"><Document /></el-icon>
        <span class="file-name">{{ selectedFile?.name }}</span>
        <span class="file-size">{{ formatSize(selectedFile?.size || 0) }}</span>
      </div>

      <div class="status-text">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ phaseText }}</span>
      </div>

      <el-progress
        :percentage="progress"
        :status="progressStatus"
        :stroke-width="18"
        striped
        striped-flow
      />

      <div class="chunk-detail" v-if="currentPhase === 'uploading'">
        已上传 {{ uploadedCount }} / {{ totalChunks }} 个分片
      </div>

      <div class="chunk-detail" v-if="errorMsg">
        <el-text type="danger">{{ errorMsg }}</el-text>
      </div>
    </div>

    <!-- 阶段3：完成 -->
    <div v-else class="done-area">
      <el-result
        icon="success"
        :title="isInstant ? '秒传成功' : '上传成功'"
        :sub-title="`文件: ${selectedFile?.name}`"
      />
    </div>

    <template #footer>
      <el-button
        @click="handleClose"
        :disabled="uploading && currentPhase !== 'done'"
      >
        {{ currentPhase === 'done' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="currentPhase === 'idle'"
        type="primary"
        :disabled="!selectedFile"
        @click="startUpload"
      >
        开始上传
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled, Document, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { calculateFileHash } from '../utils/file-hash'
import { checkFile, uploadChunk, mergeChunks } from '../api/upload'

const visible = defineModel<boolean>('modelValue', { default: false })

type Phase = 'idle' | 'hashing' | 'checking' | 'uploading' | 'merging' | 'done'

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const currentPhase = ref<Phase>('idle')
const hashProgress = ref(0)
const uploadedCount = ref(0)
const totalChunks = ref(0)
const isInstant = ref(false)
const errorMsg = ref('')

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_RETRY = 3

const phaseText = computed(() => {
  switch (currentPhase.value) {
    case 'hashing': return `正在计算文件指纹... ${hashProgress.value}%`
    case 'checking': return '正在检查服务端文件...'
    case 'uploading': return '正在上传分片...'
    case 'merging': return '正在合并文件...'
    default: return ''
  }
})

const progress = computed(() => {
  switch (currentPhase.value) {
    case 'hashing':
      return Math.floor(hashProgress.value * 0.1)
    case 'checking':
      return 10
    case 'uploading':
      if (totalChunks.value === 0) return 10
      return 10 + Math.floor((uploadedCount.value / totalChunks.value) * 85)
    case 'merging':
      return 95
    case 'done':
      return 100
    default:
      return 0
  }
})

const progressStatus = computed(() => {
  if (errorMsg.value) return 'exception'
  if (currentPhase.value === 'done') return 'success'
  return undefined
})

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    selectedFile.value = file.raw
  }
}

function handleFileRemove() {
  selectedFile.value = null
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i]
}

async function startUpload() {
  if (!selectedFile.value) return
  uploading.value = true
  errorMsg.value = ''

  try {
    // 1. 计算 MD5 哈希
    currentPhase.value = 'hashing'
    const hash = await calculateFileHash(
      selectedFile.value,
      (p) => { hashProgress.value = p }
    )

    // 2. 检查服务端文件
    currentPhase.value = 'checking'
    const chunks = Math.ceil(selectedFile.value.size / CHUNK_SIZE)
    totalChunks.value = chunks
    const checkResult = await checkFile({
      fileHash: hash,
      fileName: selectedFile.value.name,
      totalChunks: chunks
    })

    // 秒传
    if (checkResult.exists) {
      isInstant.value = true
      currentPhase.value = 'done'
      ElMessage.success('文件秒传成功')
      return
    }

    // 3. 上传缺失分片
    currentPhase.value = 'uploading'
    const uploadedSet = new Set(checkResult.uploadedChunks || [])
    uploadedCount.value = uploadedSet.size

    for (let i = 0; i < chunks; i++) {
      if (uploadedSet.has(i)) continue

      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, selectedFile.value.size)
      const chunk = selectedFile.value.slice(start, end)

      let retries = 0
      while (retries < MAX_RETRY) {
        try {
          await uploadChunk({
            chunk,
            fileHash: hash,
            chunkIndex: i,
            totalChunks: chunks
          })
          break
        } catch {
          retries++
          if (retries >= MAX_RETRY) {
            throw new Error(`分片 ${i} 上传失败，已重试 ${MAX_RETRY} 次`)
          }
        }
      }
      uploadedCount.value++
    }

    // 4. 合并
    currentPhase.value = 'merging'
    await mergeChunks({
      fileHash: hash,
      fileName: selectedFile.value.name,
      totalChunks: chunks
    })

    // 5. 完成
    currentPhase.value = 'done'
    ElMessage.success('文件上传成功')
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '上传失败'
    ElMessage.error(errorMsg.value)
  } finally {
    uploading.value = false
  }
}

function handleClose() {
  if (uploading.value) return
  selectedFile.value = null
  currentPhase.value = 'idle'
  hashProgress.value = 0
  uploadedCount.value = 0
  totalChunks.value = 0
  isInstant.value = false
  errorMsg.value = ''
  visible.value = false
}
</script>

<style scoped>
.upload-area {
  text-align: center;
}

.progress-area {
  padding: 12px 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.file-name {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.chunk-detail {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.done-area {
  padding: 20px 0;
}
</style>
