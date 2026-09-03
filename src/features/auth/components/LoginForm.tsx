import { useState } from 'react'
import { ApiError } from '../../../api/client'
import { lerPreferenciaPersistir } from '../../../lib/session'
import * as authApi from '../api'
import './LoginForm.css'

type Props = {
  /** Recebe o e-mail e se o usuário pediu para continuar conectado. */
  onEntrou: (email: string, persistir: boolean) => void
}

export function LoginForm({ onEntrou }: Props) {
  const [criando, setCriando] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')

  // Começa com a preferência da última visita, para o usuário não precisar
  // marcar de novo toda vez.
  const [persistir, setPersistir] = useState(lerPreferenciaPersistir)
  const [mostrarSenha, setMostrarSenha] = useState(false)

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
        await authApi.registrar(email, senha, nome)
        // Usuário novo não tem categoria nenhuma. Sem provisionar aqui,
        // ele cairia numa tela onde não é possível lançar nada.
        await authApi.provisionar()
      } else {
        await authApi.entrar(email, senha)
      }
      onEntrou(email, persistir)
    } catch (e) {
      setErro(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Não consegui falar com o servidor.',
      )
    } finally {
      // finally roda dando certo ou errado — o botão sempre destrava.
      setOcupado(false)
    }
  }

  function alternarModo() {
    setCriando(!criando)
    setErro(null)
  }

  return (
    <div className="entrada">
      <div className="marca">
        <Logo />
        BudgetFlow
      </div>

      <div className="cartao">
        <div className="cabecalho">
          <h1>{criando ? 'Criar conta' : 'Entrar'}</h1>

          {/* A caixa real está no HTML, só escondida no CSS: é ela que
              recebe foco do teclado e que leitores de tela anunciam.
              Trocar por uma div clicável quebraria as duas coisas. */}
          <label className="persistir">
            Continuar conectado
            <input
              type="checkbox"
              checked={persistir}
              onChange={(e) => setPersistir(e.target.checked)}
            />
            <span className="trilho" aria-hidden="true" />
          </label>
        </div>

        <div className="corpo">
          <form onSubmit={enviar}>
            {erro && (
              <p className="aviso-erro">
                <IconeAlerta />
                {erro}
              </p>
            )}

            {/* && mostra o elemento só quando a condição é verdadeira.
                É o jeito idiomático de renderizar condicionalmente. */}
            {criando && (
              <div className="campo">
                <div className="rotulo">
                  <label htmlFor="nome">Nome completo</label>
                </div>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como você quer ser chamado"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="campo">
              <div className="rotulo">
                <label htmlFor="email">E-mail</label>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="campo">
              <div className="rotulo">
                <label htmlFor="senha">Senha</label>
                {!criando && (
                  <button
                    type="button"
                    className="discreto"
                    onClick={() =>
                      setErro(
                        'A recuperação de senha ainda não existe. ' +
                          'Por enquanto, crie outra conta ou peça ajuda.',
                      )
                    }
                  >
                    Esqueci a senha
                  </button>
                )}
              </div>

              <div className="senha">
                <input
                  id="senha"
                  // O type alterna entre password e text. É todo o segredo
                  // do botão de mostrar senha.
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={criando ? 'Ao menos 8 caracteres' : '••••••••'}
                  autoComplete={criando ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <OlhoFechado /> : <OlhoAberto />}
                </button>
              </div>
            </div>

            <button type="submit" className="principal" disabled={ocupado}>
              {ocupado
                ? criando
                  ? 'Criando conta…'
                  : 'Entrando…'
                : criando
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>
          </form>

          <p className="rodape-cartao">
            {criando ? 'Já tem conta? ' : 'Não tem conta? '}
            <button type="button" className="elo" onClick={alternarModo}>
              {criando ? 'Entrar' : 'Criar uma conta'}
            </button>
          </p>
        </div>
      </div>

      <p className="legenda-pe">
        Seu caixa do mês, com o que ainda está por vir.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Ícones em SVG no próprio arquivo, para não trazer uma biblioteca inteira
   por causa de três desenhos.                                               */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="5" fill="#18181B" />
      <path
        d="M6.5 14.5V7.5M11 14.5V10M15.5 14.5v-3.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function OlhoAberto() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2 10s2.9-5 8-5 8 5 8 5-2.9 5-8 5-8-5-8-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function OlhoFechado() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2 10s2.9-5 8-5 8 5 8 5-2.9 5-8 5-8-5-8-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3.5 16.5 16.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconeAlerta() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.1" r=".85" fill="currentColor" />
    </svg>
  )
}
