import { useSession } from './hooks/useSession'
import { LoginForm } from './features/auth/components/LoginForm'
import { Layout } from './components/Layout'
import * as authApi from './features/auth/api'

function App() {
  const { autenticado, email, carregando, setAutenticado, setEmail } = useSession()

  if (carregando) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>
  }

  if (!autenticado) {
    return (
      <LoginForm
        onEntrou={(e) => {
          sessionStorage.setItem('budgetflow_email', e)
          setEmail(e)
          setAutenticado(true)
        }}
      />
    )
  }

  return (
    <Layout
      email={email}
      onSair={async () => {
        await authApi.sair()
        sessionStorage.removeItem('budgetflow_email')
        setAutenticado(false)
      }}
    />
  )
}

export default App
