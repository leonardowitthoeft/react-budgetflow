import styles from './FormFieldSelect.module.css'

type Option = {
  valor: string
  rotulo: string
}

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  disabled?: boolean
  required?: boolean
  error?: boolean
  placeholder?: string
  flex?: number
}

export function FormFieldSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  error = false,
  placeholder,
  flex,
}: Props) {
  const containerStyle = flex ? { flex } : undefined

  return (
    <label className={styles.fieldContainer} style={containerStyle}>
      <span className={styles.label}>
        {label}
        {required && ' *'}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`${styles.select} ${error ? styles['select--error'] : ''}`}
      >
        <option value="">{placeholder || 'selecione…'}</option>
        {options.map((opt) => (
          <option key={opt.valor} value={opt.valor}>
            {opt.rotulo}
          </option>
        ))}
      </select>
    </label>
  )
}
