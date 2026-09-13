import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mesAnterior, obterPainel } from './api'

vi.mock('../../api/client', () => ({
  requisitar: vi.fn(),
}))

import { requisitar } from '../../api/client'

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mesAnterior', () => {
    it('retorna o mês anterior no formato YYYY-MM', () => {
      expect(mesAnterior('2026-01')).toBe('2025-12')
      expect(mesAnterior('2026-02')).toBe('2026-01')
      expect(mesAnterior('2026-12')).toBe('2026-11')
    })

    it('vira o ano corretamente', () => {
      expect(mesAnterior('2026-01')).toBe('2025-12')
      expect(mesAnterior('2025-01')).toBe('2024-12')
      expect(mesAnterior('2024-01')).toBe('2023-12')
    })

    it('mantém formato com zero à esquerda', () => {
      const resultado = mesAnterior('2026-03')
      expect(resultado).toBe('2026-02')
      expect(resultado).toMatch(/^\d{4}-\d{2}$/)
    })

    it('funciona com todos os meses', () => {
      const meses = [
        ['2026-01', '2025-12'],
        ['2026-02', '2026-01'],
        ['2026-03', '2026-02'],
        ['2026-04', '2026-03'],
        ['2026-05', '2026-04'],
        ['2026-06', '2026-05'],
        ['2026-07', '2026-06'],
        ['2026-08', '2026-07'],
        ['2026-09', '2026-08'],
        ['2026-10', '2026-09'],
        ['2026-11', '2026-10'],
        ['2026-12', '2026-11'],
      ]

      for (const [mes, esperado] of meses) {
        expect(mesAnterior(mes)).toBe(esperado)
      }
    })
  })

  describe('obterPainel', () => {
    it('busca entradas do mês atual e anterior em paralelo', async () => {
      const mockAtual = [
        { id: '1', description: 'Gasto atual', amount: 100 },
      ]
      const mockAnterior = [
        { id: '2', description: 'Gasto anterior', amount: 150 },
      ]

      // Mock Promise.all para garantir que são chamados em paralelo
      vi.mocked(requisitar)
        .mockResolvedValueOnce(mockAtual)
        .mockResolvedValueOnce(mockAnterior)

      const resultado = await obterPainel('2026-02')

      expect(resultado).toEqual({
        atual: mockAtual,
        anterior: mockAnterior,
      })

      // Verifica que foram feitas exatamente 2 chamadas
      expect(requisitar).toHaveBeenCalledTimes(2)
    })

    it('faz requisições para o mês correto', async () => {
      vi.mocked(requisitar)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      await obterPainel('2026-05')

      const chamadas = vi.mocked(requisitar).mock.calls
      expect(chamadas[0][0]).toBe('/api/entries?month=2026-05')
      expect(chamadas[1][0]).toBe('/api/entries?month=2026-04')
    })

    it('faz requisições para o mês anterior corretamente', async () => {
      vi.mocked(requisitar)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      await obterPainel('2026-01')

      const chamadas = vi.mocked(requisitar).mock.calls
      expect(chamadas[0][0]).toBe('/api/entries?month=2026-01')
      expect(chamadas[1][0]).toBe('/api/entries?month=2025-12')
    })

    it('propaga erro se falhar ao buscar mês atual', async () => {
      const erro = new Error('Erro ao buscar')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(obterPainel('2026-02')).rejects.toThrow(erro)
    })

    it('propaga erro se falhar ao buscar mês anterior', async () => {
      const erro = new Error('Erro ao buscar')
      vi.mocked(requisitar)
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(erro)

      await expect(obterPainel('2026-02')).rejects.toThrow(erro)
    })

    it('retorna estrutura correta com entradas vazias', async () => {
      vi.mocked(requisitar)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const resultado = await obterPainel('2026-02')

      expect(resultado).toEqual({
        atual: [],
        anterior: [],
      })
    })

    it('retorna estrutura correta com múltiplas entradas', async () => {
      const mockAtual = [
        { id: '1', description: 'Entrada 1', amount: 100 },
        { id: '2', description: 'Entrada 2', amount: 200 },
        { id: '3', description: 'Entrada 3', amount: 300 },
      ]
      const mockAnterior = [
        { id: '4', description: 'Entrada anterior 1', amount: 150 },
        { id: '5', description: 'Entrada anterior 2', amount: 250 },
      ]

      vi.mocked(requisitar)
        .mockResolvedValueOnce(mockAtual)
        .mockResolvedValueOnce(mockAnterior)

      const resultado = await obterPainel('2026-06')

      expect(resultado.atual).toHaveLength(3)
      expect(resultado.anterior).toHaveLength(2)
      expect(resultado).toEqual({
        atual: mockAtual,
        anterior: mockAnterior,
      })
    })
  })
})
