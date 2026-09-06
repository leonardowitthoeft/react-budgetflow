import shared from '../shared/formShared.module.css'
import { FormFieldInput } from '../fields/FormFieldInput'

type Props = {
  data: string
  onDataChange: (data: string) => void
  descricao: string
  onDescricaoChange: (descricao: string) => void
  valor: string
  onValorChange: (valor: string) => void
}

export function BasicFieldsSection({
  data,
  onDataChange,
  descricao,
  onDescricaoChange,
  valor,
  onValorChange,
}: Props) {
  return (
    <div className={shared.row}>
      <div className={shared.rowItem}>
        <FormFieldInput
          label="Data"
          type="date"
          value={data}
          onChange={onDataChange}
          required
        />
      </div>

      <div className={shared.rowItem} style={{ flex: 2, minWidth: 200 }}>
        <FormFieldInput
          label="Descrição"
          type="text"
          value={descricao}
          onChange={onDescricaoChange}
          required
        />
      </div>

      <div className={shared.rowItem}>
        <FormFieldInput
          label="Valor"
          type="text"
          mask="monetario"
          inputMode="decimal"
          placeholder="0,00"
          value={valor}
          onChange={onValorChange}
          required
        />
      </div>
    </div>
  )
}
