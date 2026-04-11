<template>
  <!-- 登录页不显示 header -->
  <template v-if="route.path === '/login'">
    <router-view />
  </template>
  <el-container v-else class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <h1 class="app-title" @click="router.push('/')">员工管理系统</h1>
        <nav class="header-nav">
          <el-button text :class="{ active: route.path === '/' }" @click="router.push('/')">员工管理</el-button>
          <el-button text :class="{ active: route.path === '/resigned' }" @click="router.push('/resigned')">离职员工</el-button>
          <el-button text :class="{ active: route.path === '/files' }" @click="router.push('/files')">下载管理</el-button>
          <el-button v-if="authStore.isAdmin" text :class="{ active: route.path === '/accounts' }" @click="router.push('/accounts')">账号管理</el-button>
        </nav>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            {{ authStore.user?.displayName || authStore.user?.username || '用户' }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isLoggedIn && !authStore.user) {
    authStore.fetchUser()
  }
})

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.header-nav .el-button {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.header-nav .el-button.active,
.header-nav .el-button:hover {
  color: #fff;
}

.app-title {
  margin: 0;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.app-main {
  padding: 0;
}
</style>
