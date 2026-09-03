import { requisitar } from '../../api/client'
import type { Category, Entry, Lookups, NovoLancamento } from '../../api/types'

export async function obterCategorias() {
  return requisitar<Category[]>('/api/categories')
}

export async function obterLookups() {
  return requisitar<Lookups>('/api/lookups')
}

export async function obterLancamentosDoMes(mes: string) {
  return requisitar<Entry[]>(`/api/entries?month=${mes}`)
}

export async function criarLancamento(corpo: NovoLancamento) {
  return requisitar<Entry[]>('/api/entries', {
    method: 'POST',
    body: JSON.stringify(corpo),
  })
}

export async function marcarPago(id: string) {
  return requisitar<Entry>(`/api/entries/${id}/pagar`, { method: 'PATCH' })
}

export async function apagarLancamento(id: string) {
  return requisitar<void>(`/api/entries/${id}`, { method: 'DELETE' })
}
