# Plano de Componentização - EntryForm.tsx

**Objetivo:** Componentizar o formulário de lançamentos em módulos reutilizáveis com CSS Modules

**Tempo estimado:** 6-8 horas  
**Data de criação:** 2026-09-05

---

## 1. Visão Geral

### Análise Atual
- **Arquivo:** `/src/features/entries/components/EntryForm.tsx` (318 linhas)
- **Problema:** Monolítico, difícil de testar e reutilizar
- **Solução:** Quebrar em 13 componentes/hooks reutilizáveis com CSS Modules

### Resultado Esperado
- Arquitetura modular e testável
- Componentes reutilizáveis (FormFieldSelect, FormFieldInput)
- Estilos encapsulados com CSS Modules
- Fluxo de dados explícito via props

---

## 2. Estrutura de Diretórios

```
src/features/entries/components/
├── EntryForm.tsx
├── EntryForm.module.css
│
└── form/
    ├── EntryFormContent.tsx
    ├── EntryFormContent.module.css
    │
    ├── fields/
    │   ├── FormFieldSelect.tsx
    │   ├── FormFieldSelect.module.css
    │   ├── FormFieldInput.tsx
    │   └── FormFieldInput.module.css
    │
    ├── sections/
    │   ├── CategorySection.tsx
    │   ├── CategorySection.module.css
    │   ├── BasicFieldsSection.tsx
    │   ├── BasicFieldsSection.module.css
    │   ├── AccountSection.tsx
    │   ├── AccountSection.module.css
    │   ├── RepetitionSection.tsx
    │   ├── RepetitionSection.module.css
    │   ├── RepetitionNote.tsx
    │   └── RepetitionNote.module.css
    │
    ├── shared/
    │   ├── formShared.module.css      (reutilizável)
    │   └── formVariables.css          (variáveis específicas)
    │
    ├── hooks/
    │   ├── useEntryFormState.ts
    │   └── useFormData.ts
    │
    └── constants/
        └── formConstants.ts
```

---

## 3. Componentes a Criar

### Componentes de Campo (Reutilizáveis)

#### **FormFieldSelect**
- Props: `label`, `value`, `onChange`, `options`, `disabled`, `required`, `error`
- Responsabilidade: Select padronizado com estilos

#### **FormFieldInput**
- Props: `label`, `value`, `onChange`, `type`, `inputMode`, `placeholder`, `required`, `flex`
- Responsabilidade: Input padronizado com estilos

### Componentes de Seção (Compostos)

#### **CategorySection**
- Composição: Tipo + Categoria + Subcategoria
- Dependências: `FormFieldSelect`

#### **BasicFieldsSection**
- Composição: Data + Descrição + Valor
- Dependências: `FormFieldInput`

#### **AccountSection**
- Composição: Conta + Forma de Pagamento + Situação
- Dependências: `FormFieldSelect`

#### **RepetitionSection**
- Lógica condicional de repetição/parcelamento
- Dependências: `FormFieldSelect`, `FormFieldInput`, `RepetitionNote`

#### **RepetitionNote**
- Renderização condicional de notas informativas

### Custom Hooks

#### **useFormData**
- Carrega categorias e lookups
- Retorna: `{ categorias, lookups, carregando, erro }`

#### **useEntryFormState**
- Centraliza todo o estado do formulário
- Retorna: `{ estado, handlers, reset }`

### Orquestradores

#### **EntryFormContent**
- Renderiza conteúdo do formulário (sem abrir/fechar)
- Compõe todas as seções

#### **EntryForm** (refatorado)
- Orquestração + abertura/fechamento
- Usa hooks e `EntryFormContent`

---

## 4. CSS Modules - Convenções

### Nomenclatura
```
[componente]__[elemento]--[modificador]
```

Exemplos:
```css
.fieldContainer { }
.label { }
.select { }
.select--error { }
.section__line { }
.conditionalFields--hidden { }
```

### Estilos Compartilhados

**formShared.module.css:**
```css
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.rowItem { flex: 1; min-width: 140px; }
.rowItem--halfWidth { flex: 0.5; }
.label { font-size: 0.78rem; color: var(--apoio); }
.fieldContainer { display: flex; flex-direction: column; gap: 5px; }
.errorMessage { color: var(--alerta); margin-top: 12px; }
.note { font-size: 0.76rem; color: var(--apoio); }
```

### Importação

```typescript
// Estilos específicos
import styles from './FormFieldSelect.module.css'

// Estilos compartilhados
import shared from '../shared/formShared.module.css'

// Uso
<div className={shared.row}>
  <div className={shared.rowItem}>
    <select className={styles.select} />
  </div>
</div>
```

---

## 5. Cronograma - 7 Fases

### Fase 1: Constantes e Estilos Compartilhados ⏱️ 30 min
- [ ] Criar `constants/formConstants.ts`
- [ ] Criar `shared/formShared.module.css`
- [ ] Criar `shared/formVariables.css`

