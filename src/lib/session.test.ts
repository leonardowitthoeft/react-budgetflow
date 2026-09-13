import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { salvarSessao, lerEmailSalvo, lerPreferenciaPersistir, limparSessao } from './session'

describe('Gerenciamento de Sessão', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('salvarSessao', () => {
    it('salva email em localStorage com persistir=true', () => {
      salvarSessao('usuario@email.com', true)

      expect(localStorage.getItem('budgetflow_email')).toBe('usuario@email.com')
      expect(sessionStorage.getItem('budgetflow_email')).toBeNull()
    })

    it('salva email em sessionStorage com persistir=false', () => {
      salvarSessao('usuario@email.com', false)

      expect(sessionStorage.getItem('budgetflow_email')).toBe('usuario@email.com')
      expect(localStorage.getItem('budgetflow_email')).toBeNull()
    })

    it('salva preferência de persistência em localStorage', () => {
      salvarSessao('usuario@email.com', true)
      expect(localStorage.getItem('budgetflow_persistir')).toBe('true')

      salvarSessao('outro@email.com', false)
      expect(localStorage.getItem('budgetflow_persistir')).toBe('false')
    })

    it('limpa sessão anterior ao salvar nova', () => {
      salvarSessao('primeiro@email.com', true)
      salvarSessao('segundo@email.com', false)

      expect(localStorage.getItem('budgetflow_email')).toBeNull()
      expect(sessionStorage.getItem('budgetflow_email')).toBe('segundo@email.com')
    })
  })

  describe('lerEmailSalvo', () => {
    it('retorna email do localStorage se estiver lá', () => {
      localStorage.setItem('budgetflow_email', 'local@email.com')

      expect(lerEmailSalvo()).toBe('local@email.com')
    })

    it('retorna email do sessionStorage se localStorage estiver vazio', () => {
      sessionStorage.setItem('budgetflow_email', 'session@email.com')

      expect(lerEmailSalvo()).toBe('session@email.com')
    })

    it('prioriza localStorage sobre sessionStorage', () => {
      localStorage.setItem('budgetflow_email', 'local@email.com')
      sessionStorage.setItem('budgetflow_email', 'session@email.com')

      expect(lerEmailSalvo()).toBe('local@email.com')
    })

    it('retorna null quando nenhum email está salvo', () => {
      expect(lerEmailSalvo()).toBeNull()
    })
  })

  describe('lerPreferenciaPersistir', () => {
    it('retorna true quando preferência está salva como true', () => {
      localStorage.setItem('budgetflow_persistir', 'true')

      expect(lerPreferenciaPersistir()).toBe(true)
    })

    it('retorna false quando preferência está salva como false', () => {
      localStorage.setItem('budgetflow_persistir', 'false')

      expect(lerPreferenciaPersistir()).toBe(false)
    })

    it('retorna false quando preferência não está salva', () => {
      expect(lerPreferenciaPersistir()).toBe(false)
    })

    it('retorna false para valores inválidos', () => {
      localStorage.setItem('budgetflow_persistir', 'invalido')

      expect(lerPreferenciaPersistir()).toBe(false)
    })
  })

  describe('limparSessao', () => {
    it('remove email do localStorage', () => {
      localStorage.setItem('budgetflow_email', 'usuario@email.com')
      limparSessao()

      expect(localStorage.getItem('budgetflow_email')).toBeNull()
    })

    it('remove email do sessionStorage', () => {
      sessionStorage.setItem('budgetflow_email', 'usuario@email.com')
      limparSessao()

      expect(sessionStorage.getItem('budgetflow_email')).toBeNull()
    })

    it('remove ambos os emails quando estão em dois lugares', () => {
      localStorage.setItem('budgetflow_email', 'local@email.com')
      sessionStorage.setItem('budgetflow_email', 'session@email.com')

      limparSessao()

      expect(localStorage.getItem('budgetflow_email')).toBeNull()
      expect(sessionStorage.getItem('budgetflow_email')).toBeNull()
    })

    it('não lança erro ao limpar quando nada está salvo', () => {
      expect(() => limparSessao()).not.toThrow()
    })
  })

  describe('fluxo completo', () => {
    it('salva sessão, lê email, verifica preferência e limpa', () => {
      // Salvar
      salvarSessao('teste@email.com', true)
      expect(lerEmailSalvo()).toBe('teste@email.com')
      expect(lerPreferenciaPersistir()).toBe(true)

      // Limpar (remove email mas mantém preferência de persistência)
      limparSessao()
      expect(lerEmailSalvo()).toBeNull()
      // Preferência persiste mesmo após limpar, pois fica em localStorage
      expect(lerPreferenciaPersistir()).toBe(true)
    })

    it('alterna entre persistência e sessão', () => {
      salvarSessao('usuario1@email.com', true)
      expect(localStorage.getItem('budgetflow_email')).toBe('usuario1@email.com')

      salvarSessao('usuario2@email.com', false)
      expect(localStorage.getItem('budgetflow_email')).toBeNull()
      expect(sessionStorage.getItem('budgetflow_email')).toBe('usuario2@email.com')

      salvarSessao('usuario3@email.com', true)
      expect(localStorage.getItem('budgetflow_email')).toBe('usuario3@email.com')
      expect(sessionStorage.getItem('budgetflow_email')).toBeNull()
    })
  })
})
