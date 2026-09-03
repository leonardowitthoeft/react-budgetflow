/**
 * Preferencias de interface, guardadas no localStorage.
 *
 * Separado do lib/session.ts de proposito: sessao e sobre quem esta
 * logado e some ao sair; preferencia e sobre como a pessoa gosta de ver a
 * tela e sobrevive ao logout.
 *
 * Sempre localStorage, nunca sessionStorage: barra recolhida que volta
 * aberta na proxima visita e o tipo de detalhe que irrita.
 */

const CHAVE_BARRA = 'budgetflow_barra_recolhida'

export function lerBarraRecolhida(): boolean {
  return localStorage.getItem(CHAVE_BARRA) === 'true'
}

export function salvarBarraRecolhida(recolhida: boolean) {
  localStorage.setItem(CHAVE_BARRA, String(recolhida))
}
