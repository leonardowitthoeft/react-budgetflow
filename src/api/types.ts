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
