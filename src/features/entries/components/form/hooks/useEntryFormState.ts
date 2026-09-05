import { useState } from 'react'
import type { Category, NovoLancamento } from '@/api/types'
import { hojeIso } from '@/features/entries/components/form/constants/formConstants'

type FormState = {
  tipo: Category['type']
  categoriaId: string
  subcategoriaId: string
  data: string
  descricao: string
  valor: string
  status: 'paid' | 'pending'
  contaId: string
  formaId: string
  repeticao: '' | 'installment' | 'recurring'
  parcelas: string
  meses: string
}

type FormHandlers = {
  setTipo: (tipo: Category['type']) => void
  setCategoriaId: (id: string) => void
  setSubcategoriaId: (id: string) => void
  setData: (data: string) => void
  setDescricao: (descricao: string) => void
  setValor: (valor: string) => void
  setStatus: (status: 'paid' | 'pending') => void
  setContaId: (id: string) => void
  setFormaId: (id: string) => void
  setRepeticao: (repeticao: '' | 'installment' | 'recurring') => void
  setParcelas: (parcelas: string) => void
  setMeses: (meses: string) => void
  trocarTipo: (novo: Category['type']) => void
  trocarCategoria: (id: string) => void
  limpar: () => void
}

type UseEntryFormStateReturn = {
  estado: FormState
  handlers: FormHandlers
  montarCorpo: () => { corpo: NovoLancamento; erro: string | null }
  reset: () => void
}

export function useEntryFormState(): UseEntryFormStateReturn {
  const [tipo, setTipo] = useState<Category['type']>('expense')
  const [categoriaId, setCategoriaId] = useState('')
  const [subcategoriaId, setSubcategoriaId] = useState('')
  const [data, setData] = useState(hojeIso())
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState<'paid' | 'pending'>('paid')
  const [contaId, setContaId] = useState('')
  const [formaId, setFormaId] = useState('')
  const [repeticao, setRepeticao] = useState<'' | 'installment' | 'recurring'>('')
  const [parcelas, setParcelas] = useState('2')
  const [meses, setMeses] = useState('6')

  function trocarTipo(novo: Category['type']) {
    setTipo(novo)
    setCategoriaId('')
    setSubcategoriaId('')
  }

  function trocarCategoria(id: string) {
    setCategoriaId(id)
    setSubcategoriaId('')
  }

  function limpar() {
    setDescricao('')
    setValor('')
    setSubcategoriaId('')
    setRepeticao('')
    setParcelas('2')
  }

  function reset() {
    setTipo('expense')
    setCategoriaId('')
    setSubcategoriaId('')
    setData(hojeIso())
    setDescricao('')
    setValor('')
    setStatus('paid')
    setContaId('')
    setFormaId('')
    setRepeticao('')
    setParcelas('2')
    setMeses('6')
  }

  function montarCorpo(): { corpo: NovoLancamento; erro: string | null } {
    const montante = Number(valor.replace(',', '.'))

    if (!Number.isFinite(montante) || montante <= 0) {
      return {
        corpo: {} as NovoLancamento,
        erro: 'O valor precisa ser maior que zero.',
      }
    }

    const corpo: NovoLancamento = {
      entryDate: data,
      categoryId: categoriaId,
      subcategoryId: subcategoriaId || null,
      accountId: contaId || null,
      paymentMethodId: formaId || null,
      description: descricao,
      amount: montante,
      status,
    }

    if (repeticao === 'installment') {
      corpo.repeticao = 'installment'
      corpo.totalParcelas = Number(parcelas)
    } else if (repeticao === 'recurring') {
      corpo.repeticao = 'recurring'
      corpo.meses = Number(meses)
    }

    return { corpo, erro: null }
  }

  const estado: FormState = {
    tipo,
    categoriaId,
    subcategoriaId,
    data,
    descricao,
    valor,
    status,
    contaId,
    formaId,
    repeticao,
    parcelas,
    meses,
  }

  const handlers: FormHandlers = {
    setTipo,
    setCategoriaId,
    setSubcategoriaId,
    setData,
    setDescricao,
    setValor,
    setStatus,
    setContaId,
    setFormaId,
    setRepeticao,
    setParcelas,
    setMeses,
    trocarTipo,
    trocarCategoria,
    limpar,
  }

  return { estado, handlers, montarCorpo, reset }
}
