<template>
  <div class="page-header">
    <template v-if="backable">
      <el-page-header @back="router.back()">
        <template #content>{{ title }}</template>
      </el-page-header>
    </template>
    <h2 v-else class="page-title">{{ title }}</h2>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

withDefaults(defineProps<{
  title: string
  backable?: boolean
}>(), {
  backable: false
})

const router = useRouter()
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2{
  line-height: 32px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>
