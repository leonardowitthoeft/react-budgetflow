import { useState } from 'react'
import { ApiError } from '../../../api/client'
import * as authApi from '../api'

export function LoginForm({ onEntrou }: { onEntrou: (email: string) => void }) {
  const [criando, setCriando] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro(null)
    setOcupado(true)

    try {
      if (criando) {
        await authApi.registrar(email, senha, nome)
        await authApi.provisionar()
      } else {
        await authApi.entrar(email, senha)
      }
      onEntrou(email)
    } catch (e) {
      setErro(e instanceof ApiError || e instanceof Error
        ? e.message
        : 'Não consegui falar com o servidor.')
    } finally {
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
