export const TIPOS = [
  { valor: 'expense', rotulo: 'Despesa' },
  { valor: 'income', rotulo: 'Receita' },
  { valor: 'investment', rotulo: 'Investimento' },
] as const

export function hojeIso(): string {
  return new Date().toISOString().slice(0, 10)
}
