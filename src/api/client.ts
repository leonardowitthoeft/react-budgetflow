export class ApiError extends Error {
  status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {
    ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
  }

  const resposta = await fetch(caminho, { ...opcoes, headers: cabecalhos, credentials: 'include' })

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null)
    throw new ApiError(
      resposta.status,
      corpo?.message ?? mensagemPadrao(resposta.status),
    )
  }

  if (resposta.status === 204) {
    return undefined as T
  }

  return resposta.json() as Promise<T>
}

function mensagemPadrao(status: number): string {
  switch (status) {
    case 401:
      return 'Sua sessão expirou. Entre de novo.'
    case 403:
      return 'Você não tem permissão para isso.'
    case 404:
      return 'Não encontrei o que você pediu.'
    case 409:
      return 'Esse registro conflita com um que já existe.'
    default:
      return `O servidor respondeu ${status}.`
  }
}
