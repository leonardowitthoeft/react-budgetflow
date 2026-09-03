/**
 * Onde a sessão do usuário é guardada no navegador.
 *
 * Existe para o resto do código não saber qual armazenamento está em uso.
 * Antes o App.tsx chamava sessionStorage direto e o useSession também
 * gerenciava esse estado — duas fontes da mesma verdade. Se você quisesse
 * trocar de mecanismo, teria que caçar as chamadas espalhadas.
 *
 * A diferença entre os dois armazenamentos é o que faz o "manter
 * conectado" funcionar:
 *
 *   sessionStorage — morre ao fechar a aba
 *   localStorage   — sobrevive a fechar o navegador
 *
 * Nenhum dos dois guarda credencial. Quem autentica é o cookie httpOnly
 * que o backend emite no login, e o JavaScript não consegue nem ler.
 * O que fica aqui é só o e-mail, para mostrar na tela e para saber se
 * vale a pena perguntar ao servidor se a sessão ainda é válida.
 */

const CHAVE_EMAIL = 'budgetflow_email'
const CHAVE_PERSISTIR = 'budgetflow_persistir'

/** Guarda o e-mail. Com persistir=true, sobrevive a fechar o navegador. */
export function salvarSessao(email: string, persistir: boolean) {
  limparSessao()

  const armazenamento = persistir ? localStorage : sessionStorage
  armazenamento.setItem(CHAVE_EMAIL, email)

  // A preferência em si vai sempre no localStorage, para a caixa aparecer
  // marcada na próxima visita mesmo que a sessão tenha expirado.
  localStorage.setItem(CHAVE_PERSISTIR, String(persistir))
}

/**
 * Lê o e-mail de onde ele estiver. Procura nos dois porque o usuário pode
 * ter entrado sem marcar a opção numa vez e marcado na outra.
 */
export function lerEmailSalvo(): string | null {
  return localStorage.getItem(CHAVE_EMAIL) ?? sessionStorage.getItem(CHAVE_EMAIL)
}

/** A preferência da última vez, para pré-marcar a caixa. */
export function lerPreferenciaPersistir(): boolean {
  return localStorage.getItem(CHAVE_PERSISTIR) === 'true'
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_EMAIL)
  sessionStorage.removeItem(CHAVE_EMAIL)
}
