export const formatMonetario  = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '')
  if (!cleanValue) return ''

  const numericValue = parseInt(cleanValue, 10)
  const realValue = (numericValue / 100).toFixed(2)
  const [integerPart, decimalPart] = realValue.split('.')

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${formattedInteger},${decimalPart}`
}