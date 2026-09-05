import styles from './FormFieldInput.module.css'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'date' | 'email'
  inputMode?: 'text' | 'decimal' | 'numeric' | 'email' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: boolean
  flex?: number
  min?: number | string
  max?: number | string
  step?: number | string
  inputProps?: Record<string, unknown>
}

export function FormFieldInput({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  flex,
  min,
  max,
  step,
  inputProps = {},
}: Props) {
  const containerStyle = flex ? { flex } : undefined
  const { onChange: _, value: __, ...safeProps } = inputProps

  return (
    <label className={styles.fieldContainer} style={containerStyle}>
      <span className={styles.label}>
        {label}
        {required && ' *'}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        className={`${styles.input} ${error ? styles['input--error'] : ''}`}
        {...safeProps}
      />
    </label>
  )
}
