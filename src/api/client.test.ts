import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { requisitar, ApiError } from './client'

describe('ApiError', () => {
  it('cria um erro com status e mensagem', () => {
    const erro = new ApiError(404, 'Não encontrado')
    expect(erro.status).toBe(404)
    expect(erro.message).toBe('Não encontrado')
    expect(erro).toBeInstanceOf(Error)
  })
})

describe('requisitar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('faz uma requisição GET e retorna JSON', async () => {
    const dados = { id: 1, nome: 'Teste' }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => dados,
    } as Response)

    const resultado = await requisitar('/api/teste')

    expect(resultado).toEqual(dados)
    expect(global.fetch).toHaveBeenCalledWith('/api/teste', {
      headers: {},
      credentials: 'include',
    })
  })

  it('inclui Content-Type ao enviar body', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await requisitar('/api/teste', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Teste' }),
    })

    const chamada = (global.fetch as any).mock.calls[0]
    expect(chamada[1].headers['Content-Type']).toBe('application/json')
  })

  it('não inclui Content-Type quando não há body', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await requisitar('/api/teste', { method: 'GET' })

    const chamada = (global.fetch as any).mock.calls[0]
    expect(chamada[1].headers['Content-Type']).toBeUndefined()
  })

  it('sempre inclui credentials: include', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await requisitar('/api/teste')

    const chamada = (global.fetch as any).mock.calls[0]
    expect(chamada[1].credentials).toBe('include')
  })

  it('retorna undefined para status 204', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response)

    const resultado = await requisitar('/api/teste', { method: 'DELETE' })

    expect(resultado).toBeUndefined()
  })

  it('lança ApiError com mensagem customizada do servidor', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Email já existe' }),
    } as Response)

    await expect(requisitar('/api/teste')).rejects.toThrow(
      expect.objectContaining({
        message: 'Email já existe',
        status: 400,
      }),
    )
  })

  it('lança ApiError com mensagem padrão quando servidor não fornece mensagem', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response)

    await expect(requisitar('/api/teste')).rejects.toThrow(
      expect.objectContaining({
        message: 'Não encontrei o que você pediu.',
        status: 404,
      }),
    )
  })

  it('usa mensagem padrão quando JSON não pode ser parseado', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as Response)

    await expect(requisitar('/api/teste')).rejects.toThrow(
      expect.objectContaining({
        message: 'Sua sessão expirou. Entre de novo.',
        status: 401,
      }),
    )
  })

  it('fornece mensagens padrão para vários status codes', async () => {
    const casos = [
      { status: 401, msg: 'Sua sessão expirou. Entre de novo.' },
      { status: 403, msg: 'Você não tem permissão para isso.' },
      { status: 404, msg: 'Não encontrei o que você pediu.' },
      { status: 409, msg: 'Esse registro conflita com um que já existe.' },
      { status: 500, msg: 'O servidor respondeu 500.' },
    ]

    for (const caso of casos) {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: caso.status,
        json: async () => ({}),
      } as Response)

      await expect(requisitar('/api/teste')).rejects.toThrow(
        expect.objectContaining({
          message: caso.msg,
          status: caso.status,
        }),
      )
    }
  })

  it('aceita opcoes customizadas e as passa ao fetch', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await requisitar('/api/teste', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Teste' }),
      headers: { 'X-Custom': 'valor' },
    })

    const chamada = (global.fetch as any).mock.calls[0]
    expect(chamada[1].method).toBe('POST')
    expect(chamada[1].headers['X-Custom']).toBe('valor')
  })

  it('preserva headers customizadas ao adicionar Content-Type', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await requisitar('/api/teste', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Teste' }),
      headers: { 'X-Custom': 'valor' },
    })

    const chamada = (global.fetch as any).mock.calls[0]
    expect(chamada[1].headers['Content-Type']).toBe('application/json')
    expect(chamada[1].headers['X-Custom']).toBe('valor')
  })
})
