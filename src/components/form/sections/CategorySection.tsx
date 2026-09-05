import shared from '../shared/formShared.module.css'
import { FormFieldSelect } from '../fields/FormFieldSelect'
import type { Category } from '@/api/types'
import { TIPOS } from '@/components/form/constants/formConstants'

type Props = {
  tipo: Category['type']
  onTipoChange: (tipo: Category['type']) => void
  categoriaId: string
  onCategoriaChange: (id: string) => void
  subcategoriaId: string
  onSubcategoriaChange: (id: string) => void
  categorias: Category[]
}

export function CategorySection({
  tipo,
  onTipoChange,
  categoriaId,
  onCategoriaChange,
  subcategoriaId,
  onSubcategoriaChange,
  categorias,
}: Props) {
  const categoriasDoTipo = categorias.filter((c) => c.type === tipo)
  const subcategorias =
    categorias.find((c) => c.id === categoriaId)?.subcategories ?? []

  return (
    <div className={shared.row}>
      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Tipo"
          value={tipo}
          onChange={(v) => onTipoChange(v as Category['type'])}
          options={TIPOS as unknown as Array<{ valor: string; rotulo: string }>}
        />
      </div>

      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Categoria"
          value={categoriaId}
          onChange={onCategoriaChange}
          options={categoriasDoTipo.map((c) => ({
            valor: c.id,
            rotulo: c.name,
          }))}
          required
        />
      </div>

      <div className={shared.rowItem}>
        <FormFieldSelect
          label="Subcategoria"
          value={subcategoriaId}
          onChange={onSubcategoriaChange}
          options={subcategorias.map((s) => ({
            valor: s.id,
            rotulo: `${s.name}${s.nature === 'fixed' ? ' (fixa)' : ''}`,
          }))}
          disabled={subcategorias.length === 0}
          placeholder="nenhuma"
        />
      </div>
    </div>
  )
}
