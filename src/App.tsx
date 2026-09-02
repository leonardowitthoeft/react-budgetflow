import { useState } from 'react'
import { api, ApiError, definirToken } from './api'
import { EntriesPage } from './EntriesPage'

function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [email, setEmail] = useState('')

  if (!autenticado) {
    return (
      <Entrada
        onEntrou={(e) => {
          setEmail(e)
          setAutenticado(true)
        }}
      />
    )
  }

  return (
    <Aplicativo
      email={email}
      onSair={() => {
        definirToken(null)
        setAutenticado(false)
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */

function Entrada({ onEntrou }: { onEntrou: (email: string) => void }) {
  const [criando, setCriando] = useState(false)
  const [email, setEmail] = useState('leo@teste.com')
  const [senha, setSenha] = useState('senha12345')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: React.FormEvent) {
    // Sem isto, o navegador recarrega a página inteira ao enviar o
    // formulário — comportamento padrão do HTML desde os anos 90.
    evento.preventDefault()
    setErro(null)
    setOcupado(true)

    try {
      if (criando) {
        await api.registrar(email, senha, nome)
        // Usuário novo não tem categoria nenhuma. Sem provisionar aqui,
        // ele cairia numa tela onde não é possível lançar nada.
        await api.provisionar()
      } else {
        await api.entrar(email, senha)
      }
      onEntrou(email)
    } catch (e) {
      setErro(e instanceof ApiError || e instanceof Error
        ? e.message
        : 'Não consegui falar com o servidor.')
    } finally {
      // finally roda dando certo ou errado — o botão sempre destrava.
      setOcupado(false)
    }
  }

  return (
    <div className="entrada">
      <form className="caixa" onSubmit={enviar}>
        <div className="marca">Budget<em>Flow</em></div>
        <p className="legenda" style={{ marginBottom: 30 }}>
          Seu caixa do mês, com o que ainda está por vir.
        </p>

        {criando && (
          <label className="campo">
            <span>Nome completo</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </label>
        )}

        <label className="campo">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="campo">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <button
          type="submit"
          className="btn-primario"
          disabled={ocupado}
          style={{ width: '100%', marginTop: 8 }}
        >
          {ocupado
            ? (criando ? 'Criando conta…' : 'Entrando…')
            : (criando ? 'Criar conta' : 'Entrar')}
        </button>

        {erro && <p className="erro" style={{ marginTop: 15 }}>{erro}</p>}

        <button
          type="button"
          className="alternar"
          onClick={() => {
            setCriando(!criando)
            setErro(null)
          }}
        >
          {criando ? 'Já tenho conta' : 'Criar uma conta'}
        </button>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function Aplicativo({ email, onSair }: { email: string; onSair: () => void }) {
  const [aba, setAba] = useState<'razao' | 'painel'>('razao')

  return (
    <div className="layout">
      <aside className="lateral">
        <div className="marca">Budget<em>Flow</em></div>
        <p className="legenda">Orçamento pessoal</p>

        <h3 className="rubrica">Sessão</h3>
        <p className="dado"><b>{email}</b></p>
        <p className="nota">
          A sessão vive só nesta aba do navegador, e o token dura 15
          minutos. Recarregar a página pede nova entrada.
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

export default App
