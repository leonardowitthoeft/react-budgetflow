import shared from '../shared/formShared.module.css'
import { FormFieldSelect } from '../fields/FormFieldSelect'
import type { Lookups } from '@/api/types'

type Props = {
  contaId: string
  onContaChange: (id: string) => void
  formaId: string
  onFormaChange: (id: string) => void
  status: 'paid' | 'pending'
  onStatusChange: (status: 'paid' | 'pending') => void
  lookups: Lookups
}

export function AccountSection({
  contaId,
  onContaChange,
  formaId,
  onFormaChange,
  status,
  onStatusChange,
  lookups,
}: Props) {
  return (
    <div className={shared.row}>
      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Conta"
          value={contaId}
          onChange={onContaChange}
          options={lookups.accounts.map((a) => ({
            valor: a.id,
            rotulo: a.name,
          }))}
          placeholder="nenhuma"
        />
      </div>

      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Forma de pagamento"
          value={formaId}
          onChange={onFormaChange}
          options={lookups.paymentMethods.map((p) => ({
            valor: p.id,
            rotulo: p.name,
          }))}
          placeholder="nenhuma"
        />
      </div>

      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Situação"
          value={status}
          onChange={(v) => onStatusChange(v as 'paid' | 'pending')}
          options={[
            { valor: 'paid', rotulo: 'Já aconteceu' },
            { valor: 'pending', rotulo: 'Ainda vai acontecer' },
          ]}
        />
      </div>
    </div>
  )
}
