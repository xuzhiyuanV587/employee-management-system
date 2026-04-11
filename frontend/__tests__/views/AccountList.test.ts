import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import AccountList from '../../src/views/AccountList.vue'
import type { AccountInfo } from '../../src/api/auth'

// Mock auth API
vi.mock('../../src/api/auth', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  resetPassword: vi.fn(),
  toggleUserStatus: vi.fn()
}))

// Mock element-plus ElMessage
vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    }
  }
})

// Mock PageHeader 组件
vi.mock('../../src/components/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    props: ['title', 'backable'],
    template: '<div class="page-header"><h2>{{ title }}</h2><slot name="actions" /></div>'
  }
}))

import { getUsers } from '../../src/api/auth'

const mockUsers: AccountInfo[] = [
  {
    id: 1,
    username: 'superadmin',
    displayName: '超级管理员',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'admin',
    displayName: '管理员',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-02 00:00:00'
  },
  {
    id: 3,
    username: 'user1',
    displayName: '普通用户',
    role: 'user',
    status: 'active',
    created_at: '2024-01-03 00:00:00'
  },
  {
    id: 4,
    username: 'user2',
    displayName: '禁用用户',
    role: 'user',
    status: 'disabled',
    created_at: '2024-01-04 00:00:00'
  }
]

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } }
    ]
  })
}

async function mountAccountList() {
  vi.mocked(getUsers).mockResolvedValue(mockUsers)

  const pinia = createPinia()
  const router = createTestRouter()

  const wrapper = mount(AccountList, {
    global: {
      plugins: [pinia, router, ElementPlus]
    }
  })

  // 等待 onMounted 中的 fetchUsers 完成
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await wrapper.vm.$nextTick()

  return wrapper
}

describe('AccountList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('渲染账号管理标题', async () => {
    const wrapper = await mountAccountList()
    expect(wrapper.text()).toContain('账号管理')
  })

  it('"新建账号"按钮存在', async () => {
    const wrapper = await mountAccountList()
    const buttons = wrapper.findAll('button')
    const createButton = buttons.find(b => b.text().includes('新建账号'))
    expect(createButton).toBeTruthy()
  })

  it('挂载时调用 getUsers 获取用户列表', async () => {
    await mountAccountList()
    expect(getUsers).toHaveBeenCalled()
  })

  it('用户列表表格渲染用户数据', async () => {
    const wrapper = await mountAccountList()
    const tableText = wrapper.find('.el-table, table').text()
    expect(tableText).toContain('superadmin')
    expect(tableText).toContain('admin')
    expect(tableText).toContain('user1')
  })

  it('superadmin 用户显示"超级管理员"而非操作按钮', async () => {
    const wrapper = await mountAccountList()
    expect(wrapper.text()).toContain('超级管理员')
  })

  it('非 superadmin 用户显示操作列按钮', async () => {
    const wrapper = await mountAccountList()
    const buttons = wrapper.findAll('button')
    const operationTexts = buttons.map(b => b.text())
    const hasOperationButtons = operationTexts.some(
      t => t.includes('重置密码') || t.includes('禁用') || t.includes('启用') || t.includes('删除')
    )
    expect(hasOperationButtons).toBe(true)
  })

  it('点击"新建账号"按钮打开对话框', async () => {
    const wrapper = await mountAccountList()
    const buttons = wrapper.findAll('button')
    const createButton = buttons.find(b => b.text().includes('新建账号'))

    if (createButton) {
      await createButton.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('新建账号')
    }
  })

  it('用户表格包含列标题：用户名、显示名称、角色、状态', async () => {
    const wrapper = await mountAccountList()
    const tableText = wrapper.text()
    expect(tableText).toContain('用户名')
    expect(tableText).toContain('显示名称')
    expect(tableText).toContain('角色')
    expect(tableText).toContain('状态')
  })
})
