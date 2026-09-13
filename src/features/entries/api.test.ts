import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  obterCategorias,
  obterLookups,
  obterLancamentosDoMes,
  criarLancamento,
  marcarPago,
  apagarLancamento,
} from './api'

vi.mock('../../api/client', () => ({
  requisitar: vi.fn(),
}))

import { requisitar } from '../../api/client'

describe('Entries API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('obterCategorias', () => {
    it('busca lista de categorias', async () => {
      const mockCategorias = [
        { id: '1', name: 'Alimentação', subcategorias: [] },
        { id: '2', name: 'Transporte', subcategorias: [] },
      ]
      vi.mocked(requisitar).mockResolvedValueOnce(mockCategorias)

      const resultado = await obterCategorias()

      expect(resultado).toEqual(mockCategorias)
      expect(requisitar).toHaveBeenCalledWith('/api/categories')
    })

    it('propaga erros ao buscar categorias', async () => {
      const erro = new Error('Erro de rede')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(obterCategorias()).rejects.toThrow(erro)
    })
  })

  describe('obterLookups', () => {
    it('busca lookups de contas e formas de pagamento', async () => {
      const mockLookups = {
        accounts: [
          { id: '1', name: 'Carteira' },
          { id: '2', name: 'Conta Corrente' },
        ],
        paymentMethods: [
          { id: '1', name: 'Dinheiro' },
          { id: '2', name: 'Cartão Débito' },
        ],
      }
      vi.mocked(requisitar).mockResolvedValueOnce(mockLookups)

      const resultado = await obterLookups()

      expect(resultado).toEqual(mockLookups)
      expect(requisitar).toHaveBeenCalledWith('/api/lookups')
    })

    it('propaga erros ao buscar lookups', async () => {
      const erro = new Error('Servidor indisponível')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(obterLookups()).rejects.toThrow(erro)
    })
  })

  describe('obterLancamentosDoMes', () => {
    it('busca lançamentos do mês especificado', async () => {
      const mockEntries = [
        {
          id: '1',
          description: 'Supermercado',
          amount: 150.0,
          month: '2026-01',
          paid: false,
        },
        {
          id: '2',
          description: 'Combustível',
          amount: 50.0,
          month: '2026-01',
          paid: true,
        },
      ]
      vi.mocked(requisitar).mockResolvedValueOnce(mockEntries)

      const resultado = await obterLancamentosDoMes('2026-01')

      expect(resultado).toEqual(mockEntries)
      expect(requisitar).toHaveBeenCalledWith('/api/entries?month=2026-01')
    })

    it('constrói URL corretamente com parâmetro de mês', async () => {
      vi.mocked(requisitar).mockResolvedValueOnce([])

      await obterLancamentosDoMes('2026-12')

      expect(requisitar).toHaveBeenCalledWith('/api/entries?month=2026-12')
    })

    it('propaga erros ao buscar lançamentos', async () => {
      const erro = new Error('Mês inválido')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(obterLancamentosDoMes('2026-01')).rejects.toThrow(erro)
    })
  })

  describe('criarLancamento', () => {
    it('cria novo lançamento com todos os dados', async () => {
      const novoLancamento = {
        description: 'Compra no mercado',
        amount: 120.5,
        date: '2026-01-15',
        categoryId: '1',
        subcategoryId: '1.1',
        accountId: '1',
        paymentMethodId: '2',
      }

      const mockResponse = [
        { id: '123', ...novoLancamento, paid: false },
      ]
      vi.mocked(requisitar).mockResolvedValueOnce(mockResponse)

      const resultado = await criarLancamento(novoLancamento)

      expect(resultado).toEqual(mockResponse)
      expect(requisitar).toHaveBeenCalledWith('/api/entries', {
        method: 'POST',
        body: JSON.stringify(novoLancamento),
      })
    })

    it('suporta lançamento com parcelas', async () => {
      const novoLancamento = {
        description: 'Compra parcelada',
        amount: 300,
        date: '2026-01-15',
        categoryId: '1',
        subcategoryId: '1.1',
        accountId: '1',
        paymentMethodId: '3',
        totalParcelas: 3,
      }

      vi.mocked(requisitar).mockResolvedValueOnce([])

      await criarLancamento(novoLancamento)

      expect(requisitar).toHaveBeenCalledWith('/api/entries', {
        method: 'POST',
        body: JSON.stringify(novoLancamento),
      })
    })

    it('propaga erros ao criar lançamento', async () => {
      const erro = new Error('Dados inválidos')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(
        criarLancamento({
          description: 'Teste',
          amount: 100,
          date: '2026-01-15',
          categoryId: '1',
          subcategoryId: '1.1',
          accountId: '1',
          paymentMethodId: '1',
        }),
      ).rejects.toThrow(erro)
    })
  })

  describe('marcarPago', () => {
    it('marca lançamento como pago', async () => {
      const mockEntry = {
        id: '123',
        description: 'Compra',
        amount: 100,
        paid: true,
      }
      vi.mocked(requisitar).mockResolvedValueOnce(mockEntry)

      const resultado = await marcarPago('123')

      expect(resultado).toEqual(mockEntry)
      expect(requisitar).toHaveBeenCalledWith('/api/entries/123/pagar', { method: 'PATCH' })
    })

    it('propaga erros ao marcar como pago', async () => {
      const erro = new Error('Lançamento não encontrado')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(marcarPago('inexistente')).rejects.toThrow(erro)
    })
  })

  describe('apagarLancamento', () => {
    it('deleta lançamento por ID', async () => {
      vi.mocked(requisitar).mockResolvedValueOnce(undefined)

      await apagarLancamento('123')

      expect(requisitar).toHaveBeenCalledWith('/api/entries/123', { method: 'DELETE' })
    })

    it('retorna undefined após deletar', async () => {
      vi.mocked(requisitar).mockResolvedValueOnce(undefined)

      const resultado = await apagarLancamento('123')

      expect(resultado).toBeUndefined()
    })

    it('propaga erros ao deletar', async () => {
      const erro = new Error('Erro ao deletar')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(apagarLancamento('123')).rejects.toThrow(erro)
    })
  })
})
