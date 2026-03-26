<template>
  <div class="account-list">
    <PageHeader title="账号管理">
      <template #actions>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon> 新建账号
        </el-button>
      </template>
    </PageHeader>

    <el-card shadow="never">
      <el-table :data="users" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="displayName" label="显示名称" width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : ''">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="{ row }">
            <template v-if="row.username !== 'superadmin'">
              <el-button link type="primary" @click="openResetPassword(row)">重置密码</el-button>
              <el-button link :type="row.status === 'active' ? 'warning' : 'success'" @click="handleToggleStatus(row)">
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-popconfirm title="确定删除该账号吗？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
            <span v-else style="color: #909399; font-size: 12px">超级管理员</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建账号对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建账号" width="460px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="至少3个字符" />
        </el-form-item>
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="createForm.displayName" placeholder="请输入显示名称" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="至少6个字符" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="showResetDialog" title="重置密码" width="420px">
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="80px">
        <el-form-item label="账号">
          <el-input :model-value="resetTarget?.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetForm.password" type="password" placeholder="至少6个字符" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResetDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleResetPassword">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { AccountInfo } from '../api/auth'
import { getUsers, createUser, deleteUser, resetPassword, toggleUserStatus } from '../api/auth'
import PageHeader from '../components/PageHeader.vue'

const users = ref<AccountInfo[]>([])
const loading = ref(false)
const submitting = ref(false)

// 新建
const showCreateDialog = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = ref({ username: '', displayName: '', password: '' })
const createRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, message: '至少3个字符', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6个字符', trigger: 'blur' }]
}

// 重置密码
const showResetDialog = ref(false)
const resetFormRef = ref<FormInstance>()
const resetTarget = ref<AccountInfo | null>(null)
const resetForm = ref({ password: '' })
const resetRules: FormRules = {
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '至少6个字符', trigger: 'blur' }]
}

onMounted(() => fetchUsers())

async function fetchUsers() {
  loading.value = true
  try {
    users.value = await getUsers()
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!createFormRef.value) return
  await createFormRef.value.validate()
  submitting.value = true
  try {
    await createUser(createForm.value)
    ElMessage.success('账号创建成功')
    showCreateDialog.value = false
    createForm.value = { username: '', displayName: '', password: '' }
    await fetchUsers()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: AccountInfo) {
  try {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    await fetchUsers()
  } catch {
    // handled by interceptor
  }
}

function openResetPassword(row: AccountInfo) {
  resetTarget.value = row
  resetForm.value = { password: '' }
  showResetDialog.value = true
}

async function handleResetPassword() {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate()
  submitting.value = true
  try {
    await resetPassword(resetTarget.value!.id, resetForm.value.password)
    ElMessage.success('密码重置成功')
    showResetDialog.value = false
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(row: AccountInfo) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  try {
    await toggleUserStatus(row.id, newStatus as 'active' | 'disabled')
    ElMessage.success(newStatus === 'active' ? '已启用' : '已禁用')
    await fetchUsers()
  } catch {
    // handled by interceptor
  }
}
</script>

<style scoped>
.account-list {
  padding: 20px;
}
</style>