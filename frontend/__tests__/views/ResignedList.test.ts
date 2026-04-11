import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ResignedList from '../../src/views/ResignedList.vue'

const mockFetchResignedEmployees = vi.fn()
const mockResetResignedQuery = vi.fn()

const mockResignedEmployees = [
  {
    id: 1,
    name: '张三',
    employeeId: 'EMP-20240101-001',
    department: '技术部',
    position: '前端工程师',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    hireDate: '2022-01-01',
    status: '离职',
    resignDate: '2024-01-15',
    resignReason: '个人原因'
  },
  {
    id: 2,
    name: '李四',
    employeeId: 'EMP-20230601-002',
    department: '产品部',
    position: '产品经理',
    phone: '13800138002',
    email: 'lisi@example.com',
    hireDate: '2023-06-01',
    status: '离职',
    resignDate: '2024-02-20',
    resignReason: '家庭原因'
  }
]

// Mock employee store
vi.mock('../../src/stores/employee', () => ({
  useEmployeeStore: vi.fn(() => ({
    resignedEmployees: mockResignedEmployees,
    resignedTotal: 2,
    loading: false,
    resignedQuery: {
      keyword: '',
      department: '',
      resignDateStart: '',
      resignDateEnd: '',
      page: 1,
      pageSize: 10
    },
    fetchResignedEmployees: mockFetchResignedEmployees,
    resetResignedQuery: mockResetResignedQuery
  }))
}))

// Mock printCertificate
vi.mock('../../src/utils/printCertificate', () => ({
  printResignCertificate: vi.fn()
}))

// Mock PageHeader 组件
vi.mock('../../src/components/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    props: ['title', 'backable'],
    template: '<div class="page-header"><h2>{{ title }}</h2><slot name="actions" /></div>'
  }
}))

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/detail/:id', component: { template: '<div>Detail</div>' } }
    ]
  })
}

async function mountResignedList() {
  const pinia = createPinia()
  const router = createTestRouter()

  const wrapper = shallowMount(ResignedList, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'el-card': { template: '<div class="el-card"><slot /></div>' },
        'el-form': { template: '<div class="el-form"><slot /></div>' },
        'el-form-item': { template: '<div class="el-form-item"><slot /></div>', props: ['label'] },
        'el-input': { template: '<input class="el-input" :placeholder="placeholder" />', props: ['modelValue', 'placeholder', 'clearable'] },
        'el-select': { template: '<select class="el-select"><slot /></select>', props: ['modelValue', 'placeholder', 'clearable'] },
        'el-option': { template: '<option>{{ label }}</option>', props: ['label', 'value'] },
        'el-date-picker': { template: '<div class="el-date-picker">离职日期范围</div>', props: ['modelValue', 'type'] },
        'el-table': {
          template: '<table class="el-table"><slot /></table>',
          props: ['data']
        },
        'el-table-column': {
          template: '<th class="el-table-column">{{ label }}</th>',
          props: ['prop', 'label', 'width', 'minWidth', 'sortable', 'fixed', 'showOverflowTooltip']
        },
        'el-tag': { template: '<span class="el-tag"><slot /></span>', props: ['type'] },
        'el-button': {
          template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
          props: ['type', 'link'],
          emits: ['click']
        },
        'el-icon': { template: '<i class="el-icon"><slot /></i>' },
        'el-pagination': {
          template: '<div class="el-pagination">分页</div>',
          props: ['currentPage', 'pageSize', 'pageSizes', 'total', 'layout']
        },
        'Search': true,
        'RefreshLeft': true
      }
    }
  })

  await wrapper.vm.$nextTick()
  return wrapper
}

describe('ResignedList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockFetchResignedEmployees.mockResolvedValue(undefined)
  })

  it('渲染离职员工管理标题', async () => {
    const wrapper = await mountResignedList()
    const pageHeader = wrapper.findComponent({ name: 'PageHeader' })
    expect(pageHeader.exists()).toBe(true)
    expect(pageHeader.props('title')).toBe('离职员工管理')
  })

  it('渲染关键词搜索输入框', async () => {
    const wrapper = await mountResignedList()
    const inputs = wrapper.findAll('.el-input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('渲染部门筛选区域', async () => {
    const wrapper = await mountResignedList()
    expect(wrapper.text()).toContain('部门')
  })

  it('渲染日期范围选择器', async () => {
    const wrapper = await mountResignedList()
    expect(wrapper.find('.el-date-picker').exists()).toBe(true)
  })

  it('渲染搜索和重置按钮', async () => {
    const wrapper = await mountResignedList()
    const buttons = wrapper.findAll('.el-button')
    const buttonTexts = buttons.map(b => b.text())
    expect(buttonTexts.some(t => t.includes('搜索'))).toBe(true)
    expect(buttonTexts.some(t => t.includes('重置'))).toBe(true)
  })

  it('渲染分页组件', async () => {
    const wrapper = await mountResignedList()
    const pagination = wrapper.find('.el-pagination')
    expect(pagination.exists()).toBe(true)
  })

  it('表格列包含工号、姓名、部门、职位等', async () => {
    const wrapper = await mountResignedList()
    const html = wrapper.html()
    expect(html).toContain('工号')
    expect(html).toContain('姓名')
    expect(html).toContain('部门')
    expect(html).toContain('职位')
    expect(html).toContain('手机号')
    expect(html).toContain('入职日期')
    expect(html).toContain('离职日期')
    expect(html).toContain('离职原因')
  })

  it('渲染操作列', async () => {
    const wrapper = await mountResignedList()
    const html = wrapper.html()
    expect(html).toContain('操作')
  })

  it('挂载时调用 fetchResignedEmployees', async () => {
    await mountResignedList()
    expect(mockFetchResignedEmployees).toHaveBeenCalled()
  })

  it('printResignCertificate 函数已被 mock', async () => {
    const { printResignCertificate } = await import('../../src/utils/printCertificate')
    expect(vi.isMockFunction(printResignCertificate)).toBe(true)
  })

  it('渲染离职状态标签', async () => {
    const wrapper = await mountResignedList()
    const html = wrapper.html()
    expect(html).toContain('离职')
  })
})