### Fase 2: Componentes de Campo ⏱️ 45 min
- [ ] Criar `fields/FormFieldSelect.tsx` + `.module.css`
- [ ] Criar `fields/FormFieldInput.tsx` + `.module.css`
- [ ] Testes unitários

### Fase 3: Custom Hooks ⏱️ 60 min
- [ ] Criar `hooks/useFormData.ts`
- [ ] Criar `hooks/useEntryFormState.ts`
- [ ] Testes dos hooks

### Fase 4: Componentes de Seção ⏱️ 90 min
- [ ] `sections/CategorySection.tsx` + `.module.css`
- [ ] `sections/BasicFieldsSection.tsx` + `.module.css`
- [ ] `sections/AccountSection.tsx` + `.module.css`
- [ ] `sections/RepetitionNote.tsx` + `.module.css`
- [ ] `sections/RepetitionSection.tsx` + `.module.css`

### Fase 5: Componente de Conteúdo ⏱️ 45 min
- [ ] Criar `EntryFormContent.tsx` + `.module.css`
- [ ] Compor todas as seções
- [ ] Testes

### Fase 6: Refatoração Principal ⏱️ 30 min
- [ ] Refatorar `EntryForm.tsx`
- [ ] Criar `EntryForm.module.css`
- [ ] Verificar compatibilidade com `EntriesPage.tsx`

### Fase 7: Testes de Integração ⏱️ 60 min
- [ ] Testes end-to-end
- [ ] Verificar fluxo completo
- [ ] Correções finais

**Total: ~360 min (~6 horas)**

---

## 6. Fluxo de Dados

```
EntryForm (orquestrador)
    ├── useEntryFormState()
    │   └── estado + handlers
    ├── useFormData()
    │   └── categorias, lookups, carregando, erro
    └── EntryFormContent
        ├── CategorySection
        │   └── FormFieldSelect (3x)
        ├── BasicFieldsSection
        │   └── FormFieldInput (3x)
        ├── AccountSection
        │   └── FormFieldSelect (3x)
        └── RepetitionSection
            ├── FormFieldSelect
            ├── FormFieldInput (condicional)
            └── RepetitionNote (condicional)
```

---

## 7. Padrões TypeScript

### Props Tipadas

```typescript
// Componente de campo
type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

// Seção composta
type Props = {
  tipo: Category['type']
  onTipoChange: (tipo: Category['type']) => void
  categoriaId: string
  onCategoriaChange: (id: string) => void
  categorias: Category[]
}
```

### Custom Hook

```typescript
function useEntryFormState() {
  const [tipo, setTipo] = useState<Category['type']>('expense')
  // ... mais state
  
  return {
    estado: { tipo, categoriaId, /* ... */ },
    handlers: { setTipo, setCategoriaId, /* ... */ },
    reset: () => { /* ... */ }
  }
}
```

---

## 8. Testes Recomendados

### Unitários

- **FormFieldSelect:** renderiza, muda valor, respeita disabled
- **useEntryFormState:** estado inicial, transições, validação
- **useFormData:** carrega dados, trata erros, cleanup
- **CategorySection:** filtra por tipo, subcategorias

### Integração

- **EntryFormContent:** renderiza todas as seções, submissão
- **EntryForm:** abre/fecha, integração com EntriesPage

### Cobertura

- Componentes pequenos: 80%+
- Hooks: 85%+
- Integração: casos principais

---

## 9. Riscos e Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Muitos arquivos | Complexidade | Começar com 3-4 componentes-chave |
| Props drilling | Verbosidade | Aceitar trade-off, adicionar Context se necessário |
| Sincronização de estado | Bugs | Testes de integração, props explícitas |
| Regressões | Falha funcional | Testes antes de refatorar |

---

## 10. Benefícios Esperados

✅ **Encapsulamento** — CSS Modules isolam estilos  
✅ **Reutilização** — Componentes de campo + seção reutilizáveis  
✅ **Testabilidade** — Cada componente testável isoladamente  
✅ **Manutenção** — Alterações localizadas  
✅ **Escalabilidade** — Fácil adicionar novos campos  
✅ **Performance** — Menos re-renders desnecessários  

---

## 11. Referências

- **Projeto:** `/home/wittho/projetos/lwv/react-budgetflow/`
- **Arquivo atual:** `src/features/entries/components/EntryForm.tsx`
- **Arquivo API:** `src/features/entries/api.ts`
- **Tipos:** `src/api/types.ts`
- **Tema:** `src/theme.css` (variáveis globais)

---

## 12. Histórico de Implementação

| Data | Fase | Status | Notas |
|------|------|--------|-------|
| 2026-09-05 | Planejamento | ✅ | Plano aprovado |
| | Fase 1 | ⏳ | Em progresso |
| | Fase 2 | ⏳ | Pendente |
| | Fase 3 | ⏳ | Pendente |
| | Fase 4 | ⏳ | Pendente |
| | Fase 5 | ⏳ | Pendente |
| | Fase 6 | ⏳ | Pendente |
| | Fase 7 | ⏳ | Pendente |

---

**Próxima ação:** Iniciar Fase 1
