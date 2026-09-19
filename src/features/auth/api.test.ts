import { describe, it, expect, beforeEach, vi } from 'vitest'
import { entrar, registrar, sair, verificarAutenticacao, provisionar } from './api'
import { ApiError } from '../../api/client'

// Mock do módulo client
vi.mock('../../api/client', () => ({
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
  requisitar: vi.fn(),
}))

import { requisitar } from '../../api/client'

describe('Autenticação API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('entrar', () => {
    it('faz login com email e senha', async () => {
      const mockToken = { accessToken: 'token123' }
      vi.mocked(requisitar).mockResolvedValueOnce(mockToken)

      await entrar('usuario@email.com', 'senha123')

      expect(requisitar).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'usuario@email.com',
          password: 'senha123',
        }),
      })
    })

    it('propaga erros de requisição', async () => {
      const erro = new ApiError(401, 'Credenciais inválidas')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(entrar('usuario@email.com', 'senha')).rejects.toThrow(erro)
    })
  })

  describe('registrar', () => {
    it('registra novo usuário com email, senha e nome', async () => {
      const mockToken = { accessToken: 'token456' }
      vi.mocked(requisitar).mockResolvedValueOnce(mockToken)

      await registrar('novo@email.com', 'senha123', 'João Silva')

      expect(requisitar).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'novo@email.com',
          password: 'senha123',
          fullName: 'João Silva',
        }),
      })
    })

    it('propaga erros quando email já existe', async () => {
      const erro = new ApiError(409, 'Email já está registrado')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(registrar('existing@email.com', 'senha', 'Nome')).rejects.toThrow(erro)
    })
  })

  describe('sair', () => {
    it('chama endpoint de logout', async () => {
      vi.mocked(requisitar).mockResolvedValueOnce(undefined)

      await sair()

      expect(requisitar).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    })

    it('não lança erro mesmo se logout falhar', async () => {
      vi.mocked(requisitar).mockRejectedValueOnce(new Error('Erro de rede'))

      // Não deve lançar
      await expect(sair()).resolves.toBeUndefined()
    })

    it('não lança erro para ApiError 401', async () => {
      vi.mocked(requisitar).mockRejectedValueOnce(new ApiError(401, 'Não autenticado'))

      // Não deve lançar
      await expect(sair()).resolves.toBeUndefined()
    })
  })

  describe('verificarAutenticacao', () => {
    it('retorna true quando consegue buscar categorias', async () => {
      const mockCategorias = [{ id: '1', name: 'Alimentação' }]
      vi.mocked(requisitar).mockResolvedValueOnce(mockCategorias)

      const resultado = await verificarAutenticacao()

      expect(resultado).toBe(true)
      expect(requisitar).toHaveBeenCalledWith('/api/categories')
    })

    it('retorna false quando recebe 401', async () => {
      const erro = new ApiError(401, 'Sessão expirada')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      const resultado = await verificarAutenticacao()

      expect(resultado).toBe(false)
    })

    it('propaga erros que não são 401', async () => {
      const erro = new ApiError(500, 'Erro interno')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(verificarAutenticacao()).rejects.toThrow(erro)
    })

    it('propaga erros que não são ApiError', async () => {
      const erro = new Error('Erro de rede')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(verificarAutenticacao()).rejects.toThrow(erro)
    })
  })

  describe('provisionar', () => {
    it('chama endpoint de provisão de categorias', async () => {
      const mockProvisionamento = {
        resultado: 'sucesso',
        total: 15,
      }
      vi.mocked(requisitar).mockResolvedValueOnce(mockProvisionamento)

      const resultado = await provisionar()

      expect(resultado).toEqual(mockProvisionamento)
      expect(requisitar).toHaveBeenCalledWith('/api/categories/provision', {
        method: 'POST',
      })
    })

    it('propaga erros de provisão', async () => {
      const erro = new ApiError(400, 'Categorias já provisionadas')
      vi.mocked(requisitar).mockRejectedValueOnce(erro)

      await expect(provisionar()).rejects.toThrow(erro)
    })
  })
})
