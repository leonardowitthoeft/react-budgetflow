import { useEffect, useState } from 'react'
import { ApiError } from '@/api/client'
import type { Category, Lookups } from '@/api/types'
import * as entriesApi from '@/features/entries/api'

type UseFormDataReturn = {
  categorias: Category[]
  lookups: Lookups
  carregando: boolean
  erro: string | null
}

export function useFormData(): UseFormDataReturn {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [lookups, setLookups] = useState<Lookups>({ accounts: [], paymentMethods: [] })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        setCarregando(true)
        setErro(null)

        const [cats, lks] = await Promise.all([
          entriesApi.obterCategorias(),
          entriesApi.obterLookups(),
        ])

        if (!cancelado) {
          setCategorias(cats)
          setLookups(lks)
        }
      } catch (e) {
        if (!cancelado) {
          const mensagem = e instanceof ApiError || e instanceof Error
            ? e.message
            : 'Não consegui carregar as categorias.'
          setErro(mensagem)
        }
      } finally {
        if (!cancelado) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      cancelado = true
    }
  }, [])

  return { categorias, lookups, carregando, erro }
}
