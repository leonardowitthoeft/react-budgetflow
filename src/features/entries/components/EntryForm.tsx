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
      <button className="btn-abrir" onClick={() => setAberto(true)}>
        Registrar lançamento
      </button>
    )
  }

  return (
    <EntryFormContent
      estado={estado}
      handlers={handlers}
      categorias={categorias}
      lookups={lookups}
      erro={erro || erroCarregamento}
      salvando={salvando || carregando}
      onSubmit={handleSubmit}
      onClose={() => setAberto(false)}
    />
  )
}
