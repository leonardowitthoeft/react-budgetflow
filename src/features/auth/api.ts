import { requisitar } from '../../api/client'
import type { Category, Provisionamento } from '../../api/types'

export async function entrar(email: string, password: string) {
  await requisitar<{ accessToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registrar(email: string, password: string, fullName: string) {
  await requisitar<{ accessToken: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  })
}

export async function sair() {
  try {
    await requisitar<void>('/api/auth/logout', { method: 'POST' })
  } catch {
    // Mesmo que logout falhe, o cookie será deletado no lado do backend
  }
}

export async function verificarAutenticacao() {
  try {
    await requisitar<Category[]>('/api/categories')
    return true
  } catch (e) {
    const { ApiError } = await import('../../api/client')
    if (e instanceof ApiError && e.status === 401) {
      return false
    }
    throw e
  }
}

export async function provisionar() {
  return requisitar<Provisionamento>('/api/categories/provision', { method: 'POST' })
}
