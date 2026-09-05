import { useState } from 'react'
import { useFormData } from './form/hooks/useFormData'
import { useEntryFormState } from './form/hooks/useEntryFormState'
import { EntryFormContent } from './form/EntryFormContent'

type Props = {
  onCriado: () => void
}

export function EntryForm({ onCriado }: Props) {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const { categorias, lookups, carregando, erro: erroCarregamento } = useFormData()
  const { estado, handlers, salvar: salvarForm } = useEntryFormState()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSalvando(true)

    const { sucesso, erro: erroForm } = await salvarForm()

    if (sucesso) {
      setAberto(false)
      onCriado()
    } else {
      setErro(erroForm)
    }

    setSalvando(false)
  }

  if (!aberto) {
    return (
      <button className="btn-abrir" onClick={() => setAberto(true)} disabled={carregando}>
        {carregando ? 'Carregando…' : 'Registrar lançamento'}
      </button>
    )
  }

  if (carregando) {
    return <p className="aviso">Carregando formulário…</p>
  }

  if (erroCarregamento) {
    return (
      <div>
        <p className="erro">{erroCarregamento}</p>
        <button className="btn-simples" onClick={() => setAberto(false)}>
          Fechar
        </button>
      </div>
    )
  }

  return (
    <EntryFormContent
      estado={estado}
      handlers={handlers}
      categorias={categorias}
      lookups={lookups}
      erro={erro}
      salvando={salvando}
      onSubmit={handleSubmit}
      onClose={() => setAberto(false)}
    />
  )
}
