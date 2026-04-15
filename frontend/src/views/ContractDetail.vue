<template>
  <div class="contract-detail">
    <PageHeader title="合同详情" :backable="true" />

    <template v-if="store.loading && !store.currentTemplate">
      <el-card shadow="never">
        <el-skeleton :rows="4" animated />
      </el-card>
    </template>

    <template v-else-if="store.currentTemplate">
      <!-- 1. 模板信息区 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>模板信息</span>
            <el-button type="primary" plain size="small" @click="showReparseDialog = true">
              重新识别
            </el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">{{ store.currentTemplate.name }}</el-descriptions-item>
          <el-descriptions-item label="文件名">{{ store.currentTemplate.original_filename }}</el-descriptions-item>
          <el-descriptions-item label="识别规则">
            <el-tag :type="store.currentTemplate.placeholder_rule === 'underscore' ? 'primary' : 'warning'">
              {{ store.currentTemplate.placeholder_rule === 'underscore' ? '下划线' : '自定义' }}
            </el-tag>
            <span v-if="store.currentTemplate.custom_pattern" class="custom-pattern-text">
              （正则：{{ store.currentTemplate.custom_pattern }}）
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ formatDate(store.currentTemplate.created_at) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 2. 空白项与填写区 -->
      <el-card shadow="never" class="fill-card">
        <template #header>
          <span>空白项填写</span>
        </template>
        <div v-if="store.currentTemplate.placeholders?.length">
          <div class="form-panel">
            <el-form :model="fillForm" label-width="200px">
              <el-form-item
                v-for="ph in store.currentTemplate.placeholders"
                :key="ph.key"
                :label="ph.label"
              >
                <el-input
                  v-model="fillForm[ph.key]"
                  :placeholder="`请输入${ph.label}`"
                  clearable
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="filling"
                  @click="handleFill"
                >
                  生成合同
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <el-empty v-else description="未识别到空白项，请尝试重新识别" />
      </el-card>

      <!-- 3. 使用记录区 -->
      <el-card shadow="never" class="records-card">
        <template #header>
          <span>使用记录</span>
        </template>
        <el-table
          v-loading="store.loading"
          :data="store.records"
          style="width: 50%"
        >
          <el-table-column prop="filled_by" label="填写人" width="120" align="center" />
          <el-table-column label="填写时间" width="160" align="center">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="240" align="center">
            <template #default="{ row }">
              <div class="record-actions">
                <el-button text type="primary" @click="handleViewData(row)">查看数据</el-button>
                <el-button text type="success" @click="handleDownload(row)">下载合同</el-button>
                <el-button text type="danger" @click="handleDeleteRecord(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="store.recordsQuery.page"
            v-model:page-size="store.recordsQuery.pageSize"
            :total="store.recordsTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="loadRecords"
            @size-change="loadRecords"
          />
        </div>
      </el-card>
    </template>

    <el-empty v-else description="模板不存在或已删除" />

    <!-- 重新识别对话框 -->
    <el-dialog
      v-model="showReparseDialog"
      title="重新识别空白项"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form :model="reparseForm" label-width="110px">
        <el-form-item label="识别规则">
          <el-radio-group v-model="reparseForm.rule">
            <el-radio value="underscore">下划线（____）</el-radio>
            <el-radio value="custom">自定义正则</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reparseForm.rule === 'custom'" label="正则表达式">
          <el-input
            v-model="reparseForm.customPattern"
            placeholder="如：\{\{(.+?)\}\}"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReparseDialog = false">取消</el-button>
        <el-button type="primary" :loading="reparsing" @click="handleReparse">确认识别</el-button>
      </template>
    </el-dialog>

    <!-- 查看填写数据对话框 -->
    <el-dialog
      v-model="showDataDialog"
      title="填写数据"
      width="560px"
    >
      <div class="fill-data-content">
        <el-descriptions :column="1" border v-if="selectedRecord">
          <el-descriptions-item
            v-for="(value, key) in selectedRecord.fill_data"
            :key="key"
            :label="String(key)"
          >
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveAs } from 'file-saver'
import PageHeader from '../components/PageHeader.vue'
import { useContractStore } from '../stores/contract'
import { deleteContractRecord, downloadContractRecord } from '../api/contract'
import type { ContractRecord } from '../types/contract'

const route = useRoute()
const store = useContractStore()
const templateId = Number(route.params.id)

// 填写表单
const fillForm = reactive<Record<string, string>>({})
const filling = ref(false)

// 重新识别
const showReparseDialog = ref(false)
const reparsing = ref(false)
const reparseForm = reactive({
  rule: 'underscore',
  customPattern: ''
})

// 查看数据
const showDataDialog = ref(false)
const selectedRecord = ref<ContractRecord | null>(null)

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

async function handleFill() {
  if (!store.currentTemplate?.placeholders?.length) return

  const missing = store.currentTemplate.placeholders.filter(ph => !fillForm[ph.key]?.trim())
  if (missing.length > 0) {
    ElMessage.warning(`请填写：${missing.map(ph => ph.label).join('、')}`)
    return
  }

  filling.value = true
  try {
    await store.fillTemplate(templateId, { ...fillForm })
    ElMessage.success('合同生成成功')
    loadRecords()
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    filling.value = false
  }
}

async function handleReparse() {
  if (reparseForm.rule === 'custom' && !reparseForm.customPattern.trim()) {
    ElMessage.warning('请输入正则表达式')
    return
  }
  reparsing.value = true
  try {
    await store.reparseTemplate(
      templateId,
      reparseForm.rule,
      reparseForm.rule === 'custom' ? reparseForm.customPattern.trim() : undefined
    )
    ElMessage.success('重新识别成功')
    showReparseDialog.value = false
    // 重置填写表单
    Object.keys(fillForm).forEach(key => delete fillForm[key])
  } catch (error) {
    ElMessage.error('识别失败，请重试')
  } finally {
    reparsing.value = false
  }
}

function handleViewData(row: ContractRecord) {
  selectedRecord.value = row
  showDataDialog.value = true
}

async function handleDownload(row: ContractRecord) {
  try {
    const blob = await downloadContractRecord(row.id)
    const filename = `合同_${row.id}_${new Date(row.created_at).toLocaleDateString('zh-CN').replace(/\//g, '-')}.docx`
    saveAs(blob, filename)
  } catch (error) {
    ElMessage.error('下载失败，请重试')
  }
}

async function handleDeleteRecord(row: ContractRecord) {
  try {
    await ElMessageBox.confirm('确定删除这条使用记录吗？删除后无法恢复。', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteContractRecord(row.id)
    ElMessage.success('删除成功')
    loadRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

function loadRecords() {
  store.fetchRecords(templateId)
}

onMounted(async () => {
  await store.fetchTemplate(templateId)
  loadRecords()
})
</script>

<style scoped>
.contract-detail {
  padding: 20px;
}

.info-card,
.fill-card,
.records-card {
  margin-top: 16px;
}

.info-card {
  margin-top: 0;
}

.info-card:first-of-type {
  margin-top: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-pattern-text {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.form-panel {
  flex: 1;
}

.form-panel :deep(.el-form-item__label) {
  white-space: normal;
  text-align: right;
  line-height: 1.5;
  word-break: break-all;
}

.record-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.fill-data-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
