import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import LoginView from '../../src/views/LoginView.vue'

// Mock auth store
vi.mock('../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn()
  }))
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

import { useAuthStore } from '../../src/stores/auth'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: LoginView },
      { path: '/register', component: { template: '<div>Register</div>' } }
    ]
  })
}

function mountLoginView() {
  const pinia = createPinia()
  const router = createTestRouter()

  return mount(LoginView, {
    global: {
      plugins: [pinia, router, ElementPlus]
    }
  })
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('渲染标题 "员工管理系统"', () => {
    const wrapper = mountLoginView()
    expect(wrapper.find('h2.login-title').text()).toBe('员工管理系统')
  })

  it('渲染副标题 "请登录您的账号"', () => {
    const wrapper = mountLoginView()
    expect(wrapper.find('p.login-subtitle').text()).toBe('请登录您的账号')
  })

  it('渲染用户名输入框', () => {
    const wrapper = mountLoginView()
    const inputs = wrapper.findAll('input')
    const usernameInput = inputs.find(
      i => i.attributes('placeholder') === '用户名'
    )
    expect(usernameInput).toBeTruthy()
  })

  it('渲染密码输入框', () => {
    const wrapper = mountLoginView()
    const inputs = wrapper.findAll('input')
    const passwordInput = inputs.find(
      i => i.attributes('placeholder') === '密码'
    )
    expect(passwordInput).toBeTruthy()
  })

  it('渲染"记住我"复选框', () => {
    const wrapper = mountLoginView()
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('渲染"没有账号？去注册"链接', () => {
    const wrapper = mountLoginView()
    const footer = wrapper.find('.login-footer')
    expect(footer.text()).toContain('没有账号？')
    const link = footer.find('a')
    expect(link.text()).toBe('去注册')
    expect(link.attributes('href')).toContain('/register')
  })

  it('表单提交时调用 authStore.login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin
    } as unknown as ReturnType<typeof useAuthStore>)

    const wrapper = mountLoginView()

    // 填入用户名和密码
    const inputs = wrapper.findAll('input')
    const usernameInput = inputs.find(i => i.attributes('placeholder') === '用户名')
    const passwordInput = inputs.find(i => i.attributes('placeholder') === '密码')

    if (usernameInput) {
      await usernameInput.setValue('testuser')
    }
    if (passwordInput) {
      await passwordInput.setValue('password123')
    }

    // 直接调用组件内部的 handleLogin，模拟 el-form validate 通过
    const vm = wrapper.vm as unknown as { handleLogin: () => Promise<void> }
    // mock formRef.value.validate 让验证通过
    const formRef = (wrapper.vm as unknown as { formRef: { value: { validate: () => Promise<boolean> } } }).formRef
    if (formRef?.value) {
      formRef.value.validate = vi.fn().mockResolvedValue(true)
    }

    // 点击登录按钮
    const loginButton = wrapper.find('.el-button--primary')
    if (loginButton.exists()) {
      await loginButton.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockLogin).toHaveBeenCalled()
    } else {
      // 直接调用方法作为备选
      await vm.handleLogin()
      expect(mockLogin).toHaveBeenCalled()
    }
  })

  it('登录容器渲染正确', () => {
    const wrapper = mountLoginView()
    expect(wrapper.find('.login-container').exists()).toBe(true)
    expect(wrapper.find('.login-card').exists()).toBe(true)
  })
})
