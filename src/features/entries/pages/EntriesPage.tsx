import { useEffect, useState } from 'react'
import { ApiError } from '../../../api/client'
import type { Entry } from '../../../api/types'
import { EntryForm } from '../components/EntryForm'
import * as entriesApi from '../api'

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
  const [versao, setVersao] = useState(0)

  const [lancamentos, setLancamentos] = useState<Entry[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function buscar() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await entriesApi.obterLancamentosDoMes(mes)
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

    return () => {
      cancelado = true
    }
  }, [mes, versao])

  async function marcarPago(id: string) {
    try {
      await entriesApi.marcarPago(id)
      setVersao((v) => v + 1)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui marcar como pago.')
    }
  }

  async function apagar(id: string, descricao: string) {
    if (!confirm(`Apagar "${descricao}"?`)) return
    try {
      await entriesApi.apagarLancamento(id)
      setVersao((v) => v + 1)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui apagar.')
    }
  }

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
              {lancamentos.map((e) => {
                const receita = e.categoryType === 'income'
                const pendente = e.status === 'pending'

                return (
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
