import { useEffect, useState } from 'react'
import { verificarAutenticacao } from '../features/auth/api'

export function useSession() {
  const [autenticado, setAutenticado] = useState(false)
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function verificarSessao() {
      const emailSalvo = sessionStorage.getItem('budgetflow_email')
      if (emailSalvo) {
        try {
          const estaAutenticado = await verificarAutenticacao()
          if (estaAutenticado) {
            setEmail(emailSalvo)
            setAutenticado(true)
          } else {
            sessionStorage.removeItem('budgetflow_email')
          }
        } catch {
          sessionStorage.removeItem('budgetflow_email')
        }
      }
      setCarregando(false)
    }
    verificarSessao()
  }, [])

  return { autenticado, email, carregando, setAutenticado, setEmail }
}
