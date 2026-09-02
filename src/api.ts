/**
 * Camada de acesso à API.
 *
 * Existe para o token ficar num lugar só. Sem isso, cada componente
 * repetiria o header Authorization, e o dia em que a forma de autenticar
 * mudar você teria que caçar todos eles.
 *
 * Os tipos abaixo espelham os DTOs do backend. Se um campo mudar lá e não
 * aqui, o TypeScript avisa no primeiro uso — que é o ponto de usar
 * TypeScript num front que consome API.
 */

export type Subcategory = {
  id: string
  name: string
  nature: 'fixed' | 'variable' | null
}

export type Category = {
  id: string
  type: 'income' | 'expense' | 'investment'
  name: string
  subcategories: Subcategory[]
}

export type Lookup = { id: string; name: string }

export type Lookups = {
  accounts: Lookup[]
  paymentMethods: Lookup[]
}

export type Entry = {
  id: string
  entryDate: string
  categoryId: string
  categoryName: string
  categoryType: 'income' | 'expense' | 'investment'
  subcategoryId: string | null
  subcategoryName: string | null
  subcategoryNature: string | null
  accountId: string | null
  accountName: string | null
  paymentMethodId: string | null
  paymentMethodName: string | null
  description: string
  amount: number
  status: 'paid' | 'pending'
  notes: string | null
  groupCode: string | null
  installmentLabel: string
}

/** Corpo do POST. Os nomes seguem o EntryRequest do backend. */
export type NovoLancamento = {
  entryDate: string
  categoryId: string
  subcategoryId?: string | null
  accountId?: string | null
  paymentMethodId?: string | null
  description: string
  amount: number
  status: 'paid' | 'pending'
  notes?: string | null
  repeticao?: 'installment' | 'recurring'
  totalParcelas?: number
  parcelaInicial?: number
  meses?: number
}

export type Provisionamento = {
  categorias: number
  subcategorias: number
  contas: number
  formas: number
  jaExistia: boolean
}

/**
 * Erro com o status HTTP preservado.
 *
 * O componente precisa distinguir 401 (token expirou, mande fazer login de
 * novo) de 400 (o usuário errou algo, mostre a mensagem). Uma Error comum
 * perderia essa informação.
 */
export class ApiError extends Error {
  constructor(public readonly status: number, mensagem: string) {
    super(mensagem)
  }
}

let token: string | null = null

export function definirToken(novo: string | null) {
  token = novo
}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {
    ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const resposta = await fetch(caminho, { ...opcoes, headers: cabecalhos })

  // fetch só falha em erro de rede. Um 401 é resposta válida para ele,
  // então checar o "ok" é obrigatório.
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null)
    throw new ApiError(
      resposta.status,
      corpo?.message ?? mensagemPadrao(resposta.status),
    )
  }

  // 204 No Content não tem corpo. Tentar ler JSON dali dá erro de parse.
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

/* -------------------------------------------------------------------------- */

export const api = {
  async entrar(email: string, password: string) {
    const dados = await requisitar<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    definirToken(dados.accessToken)
    return dados.accessToken
  },

  async registrar(email: string, password: string, fullName: string) {
    const dados = await requisitar<{ accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    })
    definirToken(dados.accessToken)
    return dados.accessToken
  },

  categorias() {
    return requisitar<Category[]>('/api/categories')
  },

  /**
   * Cria a taxonomia inicial do usuário. Idempotente: chamar de novo
   * devolve jaExistia = true sem duplicar nada.
   */
  provisionar() {
    return requisitar<Provisionamento>('/api/categories/provision', { method: 'POST' })
  },

  lookups() {
    return requisitar<Lookups>('/api/lookups')
  },

  lancamentosDoMes(mes: string) {
    return requisitar<Entry[]>(`/api/entries?month=${mes}`)
  },

  criarLancamento(corpo: NovoLancamento) {
    return requisitar<Entry[]>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(corpo),
    })
  },

  marcarPago(id: string) {
    return requisitar<Entry>(`/api/entries/${id}/pagar`, { method: 'PATCH' })
  },

  apagarLancamento(id: string) {
    return requisitar<void>(`/api/entries/${id}`, { method: 'DELETE' })
  },
}
