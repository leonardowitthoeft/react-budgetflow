import styles from './EntryFormContent.module.css'
import { CategorySection } from './sections/CategorySection'
import { BasicFieldsSection } from './sections/BasicFieldsSection'
import { AccountSection } from './sections/AccountSection'
import { RepetitionSection } from './sections/RepetitionSection'
import type { Category, Lookups } from '@/api/types'

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

type Handlers = {
  setTipo: (v: Category['type']) => void
  setCategoriaId: (v: string) => void
  setSubcategoriaId: (v: string) => void
  setData: (v: string) => void
  setDescricao: (v: string) => void
  setValor: (v: string) => void
  setStatus: (v: 'paid' | 'pending') => void
  setContaId: (v: string) => void
  setFormaId: (v: string) => void
  setRepeticao: (v: '' | 'installment' | 'recurring') => void
  setParcelas: (v: string) => void
  setMeses: (v: string) => void
  trocarTipo: (v: Category['type']) => void
  trocarCategoria: (v: string) => void
  limpar: () => void
}

type Props = {
  estado: FormState
  handlers: Handlers
  categorias: Category[]
  lookups: Lookups
  erro: string | null
  salvando: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
  onClose: () => void
}

export function EntryFormContent({
  estado,
  handlers,
  categorias,
  lookups,
  erro,
  salvando,
  onSubmit,
  onClose,
}: Props) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h2 className={styles.title}>Novo lançamento</h2>

      <CategorySection
        tipo={estado.tipo}
        onTipoChange={handlers.trocarTipo}
        categoriaId={estado.categoriaId}
        onCategoriaChange={handlers.trocarCategoria}
        subcategoriaId={estado.subcategoriaId}
        onSubcategoriaChange={handlers.setSubcategoriaId}
        categorias={categorias}
      />

      <BasicFieldsSection
        data={estado.data}
        onDataChange={handlers.setData}
        descricao={estado.descricao}
        onDescricaoChange={handlers.setDescricao}
        valor={estado.valor}
        onValorChange={handlers.setValor}
      />

      <AccountSection
        contaId={estado.contaId}
        onContaChange={handlers.setContaId}
        formaId={estado.formaId}
        onFormaChange={handlers.setFormaId}
        status={estado.status}
        onStatusChange={handlers.setStatus}
        lookups={lookups}
      />

      <RepetitionSection
        repeticao={estado.repeticao}
        onRepeticaoChange={handlers.setRepeticao}
        parcelas={estado.parcelas}
        onParcelasChange={handlers.setParcelas}
        meses={estado.meses}
        onMesesChange={handlers.setMeses}
      />

      {erro && <p className={styles.error}>{erro}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-simples"
          onClick={onClose}
        >
          Fechar
        </button>
        <button
          type="submit"
          className="btn-primario"
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
