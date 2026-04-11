import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth'

// Mock auth API
vi.mock('../../src/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn()
}))

import { login as loginApi, register as registerApi, getMe } from '../../src/api/auth'

const mockUser = {
  id: 1,
  username: 'testuser',
  displayName: '测试用户',
  role: 'user' as const
}

const mockAdminUser = {
  id: 2,
  username: 'admin',
  displayName: '管理员',
  role: 'admin' as const
}

const mockLoginResult = {
  token: 'mock-token-123',
  user: mockUser
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('login action', () => {
    it('调用 loginApi 并设置 token 和 user', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(loginApi).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        remember: false
      })
      expect(store.token).toBe('mock-token-123')
      expect(store.user).toEqual(mockUser)
    })

    it('登录后将 token 存储到 localStorage', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(localStorage.getItem('token')).toBe('mock-token-123')
    })

    it('支持 remember 参数', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123', true)

      expect(loginApi).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        remember: true
      })
    })

    it('登录失败时抛出错误', async () => {
      vi.mocked(loginApi).mockRejectedValue(new Error('用户名或密码错误'))

      const store = useAuthStore()
      await expect(store.login('testuser', 'wrongpass')).rejects.toThrow('用户名或密码错误')
    })
  })

  describe('register action', () => {
    it('调用 registerApi 并设置 token 和 user', async () => {
      vi.mocked(registerApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.register('testuser', 'password123', '测试用户')

      expect(registerApi).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        displayName: '测试用户'
      })
      expect(store.token).toBe('mock-token-123')
      expect(store.user).toEqual(mockUser)
    })

    it('注册后将 token 存储到 localStorage', async () => {
      vi.mocked(registerApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.register('testuser', 'password123', '测试用户')

      expect(localStorage.getItem('token')).toBe('mock-token-123')
    })

    it('注册失败时抛出错误', async () => {
      vi.mocked(registerApi).mockRejectedValue(new Error('用户名已存在'))

      const store = useAuthStore()
      await expect(store.register('testuser', 'password123', '测试用户')).rejects.toThrow('用户名已存在')
    })
  })

  describe('logout action', () => {
    it('清除 token 和 user', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      store.logout()

      expect(store.token).toBe('')
      expect(store.user).toBeNull()
    })

    it('从 localStorage 移除 token', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')
      expect(localStorage.getItem('token')).toBe('mock-token-123')

      store.logout()

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('fetchUser action', () => {
    it('成功时获取并设置用户信息', async () => {
      vi.mocked(getMe).mockResolvedValue(mockUser)

      const store = useAuthStore()
      await store.fetchUser()

      expect(getMe).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
    })

    it('失败时自动调用 logout', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)
      vi.mocked(getMe).mockRejectedValue(new Error('未授权'))

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      // 登录后 token 存在
      expect(store.token).toBe('mock-token-123')

      await store.fetchUser()

      // fetchUser 失败后应自动 logout
      expect(store.token).toBe('')
      expect(store.user).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('isLoggedIn computed', () => {
    it('有 token 时返回 true', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)

      await store.login('testuser', 'password123')
      expect(store.isLoggedIn).toBe(true)
    })

    it('无 token 时返回 false', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('logout 后返回 false', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')
      expect(store.isLoggedIn).toBe(true)

      store.logout()
      expect(store.isLoggedIn).toBe(false)
    })

    it('从 localStorage 读取初始 token 时返回 true', () => {
      localStorage.setItem('token', 'existing-token')
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(true)
    })
  })

  describe('isAdmin computed', () => {
    it('user.role === admin 时返回 true', async () => {
      vi.mocked(loginApi).mockResolvedValue({
        token: 'admin-token',
        user: mockAdminUser
      })

      const store = useAuthStore()
      await store.login('admin', 'password123')

      expect(store.isAdmin).toBe(true)
    })

    it('user.role !== admin 时返回 false', async () => {
      vi.mocked(loginApi).mockResolvedValue(mockLoginResult)

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(store.isAdmin).toBe(false)
    })

    it('未登录时返回 false', () => {
      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })
  })
})
