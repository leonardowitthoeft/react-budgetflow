import { useEffect, useState } from 'react'
import { api, ApiError, type Entry } from './api'
import { EntryForm } from './EntryForm'

const moeda = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const mesPorExtenso = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

function rotuloDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  return mesPorExtenso.format(new Date(ano, m - 1, 1))
}

export function EntriesPage() {
  const [mes, setMes] = useState(mesAtual())
  // Contador só para forçar o useEffect a rodar de novo. Quando o
  // formulário cria algo, incrementamos isso e a lista recarrega.
  const [versao, setVersao] = useState(0)

  const [lancamentos, setLancamentos] = useState<Entry[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // useEffect roda DEPOIS que a tela é desenhada, e de novo toda vez que
  // algum item do array no final mudar. Aqui: ao abrir, quando o usuário
  // troca de mês, e quando o formulário avisa que criou algo.
  //
  // Sem esse array, rodaria a cada renderização — e como buscar dados muda
  // o estado, que causa nova renderização, viraria laço infinito.
  useEffect(() => {
    // Se o usuário trocar de mês antes da resposta chegar, ignoramos a
    // resposta velha. Sem isso, uma resposta lenta de janeiro pode
    // sobrescrever a de fevereiro que já chegou.
    let cancelado = false

    async function buscar() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await api.lancamentosDoMes(mes)
        if (!cancelado) setLancamentos(dados)
      } catch (e) {
        if (!cancelado) {
          setErro(e instanceof ApiError || e instanceof Error
            ? e.message
            : 'Não consegui carregar o mês.')
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    buscar()

    // Esta função roda quando o efeito é descartado — quando o mês muda
    // ou o componente sai da tela.
    return () => {
      cancelado = true
    }
  }, [mes, versao])

  async function marcarPago(id: string) {
    try {
      await api.marcarPago(id)
      setVersao((v) => v + 1)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui marcar como pago.')
    }
  }

  async function apagar(id: string, descricao: string) {
    if (!confirm(`Apagar "${descricao}"?`)) return
    try {
      await api.apagarLancamento(id)
      setVersao((v) => v + 1)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui apagar.')
    }
  }

  // Estes três não são estado: são calculados a partir do estado. Guardar
  // em useState o que dá para derivar é fonte clássica de bug — os valores
  // saem de sincronia e você não sabe qual é o verdadeiro.
  const entra = lancamentos
    .filter((e) => e.categoryType === 'income')
    .reduce((s, e) => s + e.amount, 0)

  const sai = lancamentos
    .filter((e) => e.categoryType !== 'income')
    .reduce((s, e) => s + e.amount, 0)

  const previsto = lancamentos
    .filter((e) => e.status === 'pending')
    .reduce((s, e) => s + e.amount, 0)

  return (
    <section>
      <div className="topo">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>{rotuloDoMes(mes)}</h1>
          <p className="legenda">
            {lancamentos.length === 0
              ? 'Nada registrado'
              : `${lancamentos.length} ${lancamentos.length === 1 ? 'lançamento' : 'lançamentos'}`}
            {previsto > 0 && ` · ${moeda.format(previsto)} ainda por acontecer`}
          </p>
        </div>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          style={{ width: 172 }}
        />
      </div>

      <EntryForm onCriado={() => setVersao((v) => v + 1)} />

      {carregando && <p className="aviso">Carregando…</p>}
      {erro && <p className="erro">{erro}</p>}

      {!carregando && !erro && lancamentos.length === 0 && (
        <div className="vazio">
          <strong>Este mês está em branco</strong>
          Registre o primeiro lançamento no botão acima.
        </div>
      )}

      {lancamentos.length > 0 && (
        <>
          <table className="tabela">
            <thead>
              <tr>
                <th style={{ width: 46 }}>Dia</th>
                <th>Lançamento</th>
                <th className="cifra" style={{ width: 120 }}>Entra</th>
                <th className="cifra" style={{ width: 120 }}>Sai</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {/* map transforma cada item do array num <tr>. O "key" é
                  obrigatório: é como o React sabe qual linha é qual quando
                  a lista muda. */}
              {lancamentos.map((e) => {
                const receita = e.categoryType === 'income'
                const pendente = e.status === 'pending'

                return (
                  // A linha inteira muda quando é previsão. Informação
                  // estrutural, não um selo ao lado do valor.
                  <tr key={e.id} className={pendente ? 'previsto' : undefined}>
                    <td className="dia">{e.entryDate.slice(8)}</td>
                    <td className="verbete">
                      <b>{e.description}</b>
                      {e.installmentLabel && (
                        <span className="parcela">{e.installmentLabel}</span>
                      )}
                      <div className="qualificador">
                        {e.categoryName}
                        {e.subcategoryName && ` · ${e.subcategoryName}`}
                        {e.accountName && ` · ${e.accountName}`}
                      </div>
                    </td>
                    {/* Duas colunas em vez de sinal: a posição do número
                        já diz de que lado o dinheiro andou. */}
                    <td className={receita ? 'cifra' : 'cifra vazia'}>
                      {receita ? moeda.format(e.amount) : '—'}
                    </td>
                    <td className={receita ? 'cifra vazia' : 'cifra'}>
                      {receita ? '—' : moeda.format(e.amount)}
                    </td>
                    <td>
                      <div className="acoes-linha">
                        {pendente && (
                          <button className="mini" onClick={() => marcarPago(e.id)}>
                            marcar pago
                          </button>
                        )}
                        <button
                          className="mini perigo"
                          onClick={() => apagar(e.id, e.description)}
                        >
                          apagar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="fechamento">
            <div className="verba">
              <span className="rot">Entrou</span>
              <span className="val">{moeda.format(entra)}</span>
            </div>
            <div className="verba">
              <span className="rot">Saiu</span>
              <span className="val">{moeda.format(sai)}</span>
            </div>
            <div className="verba">
              <span className="rot">Sobra</span>
              <span className={`val ${entra - sai < 0 ? 'devedor' : ''}`}>
                {moeda.format(entra - sai)}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
