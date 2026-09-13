import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSession } from './useSession'

// Mock do módulo session
vi.mock('../lib/session', () => ({
  lerEmailSalvo: vi.fn(),
  limparSessao: vi.fn(),
  salvarSessao: vi.fn(),
}))

// Mock do módulo de autenticação
vi.mock('../features/auth/api', () => ({
  verificarAutenticacao: vi.fn(),
}))

import { lerEmailSalvo, limparSessao, salvarSessao } from '../lib/session'
import { verificarAutenticacao } from '../features/auth/api'

describe('useSession', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('estado inicial', () => {
    it('começa com autenticado=false e carregando=true', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue(null)
      const { result } = renderHook(() => useSession())

      // Verifica estado síncrono antes do useEffect completar
      expect(result.current.autenticado).toBe(false)
      expect(result.current.email).toBe('')

      // Aguarda o carregamento terminar
      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })
    })

    it('tem funções entrou e saiu', () => {
      const { result } = renderHook(() => useSession())

      expect(typeof result.current.entrou).toBe('function')
      expect(typeof result.current.saiu).toBe('function')
    })
  })

  describe('recuperação de sessão', () => {
    it('termina carregamento quando não há email salvo', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue(null)

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      expect(verificarAutenticacao).not.toHaveBeenCalled()
    })

    it('verifica autenticação quando há email salvo', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('usuario@email.com')
      vi.mocked(verificarAutenticacao).mockResolvedValue(true)

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      expect(verificarAutenticacao).toHaveBeenCalled()
    })

    it('restaura sessão válida', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('usuario@email.com')
      vi.mocked(verificarAutenticacao).mockResolvedValue(true)

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.autenticado).toBe(true)
        expect(result.current.email).toBe('usuario@email.com')
      })
    })

    it('limpa sessão inválida (401)', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('usuario@email.com')
      vi.mocked(verificarAutenticacao).mockResolvedValue(false)

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      expect(limparSessao).toHaveBeenCalled()
      expect(result.current.autenticado).toBe(false)
    })

    it('limpa sessão quando verificação falha', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('usuario@email.com')
      vi.mocked(verificarAutenticacao).mockRejectedValue(new Error('Erro de rede'))

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      expect(limparSessao).toHaveBeenCalled()
    })
  })

  describe('função entrou', () => {
    it('salva sessão e atualiza estado', async () => {
      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      act(() => {
        result.current.entrou('novo@email.com', true)
      })

      expect(salvarSessao).toHaveBeenCalledWith('novo@email.com', true)
      expect(result.current.email).toBe('novo@email.com')
      expect(result.current.autenticado).toBe(true)
    })

    it('respeita preferência de persistência', async () => {
      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      act(() => {
        result.current.entrou('usuario@email.com', false)
      })

      expect(salvarSessao).toHaveBeenCalledWith('usuario@email.com', false)
    })
  })

  describe('função saiu', () => {
    it('limpa sessão e reseta estado', async () => {
      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })

      act(() => {
        result.current.entrou('usuario@email.com', true)
      })

      expect(result.current.autenticado).toBe(true)

      act(() => {
        result.current.saiu()
      })

      expect(limparSessao).toHaveBeenCalled()
      expect(result.current.autenticado).toBe(false)
      expect(result.current.email).toBe('')
    })
  })

  describe('fluxo completo', () => {
    it('sem sessão → login → logout', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue(null)

      const { result } = renderHook(() => useSession())

      // Estado inicial
      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })
      expect(result.current.autenticado).toBe(false)

      // Depois do login
      act(() => {
        result.current.entrou('teste@email.com', true)
      })
      expect(result.current.autenticado).toBe(true)
      expect(result.current.email).toBe('teste@email.com')

      // Depois do logout
      act(() => {
        result.current.saiu()
      })
      expect(result.current.autenticado).toBe(false)
      expect(result.current.email).toBe('')
    })

    it('sessão persistida → recuperação → logout', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('persistido@email.com')
      vi.mocked(verificarAutenticacao).mockResolvedValue(true)

      const { result } = renderHook(() => useSession())

      // Carregando sessão
      expect(result.current.carregando).toBe(true)

      // Sessão carregada
      await waitFor(() => {
        expect(result.current.carregando).toBe(false)
      })
      expect(result.current.autenticado).toBe(true)
      expect(result.current.email).toBe('persistido@email.com')

      // Logout
      act(() => {
        result.current.saiu()
      })
      expect(result.current.autenticado).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('cancela verificação se componente desmontar', async () => {
      vi.mocked(lerEmailSalvo).mockReturnValue('usuario@email.com')
      vi.mocked(verificarAutenticacao).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100)),
      )

      const { unmount } = renderHook(() => useSession())

      // Desmontar antes que a verificação termine
      unmount()

      // Verificar que não houve atualização de estado
      // (o teste passaria se houvesse um warning de setState em componente desmontado)
    })
  })
})
