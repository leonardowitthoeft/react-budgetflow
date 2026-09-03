import { useEffect, useState } from 'react'
import { verificarAutenticacao } from '../features/auth/api'
import { lerEmailSalvo, limparSessao, salvarSessao } from '../lib/session'

/**
 * Estado da sessão.
 *
 * O hook e o dono unico dessa informacao: quem precisa entrar ou sair
 * chama entrou() e saiu(), sem tocar em armazenamento direto. Antes o
 * App.tsx chamava sessionStorage por conta propria — duas fontes da mesma
 * verdade, que uma hora saem de sincronia.
 */
export function useSession() {
  const [autenticado, setAutenticado] = useState(false)
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(true)

  // useEffect com array vazio roda uma vez, depois que a tela e desenhada.
  // E o momento certo para perguntar ao servidor se a sessao ainda vale.
  useEffect(() => {
    let cancelado = false

    async function verificar() {
      const salvo = lerEmailSalvo()

      // Sem e-mail salvo, o usuario nunca entrou neste navegador. Nao vale
      // gastar uma ida ao servidor para descobrir isso.
      if (!salvo) {
        if (!cancelado) setCarregando(false)
        return
      }

      try {
        // Quem autentica de verdade e o cookie httpOnly, enviado
        // automaticamente pelo navegador. O e-mail salvo e so uma pista.
        const valida = await verificarAutenticacao()

        if (cancelado) return

        if (valida) {
          setEmail(salvo)
          setAutenticado(true)
        } else {
          limparSessao()
        }
      } catch {
        // Servidor fora do ar ou erro de rede. Limpa para nao deixar o
        // usuario preso numa tela que nao carrega nada.
        if (!cancelado) limparSessao()
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    verificar()

    // Roda quando o componente sai da tela: impede atualizar estado de
    // algo que nao existe mais.
    return () => {
      cancelado = true
    }
  }, [])

  function entrou(novoEmail: string, persistir: boolean) {
    salvarSessao(novoEmail, persistir)
    setEmail(novoEmail)
    setAutenticado(true)
  }

  function saiu() {
    limparSessao()
    setEmail('')
    setAutenticado(false)
  }

  return { autenticado, email, carregando, entrou, saiu }
}
