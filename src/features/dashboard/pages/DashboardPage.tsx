import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../api/client'
import type { Entry } from '../../../api/types'
import * as dashboardApi from '../api'
import './Dashboard.css'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const moedaCurta = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const mesPorExtenso = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

const diaCurto = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

type Tipo = 'income' | 'expense' | 'investment'

/**
 * As três linhas do bloco da esquerda.
 *
 * O número grande de cada linha é o realizado do mês: o quanto entrou,
 * saiu ou foi aportado. "verbo" é o particípio que descreve isso, e cada
 * tipo fala a sua própria língua — receita se recebe, despesa se gasta,
 * investimento se aporta.
 *
 * "aumentoEBom" existe porque a mesma barra cheia significa coisas
 * opostas dependendo da linha: bater a receita do mês anterior é boa
 * notícia, bater a despesa não é.
 */
const LINHAS: Array<{
  tipo: Tipo
  rotulo: string
  verbo: string
  restante: string
  excedente: string
  aumentoEBom: boolean
}> = [
  {
    tipo: 'income',
    rotulo: 'Receitas',
    verbo: 'recebido',
    restante: 'para igualar',
    excedente: 'acima',
    aumentoEBom: true,
  },
  {
    tipo: 'expense',
    rotulo: 'Despesas',
    verbo: 'gasto',
    restante: 'de folga',
    excedente: 'acima',
    aumentoEBom: false,
  },
  {
    tipo: 'investment',
    rotulo: 'Investimentos',
    verbo: 'aportado',
    restante: 'para igualar',
    excedente: 'acima',
    aumentoEBom: true,
  },
]

const FILTROS: Array<{ valor: 'todas' | Tipo; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas as transações' },
  { valor: 'income', rotulo: 'Somente receitas' },
  { valor: 'expense', rotulo: 'Somente despesas' },
  { valor: 'investment', rotulo: 'Somente investimentos' },
]

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

function rotuloDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const texto = mesPorExtenso.format(new Date(ano, m - 1, 1))
  // Intl devolve "agosto de 2026". Capitalizar por CSS viraria "Agosto De
  // 2026", porque text-transform pega toda palavra. Só a primeira letra.
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function deslocarMes(mes: string, passos: number): string {
  const [ano, m] = mes.split('-').map(Number)
  const data = new Date(ano, m - 1 + passos, 1)
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

function diasNoMes(mes: string): number {
  const [ano, m] = mes.split('-').map(Number)
  // Dia 0 do mês seguinte é o último dia deste mês.
  return new Date(ano, m, 0).getDate()
}

function somarPorTipo(lancamentos: Entry[], tipo: Tipo): number {
  return lancamentos
    .filter((l) => l.categoryType === tipo)
    .reduce((total, l) => total + l.amount, 0)
}

type Props = {
  /** Chamado ao clicar numa transação. Leva para a página de Transações. */
  onAbrirTransacoes?: () => void
}

export function DashboardPage({ onAbrirTransacoes }: Props) {
  const [mes, setMes] = useState(mesAtual())
  const [dados, setDados] = useState<dashboardApi.PainelDoMes | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todas' | Tipo>('todas')

  useEffect(() => {
    let cancelado = false

    async function buscar() {
      setCarregando(true)
      setErro(null)
      try {
        const resultado = await dashboardApi.obterPainel(mes)
        if (!cancelado) setDados(resultado)
      } catch (e) {
        if (!cancelado) {
          setErro(
            e instanceof ApiError || e instanceof Error
              ? e.message
              : 'Não consegui carregar o dashboard.',
          )
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    buscar()

    return () => {
      cancelado = true
    }
  }, [mes])

  // Receitas menos despesas. Investimento fica de fora de propósito: é
  // destino do dinheiro, não perda — somá-lo aqui faria quem poupa muito
  // parecer no vermelho.
  const sobra = dados
    ? somarPorTipo(dados.atual, 'income') - somarPorTipo(dados.atual, 'expense')
    : 0

  const ultimas = useMemo(() => {
    if (!dados) return []
    return dados.atual
      .filter((l) => filtro === 'todas' || l.categoryType === filtro)
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
      .slice(0, 5)
  }, [dados, filtro])

  return (
    <div className="dashboard">
      <div className="dashboard-topo">
        <div className="navegador-mes">
          <button
            className="passo"
            onClick={() => setMes(deslocarMes(mes, -1))}
            aria-label="Mês anterior"
          >
            <IconeSeta direcao="esquerda" />
          </button>
          <span className="mes-atual">{rotuloDoMes(mes)}</span>
          <button
            className="passo"
            onClick={() => setMes(deslocarMes(mes, 1))}
            aria-label="Próximo mês"
          >
            <IconeSeta direcao="direita" />
          </button>
        </div>

        {mes !== mesAtual() && (
          <button className="voltar-hoje" onClick={() => setMes(mesAtual())}>
            Ir para o mês atual
          </button>
        )}
      </div>

      {erro && <div className="aviso erro">{erro}</div>}

      {carregando && !dados && <div className="aviso">Carregando o mês…</div>}

      {dados && (
        <div className="colunas">
          <section className="bloco" aria-label="Resumo do mês">
            <div className="cabecalho-bloco">
              <div className="titulo-bloco">
                <h2>Resumo</h2>
                <span className="apoio">vs. mês anterior</span>
              </div>
            </div>

            <p className="saldo">
              <span className="apoio">Sobra do mês</span>
              <strong className={sobra >= 0 ? 'bom' : 'ruim'}>{moeda.format(sobra)}</strong>
            </p>

            <div className="linhas">
              {LINHAS.map((linha) => (
                <LinhaResumo
                  key={linha.tipo}
                  rotulo={linha.rotulo}
                  verbo={linha.verbo}
                  restante={linha.restante}
                  excedente={linha.excedente}
                  aumentoEBom={linha.aumentoEBom}
                  valor={somarPorTipo(dados.atual, linha.tipo)}
                  base={somarPorTipo(dados.anterior, linha.tipo)}
                />
              ))}
            </div>
          </section>

          <div className="coluna-direita">
            <section className="bloco" aria-label="Gastos do mês">
              <GastosDoMes mes={mes} dados={dados} />
            </section>

            <section className="bloco" aria-label="Transações recentes">
              <div className="cabecalho-bloco">
                <div className="titulo-bloco">
                  <h2>Transações</h2>
                  <span className="apoio">mais recentes</span>
                </div>

                <select
                  className="seletor-comparacao"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as 'todas' | Tipo)}
                  aria-label="Filtrar transações"
                >
                  {FILTROS.map((f) => (
                    <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                  ))}
                </select>
              </div>

              {ultimas.length === 0 ? (
                <p className="vazio">
                  {filtro === 'todas'
                    ? 'Nenhum lançamento neste mês. O primeiro você cria em Transações.'
                    : 'Nenhum lançamento deste tipo no mês.'}
                </p>
              ) : (
                <ul className="lista-transacoes">
                  {ultimas.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        className="linha-transacao"
                        onClick={onAbrirTransacoes}
                        disabled={!onAbrirTransacoes}
                      >
                        <span className="marca" aria-hidden="true">
                          {l.categoryName.slice(0, 1)}
                        </span>

                        <span className="descricao">
                          <strong>{l.description}</strong>
                          <span className="data">
                            {formatarDia(l.entryDate)}
                            {l.status === 'pending' ? ' · pendente' : ''}
                          </span>
                        </span>

                        <span className="categoria">
                          {l.subcategoryName ?? l.categoryName}
                        </span>

                        <span className={`valor ${l.categoryType}`}>
                          {l.categoryType === 'income' ? '+' : '−'}
                          {moeda.format(l.amount)}
                        </span>

                        <span className="chevron" aria-hidden="true">
                          <IconeSeta direcao="direita" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * Uma linha do resumo: rótulo, barra de progresso e o que falta.
 *
 * O valor é o realizado do mês. A base é o total do mesmo tipo no mês
 * anterior — é o que dá denominador para a barra enquanto não existe
 * Orçamento. Quando existir, é este campo que passa a vir do teto
 * definido pelo usuário; o resto da linha não muda.
 */
function LinhaResumo({
  rotulo,
  verbo,
  restante,
  excedente,
  aumentoEBom,
  valor,
  base,
}: {
  rotulo: string
  verbo: string
  restante: string
  excedente: string
  aumentoEBom: boolean
  valor: number
  base: number
}) {
  const temBase = base > 0
  const diferenca = base - valor
  const estourou = diferenca < 0

  // Sem base, a barra não tem denominador. Uma barra vazia sugeriria
  // "zero de progresso", que é diferente de "não dá para saber". Por
  // isso ela fica listrada e sobra só o número.
  const proporcao = temBase ? Math.min(valor / base, 1) : 0

  const tom = !temBase ? 'neutro' : estourou === aumentoEBom ? 'bom' : 'ruim'

  return (
    <div className="linha-resumo">
      <div className="linha-topo">
        <span className="nome">{rotulo}</span>
        <span className="apoio">
          {temBase ? `${moeda.format(base)} no mês anterior` : 'sem mês anterior'}
        </span>
      </div>

      <div className={`barra-progresso ${temBase ? '' : 'sem-base'}`}>
        <div
          className={`preenchimento ${tom}`}
          style={{ width: `${proporcao * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(proporcao * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${rotulo}: ${moeda.format(valor)} de ${moeda.format(base)}`}
        />
      </div>

      <div className="linha-base">
        <span className="realizado">
          {moeda.format(valor)} {verbo}
        </span>
        {temBase && (
          <span className={`sobra ${tom}`}>
            {moeda.format(Math.abs(diferenca))} {estourou ? excedente : restante}
          </span>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

type Comparacao = 'anterior' | 'sozinho'

/**
 * Gasto acumulado dia a dia, este mês contra o anterior.
 *
 * Acumulado e não diário de propósito: o gasto por dia é serrilhado e não
 * responde à pergunta que importa, que é "estou gastando mais rápido do
 * que no mês passado". Duas curvas subindo lado a lado respondem de
 * relance.
 */
function GastosDoMes({ mes, dados }: { mes: string; dados: dashboardApi.PainelDoMes }) {
  const [comparacao, setComparacao] = useState<Comparacao>('anterior')

  const dias = diasNoMes(mes)
  const diasAnterior = diasNoMes(dashboardApi.mesAnterior(mes))
  const dominio = Math.max(dias, diasAnterior)

  // No mês corrente a linha para em hoje. Se continuasse até o dia 31,
  // desenharia uma reta horizontal sugerindo gasto zero nos dias que
  // ainda não aconteceram.
  const hoje = new Date()
  const corte = mes === mesAtual() ? Math.min(hoje.getDate(), dias) : dias

  const serieAtual = acumular(dados.atual, dias).slice(0, corte)
  const serieAnterior = acumular(dados.anterior, diasAnterior)

  const totalAtual = serieAtual.length ? serieAtual[serieAtual.length - 1] : 0
  const totalAnterior = serieAnterior.length ? serieAnterior[serieAnterior.length - 1] : 0

  const mostrarAnterior = comparacao === 'anterior' && serieAnterior.length > 1

  const teto = tetoBonito(Math.max(totalAtual, mostrarAnterior ? totalAnterior : 0, 1))

  const L = 58
  const R = 18
  const T = 30
  const B = 30
  const W = 880
  const H = 280

  const x = (i: number) => L + (i / Math.max(dominio - 1, 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / teto) * (H - T - B)

  const caminho = (serie: number[]) =>
    serie.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  // A área é a própria linha fechada até a base do gráfico.
  const area = (serie: number[]) =>
    `${caminho(serie)} L${x(serie.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`

  const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => teto * f)

  // Dias ímpares, como na referência. Em fevereiro para no 27.
  const diasRotulados: number[] = []
  for (let d = 1; d <= dominio; d += 2) diasRotulados.push(d)

  const pontaX = serieAtual.length ? x(serieAtual.length - 1) : L
  const pontaY = y(totalAtual)
  // Perto da borda direita o rótulo sairia do quadro, então ele vira
  // para dentro.
  const rotuloAEsquerda = pontaX > W - 150

  return (
    <>
      <div className="cabecalho-bloco">
        <div className="titulo-bloco">
          <h2>Gastos</h2>
          <span className="total-gasto">{moeda.format(totalAtual)} neste mês</span>
        </div>

        <select
          className="seletor-comparacao"
          value={comparacao}
          onChange={(e) => setComparacao(e.target.value as Comparacao)}
          aria-label="Comparação do gráfico"
        >
          <option value="anterior">Este mês vs. mês anterior</option>
          <option value="sozinho">Somente este mês</option>
        </select>
      </div>

      <svg
        className="grafico"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          mostrarAnterior
            ? `Gasto acumulado de ${moeda.format(totalAtual)} neste mês, contra ${moeda.format(totalAnterior)} no mês anterior.`
            : `Gasto acumulado de ${moeda.format(totalAtual)} neste mês.`
        }
      >
        {marcas.map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="grade" />
            <text x={L - 12} y={y(v) + 4} className="rotulo-eixo fim">
              {moedaCurta.format(v)}
            </text>
          </g>
        ))}

        {diasRotulados.map((d) => (
          <text key={d} x={x(d - 1)} y={H - 8} className="rotulo-eixo meio">
            Dia {d}
          </text>
        ))}

        {mostrarAnterior && <path d={caminho(serieAnterior)} className="curva anterior" />}

        {serieAtual.length > 1 && (
          <>
            <path d={area(serieAtual)} className="area atual" />
            <path d={caminho(serieAtual)} className="curva atual" />
          </>
        )}

        {serieAtual.length > 0 && (
          <>
            <circle cx={pontaX} cy={pontaY} r="4.5" className="ponta" />
            <text
              x={rotuloAEsquerda ? pontaX - 12 : pontaX + 12}
              y={pontaY - 12}
              className={`rotulo-ponta ${rotuloAEsquerda ? 'fim' : ''}`}
            >
              {moeda.format(totalAtual)}
            </text>
          </>
        )}
      </svg>

      <div className="legenda">
        {mostrarAnterior && (
          <span><i className="chave anterior" aria-hidden="true" />Mês anterior</span>
        )}
        <span><i className="chave atual" aria-hidden="true" />Este mês</span>
      </div>
    </>
  )
}

/** Soma as despesas dia a dia e devolve o acumulado corrido. */
function acumular(lancamentos: Entry[], dias: number): number[] {
  const porDia = new Array<number>(dias).fill(0)

  for (const l of lancamentos) {
    if (l.categoryType !== 'expense') continue
    // entryDate vem do backend como LocalDate, sempre "AAAA-MM-DD".
    // Ler o dia por posição evita criar um Date e cair no fuso horário,
    // que transformaria dia 1 em dia 31 do mês anterior.
    const dia = Number(l.entryDate.slice(8, 10))
    if (dia >= 1 && dia <= dias) porDia[dia - 1] += l.amount
  }

  let soma = 0
  return porDia.map((v) => (soma += v))
}

/** Arredonda o topo do eixo para 1, 2 ou 5 vezes uma potência de dez. */
function tetoBonito(valor: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(valor)))
  const normalizado = valor / magnitude

  if (normalizado <= 1) return magnitude
  if (normalizado <= 2) return 2 * magnitude
  if (normalizado <= 5) return 5 * magnitude
  return 10 * magnitude
}

function formatarDia(data: string): string {
  const [ano, m, d] = data.split('-').map(Number)
  return diaCurto.format(new Date(ano, m - 1, d))
}

function IconeSeta({ direcao }: { direcao: 'esquerda' | 'direita' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d={direcao === 'esquerda' ? 'M11 4 6 9l5 5' : 'M7 4l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
