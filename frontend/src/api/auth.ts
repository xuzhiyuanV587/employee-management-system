import api from './index'

export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterParams {
  username: string
  password: string
  displayName: string
}

export interface UserInfo {
  id: number
  username: string
  displayName: string
  role: 'admin' | 'user'
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface AccountInfo {
  id: number
  username: string
  displayName: string
  role: string
  status: string
  created_at: string
  updated_at?: string
}

export function login(params: LoginParams): Promise<LoginResult> {
  return api.post('/auth/login', params).then(res => res.data as LoginResult)
}

export function register(params: RegisterParams): Promise<LoginResult> {
  return api.post('/auth/register', params).then(res => res.data as LoginResult)
}

export function getMe(): Promise<UserInfo> {
  return api.get('/auth/me').then(res => res.data as UserInfo)
}

export function getUsers(): Promise<AccountInfo[]> {
  return api.get('/auth/users').then(res => res.data as AccountInfo[])
}

export function createUser(data: { username: string; password: string; displayName: string }): Promise<AccountInfo> {
  return api.post('/auth/users', data).then(res => res.data as AccountInfo)
}

export function deleteUser(id: number): Promise<void> {
  return api.delete(`/auth/users/${id}`).then(() => undefined)
}

export function resetPassword(id: number, password: string): Promise<void> {
  return api.put(`/auth/users/${id}/reset-password`, { password }).then(() => undefined)
}

export function toggleUserStatus(id: number, status: 'active' | 'disabled'): Promise<void> {
  return api.put(`/auth/users/${id}/status`, { status }).then(() => undefined)
}
