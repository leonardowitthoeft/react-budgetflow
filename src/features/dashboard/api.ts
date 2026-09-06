import { requisitar } from '../../api/client'
import type { Entry } from '../../api/types'

/**
 * O painel não tem endpoint próprio no backend.
 *
 * Tudo o que ele mostra sai de /api/entries?month=, que já existe: os
 * totais por tipo, a comparação com o mês anterior e as últimas
 * transações são contas feitas sobre a mesma lista.
 *
 * Isso funciona porque um mês de orçamento doméstico tem dezenas de
 * lançamentos, não milhares. Se um dia passar disso, o caminho é um
 * GET /api/dashboard?month= que devolve só os agregados — aí o servidor
 * soma no banco em vez de mandar tudo pela rede.
 */

export type PainelDoMes = {
  atual: Entry[]
  anterior: Entry[]
}

/** "2026-01" → "2025-12". Vira o ano sozinho. */
export function mesAnterior(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const data = new Date(ano, m - 2, 1)
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

export async function obterPainel(mes: string): Promise<PainelDoMes> {
  // Em paralelo: são independentes, e esperar uma para pedir a outra
  // dobraria o tempo de carregamento à toa.
  const [atual, anterior] = await Promise.all([
    requisitar<Entry[]>(`/api/entries?month=${mes}`),
    requisitar<Entry[]>(`/api/entries?month=${mesAnterior(mes)}`),
  ])

  return { atual, anterior }
}
