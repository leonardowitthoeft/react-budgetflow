import { LoginForm } from './features/auth/components/LoginForm'
import * as authApi from './features/auth/api'
import { Layout } from './components/Layout'
import { useSession } from './hooks/useSession'

function App() {
  const { autenticado, email, carregando, entrou, saiu } = useSession()

  // Enquanto o hook pergunta ao servidor se a sessao vale, nao da para
  // decidir qual tela mostrar. Sem esta etapa, o usuario veria a tela de
  // login por um instante antes de ser jogado para dentro do app.
  if (carregando) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100vh',
          background: '#F4F4F5',
          color: '#71717A',
          fontSize: '.9rem',
        }}
      >
        Carregando…
      </div>
    )
  }

  if (!autenticado) {
    return <LoginForm onEntrou={entrou} />
  }

  return (
    <Layout
      email={email}
      onSair={async () => {
        // O logout do backend invalida o refresh token e apaga o cookie.
        // Se ele falhar, limpamos o lado do cliente de qualquer forma —
        // deixar o usuario preso numa tela por causa disso seria pior.
        try {
          await authApi.sair()
        } finally {
          saiu()
        }
      }}
    />
  )
}

export default App
