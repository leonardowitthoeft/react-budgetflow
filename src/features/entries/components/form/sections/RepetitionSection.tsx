import styles from './RepetitionSection.module.css'
import { FormFieldSelect } from '../fields/FormFieldSelect'
import { FormFieldInput } from '../fields/FormFieldInput'
import { RepetitionNote } from './RepetitionNote'

type Props = {
  repeticao: '' | 'installment' | 'recurring'
  onRepeticaoChange: (v: '' | 'installment' | 'recurring') => void
  parcelas: string
  onParcelasChange: (v: string) => void
  meses: string
  onMesesChange: (v: string) => void
}

export function RepetitionSection({
  repeticao,
  onRepeticaoChange,
  parcelas,
  onParcelasChange,
  meses,
  onMesesChange,
}: Props) {
  const showInstallment = repeticao === 'installment'
  const showRecurring = repeticao === 'recurring'
  const showConditional = showInstallment || showRecurring

  return (
    <div className={styles.container}>
      <div className={styles.selectRow}>
        <div className={styles.selectField}>
          <FormFieldSelect
            label="Repetição"
            value={repeticao}
            onChange={(v) => onRepeticaoChange(v as typeof repeticao)}
            options={[
              { valor: '', rotulo: 'Lançamento único' },
              { valor: 'installment', rotulo: 'Compra parcelada' },
              { valor: 'recurring', rotulo: 'Assinatura mensal' },
            ]}
          />
        </div>
      </div>

      <div
        className={`${styles.conditionalFields} ${
          !showConditional ? styles['conditionalFields--hidden'] : ''
        }`}
      >
        {showInstallment && (
          <div className={styles.conditionalField}>
            <FormFieldInput
              label="Total de parcelas"
              type="number"
              value={parcelas}
              onChange={onParcelasChange}
              min={1}
              max={360}
            />
          </div>
        )}

        {showRecurring && (
          <div className={styles.conditionalField}>
            <FormFieldInput
              label="Meses a gerar"
              type="number"
              value={meses}
              onChange={onMesesChange}
              min={1}
              max={60}
            />
          </div>
        )}
      </div>

      {showInstallment && <RepetitionNote repeticao="installment" />}
      {showRecurring && <RepetitionNote repeticao="recurring" />}
    </div>
  )
}
