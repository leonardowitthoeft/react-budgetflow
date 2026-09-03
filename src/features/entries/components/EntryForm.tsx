import { useEffect, useState } from 'react'
import { ApiError } from '../../../api/client'
import type { Category, Lookups, NovoLancamento } from '../../../api/types'
import * as entriesApi from '../api'

const TIPOS = [
  { valor: 'expense', rotulo: 'Despesa' },
  { valor: 'income', rotulo: 'Receita' },
  { valor: 'investment', rotulo: 'Investimento' },
] as const

function hojeIso(): string {
  return new Date().toISOString().slice(0, 10)
}

type Props = {
  onCriado: () => void
}

export function EntryForm({ onCriado }: Props) {
  const [aberto, setAberto] = useState(false)

  const [categorias, setCategorias] = useState<Category[]>([])
  const [lookups, setLookups] = useState<Lookups>({ accounts: [], paymentMethods: [] })

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

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [cats, lks] = await Promise.all([
          entriesApi.obterCategorias(),
          entriesApi.obterLookups(),
        ])
        if (!cancelado) {
          setCategorias(cats)
          setLookups(lks)
        }
      } catch (e) {
        if (!cancelado) {
          setErro(e instanceof ApiError || e instanceof Error
            ? e.message
            : 'Não consegui carregar as categorias.')
        }
      }
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  const categoriasDoTipo = categorias.filter((c) => c.type === tipo)
  const subcategorias =
    categorias.find((c) => c.id === categoriaId)?.subcategories ?? []

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

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro(null)

    const montante = Number(valor.replace(',', '.'))
    if (!Number.isFinite(montante) || montante <= 0) {
      setErro('O valor precisa ser maior que zero.')
      return
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

    setSalvando(true)
    try {
      await entriesApi.criarLancamento(corpo)
      limpar()
      onCriado()
    } catch (e) {
      setErro(e instanceof ApiError || e instanceof Error
        ? e.message
        : 'Não consegui salvar.')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) {
    return (
      <button className="btn-abrir" onClick={() => setAberto(true)}>
        Registrar lançamento
      </button>
    )
  }

  return (
    <form className="painel" onSubmit={salvar}>
      <h2 style={{ fontSize: '1.05rem', marginBottom: 18 }}>Novo lançamento</h2>

      <div className="linha">
        <label className="campo">
          <span>Tipo</span>
          <select
            value={tipo}
            onChange={(e) => trocarTipo(e.target.value as Category['type'])}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>{t.rotulo}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Categoria</span>
          <select
            value={categoriaId}
            onChange={(e) => trocarCategoria(e.target.value)}
            required
          >
            <option value="">selecione…</option>
            {categoriasDoTipo.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Subcategoria</span>
          <select
            value={subcategoriaId}
            onChange={(e) => setSubcategoriaId(e.target.value)}
            disabled={subcategorias.length === 0}
          >
            <option value="">nenhuma</option>
            {subcategorias.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.nature === 'fixed' ? ' (fixa)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="linha">
        <label className="campo">
          <span>Data</span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </label>

        <label className="campo" style={{ flex: 2 }}>
          <span>Descrição</span>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </label>

        <label className="campo">
          <span>Valor</span>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            required
          />
        </label>
      </div>

      <div className="linha">
        <label className="campo">
          <span>Conta</span>
          <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            <option value="">nenhuma</option>
            {lookups.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Forma de pagamento</span>
          <select value={formaId} onChange={(e) => setFormaId(e.target.value)}>
            <option value="">nenhuma</option>
            {lookups.paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Situação</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
          >
            <option value="paid">Já aconteceu</option>
            <option value="pending">Ainda vai acontecer</option>
          </select>
        </label>
      </div>

      <div className="linha">
        <label className="campo">
          <span>Repetição</span>
          <select
            value={repeticao}
            onChange={(e) => setRepeticao(e.target.value as typeof repeticao)}
          >
            <option value="">Lançamento único</option>
            <option value="installment">Compra parcelada</option>
            <option value="recurring">Assinatura mensal</option>
          </select>
        </label>

        {repeticao === 'installment' && (
          <label className="campo">
            <span>Total de parcelas</span>
            <input
              type="number"
              min={1}
              max={360}
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
            />
          </label>
        )}

        {repeticao === 'recurring' && (
          <label className="campo">
            <span>Meses a gerar</span>
            <input
              type="number"
              min={1}
              max={60}
              value={meses}
              onChange={(e) => setMeses(e.target.value)}
            />
          </label>
        )}
      </div>

      {repeticao === 'installment' && (
        <p className="nota">
          O valor é o de <strong>cada parcela</strong>, não o total da
          compra. Uma compra no dia 31 encaixa no último dia dos meses mais
          curtos e volta ao 31 depois.
        </p>
      )}

      {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}

      <div className="acoes">
        <button type="button" className="btn-simples" onClick={() => setAberto(false)}>
          Fechar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
