import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import RegisterView from '../../src/views/RegisterView.vue'

// Mock auth store
const mockRegister = vi.fn()
vi.mock('../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    register: mockRegister
  }))
}))

// Mock element-plus
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

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/register', component: RegisterView },
      { path: '/login', component: { template: '<div>Login</div>' } }
    ]
  })
}

async function mountRegisterView() {
  const pinia = createPinia()
  const router = createTestRouter()

  const wrapper = shallowMount(RegisterView, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'el-form': {
          template: '<form class="el-form" @submit.prevent><slot /></form>',
          props: ['model', 'rules'],
          methods: { validate: () => Promise.resolve(true) }
        },
        'el-form-item': { template: '<div class="el-form-item"><slot /></div>', props: ['prop'] },
        'el-input': {
          template: '<input class="el-input" :type="type" :placeholder="placeholder" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue', 'type', 'placeholder', 'prefixIcon', 'size', 'showPassword'],
          emits: ['update:modelValue']
        },
        'el-button': {
          template: '<button class="el-button" :type="type" @click="$emit(\'click\')"><slot /></button>',
          props: ['type', 'size', 'loading'],
          emits: ['click']
        },
        'router-link': {
          template: '<a class="router-link" :href="to"><slot /></a>',
          props: ['to']
        }
      }
    }
  })

  await wrapper.vm.$nextTick()
  return wrapper
}

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('渲染标题"员工管理系统"', async () => {
    const wrapper = await mountRegisterView()
    expect(wrapper.text()).toContain('员工管理系统')
  })

  it('渲染副标题"创建新账号"', async () => {
    const wrapper = await mountRegisterView()
    expect(wrapper.text()).toContain('创建新账号')
  })

  it('渲染用户名输入框', async () => {
    const wrapper = await mountRegisterView()
    const inputs = wrapper.findAll('.el-input')
    const usernameInput = inputs.find(
      i => (i.attributes('placeholder') ?? '').includes('用户名')
    )
    expect(usernameInput).toBeTruthy()
  })

  it('渲染显示名称输入框', async () => {
    const wrapper = await mountRegisterView()
    const inputs = wrapper.findAll('.el-input')
    const nameInput = inputs.find(
      i => (i.attributes('placeholder') ?? '').includes('显示名称')
    )
    expect(nameInput).toBeTruthy()
  })

  it('渲染密码输入框', async () => {
    const wrapper = await mountRegisterView()
    const inputs = wrapper.findAll('.el-input')
    const passwordInputs = inputs.filter(
      i => i.attributes('type') === 'password'
    )
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2) // 密码 + 确认密码
  })

  it('渲染注册按钮', async () => {
    const wrapper = await mountRegisterView()
    const buttons = wrapper.findAll('.el-button')
    const registerButton = buttons.find(b => b.text().includes('注 册'))
    expect(registerButton).toBeTruthy()
  })

  it('渲染"已有账号？去登录"链接', async () => {
    const wrapper = await mountRegisterView()
    expect(wrapper.text()).toContain('已有账号')
    expect(wrapper.text()).toContain('去登录')
  })

  it('登录链接指向 /login', async () => {
    const wrapper = await mountRegisterView()
    const link = wrapper.find('.router-link')
    expect(link.attributes('href')).toBe('/login')
  })
})
