import { useState } from 'react'
import { EntriesPage } from '../features/entries/pages/EntriesPage';

export function Layout({ email, onSair }: { email: string; onSair: () => void }) {
  const [aba, setAba] = useState<'razao' | 'painel'>('razao')

  return (
    <div className="layout">
      <aside className="lateral">
        <div className="marca">Budget<em>Flow</em></div>
        <p className="legenda">Orçamento pessoal</p>

        <h3 className="rubrica">Sessão</h3>
        <p className="dado"><b>{email}</b></p>
        <p className="nota">
          O token dura 15 minutos. Ao expirar, você pode clicar em qualquer
          operação para renovar.
        </p>

        <button
          className="btn-simples"
          onClick={onSair}
          style={{ marginTop: 18, alignSelf: 'flex-start' }}
        >
          Sair
        </button>

        <div className="rodape">
          <p className="nota" style={{ margin: 0 }}>
            Compras parceladas e assinaturas já aparecem nos meses à frente,
            marcadas como previsão.
          </p>
        </div>
      </aside>

      <main className="principal">
        <div className="abas" role="tablist">
          <button
            className="aba"
            role="tab"
            aria-selected={aba === 'razao'}
            onClick={() => setAba('razao')}
          >
            Razão
          </button>
          <button
            className="aba"
            role="tab"
            aria-selected={aba === 'painel'}
            onClick={() => setAba('painel')}
          >
            Painel
          </button>
        </div>

        {aba === 'razao' && <EntriesPage />}

        {aba === 'painel' && (
          <div className="vazio">
            <strong>O painel ainda não existe</strong>
            Aqui vão entrar os totais do mês, a divisão por categoria e a
            comparação com os doze meses anteriores.
          </div>
        )}
      </main>
    </div>
  )
}
