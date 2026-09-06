import { formatMonetario } from '@/utils/FormatCurrencyUtil'
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
  mask?: 'monetario'
  inputProps?: Record<string, unknown>
}

export function FormFieldInput({
  label,
  value,
  onChange,
  type = 'text',
  inputMode: customInputMode,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  flex,
  min,
  max,
  step,
  mask,
  inputProps = {},
}: Props) {
  const containerStyle = flex ? { flex } : undefined
  const safeProps = Object.fromEntries(
    Object.entries(inputProps).filter(([key]) => key !== 'onChange' && key !== 'value')
  )

  const inputMode = mask === 'monetario' ? 'decimal' : customInputMode

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (mask === 'monetario') {
      onChange(formatMonetario(newValue))
    } else {
      onChange(newValue)
    }
  }

  return (
    <label className={styles.fieldContainer} style={containerStyle}>
      <span className={styles.label}>
        {label}
        {required && ' *'}
      </span>
      <input
        type={type}
        value={value}
        onChange={handleChange}
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
