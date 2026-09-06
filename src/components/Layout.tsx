import { useState } from 'react'
import { EntriesPage } from '../features/entries/pages/EntriesPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { lerBarraRecolhida, salvarBarraRecolhida } from '../lib/preferencias'
import './Layout.css'

type Pagina = 'dashboard' | 'transacoes'

/**
 * Cada item da barra. A ordem aqui é a ordem na tela.
 *
 * Só entram seções que existem. Item desabilitado com selo "em breve"
 * ocupa espaço e promete o que ainda não dá para cumprir — quando Contas,
 * Orçamento e o resto ficarem prontos, eles entram aqui.
 */
const ITENS: Array<{
  id: Pagina
  rotulo: string
  titulo: string
  icone: React.ReactNode
}> = [
  { id: 'dashboard', rotulo: 'Dashboard', titulo: 'Dashboard', icone: <IconePainel /> },
  { id: 'transacoes', rotulo: 'Transações', titulo: 'Transações', icone: <IconeLista /> },
]

type Props = {
  email: string
  onSair: () => void
}

export function Layout({ email, onSair }: Props) {
  // Começa como o usuário deixou na última visita. Recolher a barra e ela
  // voltar aberta no próximo acesso é o tipo de detalhe que irrita.
  const [recolhida, setRecolhida] = useState(lerBarraRecolhida)
  const [pagina, setPagina] = useState<Pagina>('dashboard')
  const [contaAberta, setContaAberta] = useState(false)

  const atual = ITENS.find((i) => i.id === pagina) ?? ITENS[0]

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

          <button
            className="icone-botao recolher"
            onClick={alternarBarra}
            aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!recolhida}
          >
            <IconePainelLateral />
          </button>
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
              onClick={() => setPagina(item.id)}
            >
              <span className="icone" aria-hidden="true">{item.icone}</span>
              <span className="rotulo">{item.rotulo}</span>
            </button>
          ))}
        </nav>

        <div className="rodape">
          {/* A conta abre um menu em vez de ser um botão de sair direto.
              Sair fica dentro dele: é uma ação destrutiva o suficiente para
              não merecer estar a um clique de distância do resto. */}
          <div className="conta-bloco">
            <button
              className="item conta"
              onClick={() => setContaAberta((a) => !a)}
              aria-expanded={contaAberta}
              title={recolhida ? email : undefined}
            >
              <span className="avatar" aria-hidden="true">{email.slice(0, 1)}</span>
              <span className="rotulo email" title={email}>{email}</span>
              <span className={`chevron ${contaAberta ? 'aberto' : ''}`} aria-hidden="true">
                <IconeChevron />
              </span>
            </button>

            {contaAberta && (
              <div className="menu-conta" role="menu">
                <button className="item" role="menuitem" onClick={onSair}>
                  <span className="icone" aria-hidden="true"><IconeSair /></span>
                  <span className="rotulo">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="conteudo">
        <div className="faixa">
          <h1>{atual.titulo}</h1>
        </div>

        <div className="pagina">
          {pagina === 'dashboard' && (
            <DashboardPage onAbrirTransacoes={() => setPagina('transacoes')} />
          )}
          {pagina === 'transacoes' && <EntriesPage />}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Ícones em SVG no próprio arquivo, para não trazer uma biblioteca inteira
   por causa de alguns desenhos. Todos com stroke currentColor, então herdam
   a cor do estado (cinza em repouso, preto no ativo).                        */
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

function IconePainelLateral() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3v12" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconeChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m5.5 7 3.5 3.5L12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
