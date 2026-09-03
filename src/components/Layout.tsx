import { useState } from 'react'
// AJUSTE ESTE CAMINHO se a EntriesPage estiver noutro lugar depois da
// reorganização de pastas. É o único import que depende dela.
import { EntriesPage } from '../features/entries/pages/EntriesPage'
import { lerBarraRecolhida, salvarBarraRecolhida } from '../lib/preferencias'
import './Layout.css'

type Pagina = 'dashboard' | 'transacoes' | 'contas' | 'orcamento' | 'recorrentes'

/**
 * Cada item da barra. O "emBreve" desabilita o botão e mostra o selo.
 *
 * A ordem aqui é a ordem na tela: dashboard primeiro, transações segundo.
 */
const ITENS: Array<{
  id: Pagina
  rotulo: string
  titulo: string
  icone: React.ReactNode
  emBreve?: boolean
}> = [
  { id: 'dashboard', rotulo: 'Dashboard', titulo: 'Dashboard', icone: <IconePainel />, emBreve: true },
  { id: 'transacoes', rotulo: 'Transações', titulo: 'Transações', icone: <IconeLista /> },
  { id: 'contas', rotulo: 'Contas', titulo: 'Contas', icone: <IconeCartao />, emBreve: true },
  { id: 'orcamento', rotulo: 'Orçamento', titulo: 'Orçamento', icone: <IconeAlvo />, emBreve: true },
  { id: 'recorrentes', rotulo: 'Recorrentes', titulo: 'Recorrentes', icone: <IconeRepetir />, emBreve: true },
]

type Props = {
  email: string
  onSair: () => void
}

export function Layout({ email, onSair }: Props) {
  // Começa como o usuário deixou na última visita. Recolher a barra e ela
  // voltar aberta no próximo acesso é o tipo de detalhe que irrita.
  const [recolhida, setRecolhida] = useState(lerBarraRecolhida)
  const [pagina, setPagina] = useState<Pagina>('transacoes')

  const atual = ITENS.find((i) => i.id === pagina) ?? ITENS[1]

  function alternarBarra() {
    const nova = !recolhida
    setRecolhida(nova)
    salvarBarraRecolhida(nova)
  }

  return (
    <div className={`app ${recolhida ? 'recolhida' : ''}`}>
      <aside className="barra">
        <div className="topo-barra">
          <span className="logo">
            <Logo />
          </span>
          <span className="nome">BudgetFlow</span>
        </div>

        <nav aria-label="Seções">
          {ITENS.map((item) => (
            <button
              key={item.id}
              className="item"
              // aria-current diz a leitores de tela qual é a página atual.
              // O CSS também usa este atributo para o destaque, então o
              // visual e a semântica nunca saem de sincronia.
              aria-current={pagina === item.id ? 'page' : undefined}
              // O title vira dica ao passar o mouse. É o que salva a barra
              // recolhida: sem rótulo visível, o ícone sozinho é adivinhação.
              title={recolhida ? item.titulo : undefined}
              disabled={item.emBreve}
              onClick={() => setPagina(item.id)}
            >
              <span className="icone" aria-hidden="true">{item.icone}</span>
              <span className="rotulo">{item.rotulo}</span>
              {item.emBreve && <span className="emBreve">em breve</span>}
            </button>
          ))}
        </nav>

        <div className="rodape">
          <div className="conta">
            <span className="avatar" aria-hidden="true">{email.slice(0, 1)}</span>
            <span className="email" title={email}>{email}</span>
          </div>
          <button
            className="item"
            onClick={onSair}
            title={recolhida ? 'Sair' : undefined}
          >
            <span className="icone" aria-hidden="true"><IconeSair /></span>
            <span className="rotulo">Sair</span>
          </button>
        </div>
      </aside>

      <div className="conteudo">
        <div className="faixa">
          <button
            className="icone-botao"
            onClick={alternarBarra}
            aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!recolhida}
          >
            <IconeMenu />
          </button>
          <h1>{atual.titulo}</h1>
        </div>

        <div className="pagina">
          {pagina === 'transacoes' && <EntriesPage />}

          {pagina !== 'transacoes' && (
            <div className="vazio-pagina">
              <strong>{atual.titulo} ainda não existe</strong>
              {textoEmBreve(pagina)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function textoEmBreve(pagina: Pagina): string {
  switch (pagina) {
    case 'dashboard':
      return 'Aqui vão entrar os totais do mês, a divisão por categoria e a comparação com os doze meses anteriores.'
    case 'contas':
      return 'Cadastro das suas contas e formas de pagamento, para renomear e arquivar o que não usa mais.'
    case 'orcamento':
      return 'Teto de gasto por categoria e mês, com a comparação entre orçado e realizado.'
    case 'recorrentes':
      return 'Suas assinaturas e compras parceladas em andamento, com o que ainda falta pagar.'
    default:
      return ''
  }
}

/* -------------------------------------------------------------------------- */
/* Ícones em SVG no próprio arquivo, para não trazer uma biblioteca inteira
   por causa de sete desenhos. Todos com stroke currentColor, então herdam
   a cor do estado (cinza em repouso, preto no ativo).                       */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="5" fill="#18181B" />
      <path d="M6.5 14.5V7.5M11 14.5V10M15.5 14.5v-3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconePainel() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconeLista() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M6 4.5h10M6 9h10M6 13.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="2.6" cy="4.5" r="1" fill="currentColor" />
      <circle cx="2.6" cy="9" r="1" fill="currentColor" />
      <circle cx="2.6" cy="13.5" r="1" fill="currentColor" />
    </svg>
  )
}

function IconeCartao() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconeAlvo() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconeRepetir() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 8a6 6 0 0 1 10.3-4.2M15 10a6 6 0 0 1-10.3 4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 1.6v2.6h-2.6M5 16.4v-2.6h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeSair() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M7 15.5H3.5a1.5 1.5 0 0 1-1.5-1.5V4a1.5 1.5 0 0 1 1.5-1.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11.5 12.5 15 9l-3.5-3.5M15 9H6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeMenu() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
