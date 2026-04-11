import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '../api/auth'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string, remember = false) {
    const result = await loginApi({ username, password, remember })
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
  }

  async function register(username: string, password: string, displayName: string) {
    const result = await registerApi({ username, password, displayName })
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
  }

  async function fetchUser() {
    try {
      user.value = await getMe()
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchUser, logout }
})
