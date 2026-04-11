import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock api/index (Axios 实例)
vi.mock('../../src/api/index', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn()
  }
}))

import api from '../../src/api/index'
import { login, register, getMe, getUsers, createUser, deleteUser, resetPassword, toggleUserStatus } from '../../src/api/auth'
import type { LoginResult, UserInfo } from '../../src/api/auth'

const mockUser: UserInfo = {
  id: 1,
  username: 'testuser',
  displayName: '测试用户',
  role: 'user'
}

const mockLoginResult: LoginResult = {
  token: 'mock-token-abc',
  user: mockUser
}

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('发起 POST /auth/login 请求', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockLoginResult })

      await login({ username: 'testuser', password: 'password123' })

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      })
    })

    it('返回 token 和 user', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockLoginResult })

      const result = await login({ username: 'testuser', password: 'password123' })

      expect(result).toEqual(mockLoginResult)
      expect(result.token).toBe('mock-token-abc')
      expect(result.user).toEqual(mockUser)
    })

    it('支持 remember 参数', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockLoginResult })

      await login({ username: 'testuser', password: 'password123', remember: true })

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
        remember: true
      })
    })

    it('请求失败时抛出错误', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('网络错误'))

      await expect(login({ username: 'testuser', password: 'wrong' })).rejects.toThrow('网络错误')
    })
  })

  describe('register', () => {
    it('发起 POST /auth/register 请求', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockLoginResult })

      await register({ username: 'newuser', password: 'password123', displayName: '新用户' })

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        password: 'password123',
        displayName: '新用户'
      })
    })

    it('返回 token 和 user', async () => {
      const registerResult: LoginResult = {
        token: 'new-user-token',
        user: { ...mockUser, username: 'newuser', displayName: '新用户' }
      }
      vi.mocked(api.post).mockResolvedValue({ data: registerResult })

      const result = await register({
        username: 'newuser',
        password: 'password123',
        displayName: '新用户'
      })

      expect(result).toEqual(registerResult)
      expect(result.token).toBe('new-user-token')
    })

    it('请求失败时抛出错误', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('用户名已存在'))

      await expect(
        register({ username: 'existing', password: 'password123', displayName: '已存在' })
      ).rejects.toThrow('用户名已存在')
    })
  })

  describe('getMe', () => {
    it('发起 GET /auth/me 请求', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      await getMe()

      expect(api.get).toHaveBeenCalledWith('/auth/me')
    })

    it('返回用户信息', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const result = await getMe()

      expect(result).toEqual(mockUser)
      expect(result.id).toBe(1)
      expect(result.username).toBe('testuser')
      expect(result.role).toBe('user')
    })

    it('请求失败时抛出错误', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('未授权'))

      await expect(getMe()).rejects.toThrow('未授权')
    })
  })

  describe('getUsers', () => {
    it('发起 GET /auth/users 请求', async () => {
      const mockUsers = [{ id: 1, username: 'admin', displayName: '管理员', role: 'admin', status: 'active', created_at: '2026-01-01' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockUsers })

      const result = await getUsers()
      expect(api.get).toHaveBeenCalledWith('/auth/users')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('createUser', () => {
    it('发起 POST /auth/users 请求', async () => {
      const newUser = { id: 2, username: 'newuser', displayName: '新用户', role: 'user', status: 'active', created_at: '2026-04-08' }
      vi.mocked(api.post).mockResolvedValue({ data: newUser })

      const result = await createUser({ username: 'newuser', password: 'pass123', displayName: '新用户' })
      expect(api.post).toHaveBeenCalledWith('/auth/users', { username: 'newuser', password: 'pass123', displayName: '新用户' })
      expect(result).toEqual(newUser)
    })
  })

  describe('deleteUser', () => {
    it('发起 DELETE /auth/users/:id 请求', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteUser(5)
      expect(api.delete).toHaveBeenCalledWith('/auth/users/5')
    })
  })

  describe('resetPassword', () => {
    it('发起 PUT /auth/users/:id/reset-password 请求', async () => {
      vi.mocked(api.put).mockResolvedValue({})

      await resetPassword(3, 'newpass123')
      expect(api.put).toHaveBeenCalledWith('/auth/users/3/reset-password', { password: 'newpass123' })
    })
  })

  describe('toggleUserStatus', () => {
    it('发起 PUT /auth/users/:id/status 请求', async () => {
      vi.mocked(api.put).mockResolvedValue({})

      await toggleUserStatus(3, 'disabled')
      expect(api.put).toHaveBeenCalledWith('/auth/users/3/status', { status: 'disabled' })
    })
  })
})
