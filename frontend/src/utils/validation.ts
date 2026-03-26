export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const phoneRule = {
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value) return callback()
    if (!validatePhone(value)) {
      callback(new Error('请输入正确的11位手机号'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}

export const emailRule = {
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value) return callback()
    if (!validateEmail(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}
