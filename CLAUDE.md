# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório.

## Visão geral

**BudgetFlow** é um app de orçamento pessoal — livro-caixa com receitas,
despesas, investimentos, compras parceladas e assinaturas. Este
repositório é só o front; o backend em Spring Boot vive em
[marcusWittho/budgetflow](https://github.com/marcusWittho/budgetflow).

- **Idioma**: português do Brasil, em tudo — texto de interface,
  comentários e nomes de variável. Nomes de campo que espelham DTOs do
  backend ficam em inglês, porque é assim que o JSON chega.
- **Backend**: `http://localhost:8080`, alcançado pelo proxy do Vite
- **Stack**: React 19, TypeScript, Vite. Sem framework de CSS, sem
  gerenciador de estado, sem roteador.

## Comandos

```bash
npm run dev       # servidor de desenvolvimento em http://localhost:5173
npm run build     # verifica tipos e gera dist/
npm run lint      # ESLint em .ts e .tsx
npm run preview   # serve o build local
npx tsc --noEmit  # só verifica tipos, sem gerar nada — mais rápido que o build
```

O front **exige o backend rodando** na 8080. Sem ele, o login devolve 502
e o proxy do Vite registra `ECONNREFUSED` no terminal.

## Autenticação — leia antes de mexer em sessão

Este é o ponto mais fácil de entender errado.

**Não existe token no código do front.** O `api/client.ts` não monta
cabeçalho `Authorization` em lugar nenhum. Quem autentica é um **cookie
`httpOnly`** que o backend define no login, e que o JavaScript não
consegue ler nem escrever.

O que faz isso funcionar é uma linha:

```ts
fetch(caminho, { ...opcoes, credentials: 'include' })
```

Por padrão o `fetch` não envia cookie. O `credentials: 'include'` liga o
envio, e o navegador anexa o cookie automaticamente em cada requisição.

**O que fica no armazenamento do navegador é só o e-mail**, e ele não
autentica nada — qualquer pessoa escreveria essa chave pelo console. Ele
serve para mostrar na barra lateral e para evitar uma ida inútil ao
servidor quando o usuário nunca entrou ali.

Consequência prática: **o F5 mantém a sessão** porque o cookie vive no
navegador, não na memória do React.

### Continuar conectado

`lib/session.ts` decide entre `sessionStorage` (morre ao fechar a aba) e
`localStorage` (sobrevive a fechar o navegador). O interruptor da tela de
login é exatamente essa escolha.

Todo acesso a armazenamento de sessão passa por esse arquivo. Não chame
`localStorage` direto num componente — foi um problema real aqui, com o
`App.tsx` e o `useSession` gerenciando a mesma informação em dois lugares.

### Ciclo de vida

O access token dura 15 minutos. Não há renovação automática: quando expira,
as chamadas voltam 401 e o `client.ts` traduz para "Sua sessão expirou.
Entre de novo." O backend já emite refresh token, então a peça existe —
falta o front usá-la.

## Estrutura

```
src/
  api/
    client.ts        requisitar<T>(), ApiError, mensagens por status
    types.ts         DTOs espelhando o backend
    index.ts         reexporta client e types
  features/
    auth/
      api.ts         entrar, registrar, sair, verificarAutenticacao, provisionar
      components/
        LoginForm.tsx / .css
    entries/
      api.ts         CRUD de lançamento, categorias, lookups
      components/EntryForm.tsx
      pages/EntriesPage.tsx
    dashboard/
      api.ts         só um comentário; o painel não existe ainda
  components/
    Layout.tsx / .css   barra lateral recolhível e faixa de topo
  hooks/
    useSession.ts    dono único do estado de sessão
  lib/
    session.ts       onde a sessão é guardada
    preferencias.ts  preferências de interface (barra recolhida)
  App.tsx            decide entre LoginForm e Layout
  main.tsx           monta o React
  theme.css          estilos gerais
```

Organização **por funcionalidade**, não por camada: cada pasta em
`features/` tem a própria `api.ts` e os próprios componentes. Ao adicionar
uma tela, crie a pasta dela em vez de espalhar por `components/` e
`services/`.

## Camada de API

`api/client.ts` tem uma função só, `requisitar<T>()`, e todo acesso HTTP
passa por ela. Ela cuida de três coisas fáceis de esquecer:

**`resposta.ok`.** O `fetch` só falha em erro de rede — um 401 é resposta
válida para ele. Sem checar o `ok`, você tenta ler JSON de um erro.

**204 No Content.** Não tem corpo. Chamar `.json()` ali dá erro de parse,
então ela devolve `undefined`.

**`ApiError`.** Preserva o status HTTP, porque o componente precisa
distinguir 401 (sessão expirou, mande entrar de novo) de 400 (o usuário
errou algo, mostre a mensagem).

Os tipos em `api/types.ts` são o contrato com o backend. Se um campo mudar
lá e não aqui, o TypeScript avisa no primeiro uso — é o principal motivo de
usar TypeScript num front que consome API.

### Endpoints

| Método | Caminho | O que faz |
|---|---|---|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Entrada |
| POST | `/api/auth/logout` | Saída; invalida o refresh token |
| GET | `/api/categories` | Árvore de categorias com subcategorias aninhadas |
| POST | `/api/categories/provision` | Cria a taxonomia inicial do usuário |
| GET | `/api/lookups` | Contas e formas de pagamento |
| GET | `/api/entries?month=YYYY-MM` | Lançamentos do mês |
| POST | `/api/entries` | Cria avulso, parcelado ou assinatura |
| PATCH | `/api/entries/{id}/pagar` | Marca como pago |
| DELETE | `/api/entries/{id}` | Remove |

Todos exigem autenticação: o `SecurityConfig` do backend tem
`anyRequest().authenticated()`. Só `/api/auth/**` e `/actuator/health`
ficam abertos.

**O `provision` é chamado no cadastro**, dentro do `LoginForm`. Sem ele o
usuário novo cai numa tela onde não é possível lançar nada, porque
`categoryId` é obrigatório e as tabelas nascem vazias para cada assinante.
O método é idempotente no backend.

## Identidade visual

Preto, cinza e branco. Sem cor.

```
#18181B  tinta        #A1A1AA  cinza claro
#3F3F46  grafite      #E4E4E7  borda
#71717A  cinza        #F4F4F5  fundo da página
                      #FFFFFF  cartão
```

Sem cor, o contraste vem de outro lugar: peso tipográfico, espaço em
branco, e **um único elemento pesado por tela** — na entrada, o botão preto
sólido contra o cartão branco.

Duas consequências que valem lembrar ao criar tela nova:

**Estado não se marca com cor.** O item ativo da barra lateral usa fundo
cinza e peso 600. Erro usa uma barra preta à esquerda. Se você recorrer a
verde ou vermelho, a identidade quebra.

**Entrada e saída se distinguem por posição, não por cor.** A tabela de
lançamentos tem duas colunas numéricas, Entra e Sai, como razão contábil.
O número aparece numa ou na outra.

O CSS fica ao lado do componente (`LoginForm.css`, `Layout.css`), com as
variáveis declaradas na classe raiz de cada um. `theme.css` tem o que é
global.

Números usam `font-variant-numeric: tabular-nums` — todos os dígitos com a
mesma largura, então as colunas alinham sem precisar de fonte
monoespaçada.

## Padrões

**Componentes funcionais e hooks.** Sem gerenciador de estado; suba o
estado quando dois componentes precisarem do mesmo dado.

**Sem roteador.** A navegação é estado no `Layout.tsx`. Se um dia precisar
de URL por tela, aí entra o React Router.

**Valor derivado não vira estado.** Totais, listas filtradas e opções de
dropdown são calculados a partir do estado a cada renderização. Guardar em
`useState` o que dá para calcular cria duas fontes da mesma verdade.

**`useEffect` que busca dados precisa de cancelamento:**

```ts
useEffect(() => {
  let cancelado = false
  async function buscar() { /* ... if (!cancelado) setX(dados) */ }
  buscar()
  return () => { cancelado = true }
}, [dependencias])
```

Sem isso, o usuário troca de mês e uma resposta lenta do mês anterior
sobrescreve a que já chegou.

**Recarregar lista após criar** usa um contador de versão nas dependências
do efeito. É simples e legível; times maiores usariam React Query.

**Acessibilidade não é opcional.** A caixa de "continuar conectado" é um
`<input type="checkbox">` de verdade, escondido no CSS — é ele que recebe
foco do teclado e que leitores de tela anunciam. O item ativo da barra usa
`aria-current="page"`, e o CSS estiliza por esse atributo, então o visual e
a semântica nunca saem de sincronia.

## O que não existe ainda

- **Dashboard** — `features/dashboard/api.ts` é só um comentário. Depende
  de endpoints de agregação que o backend não tem.
- **Contas, orçamento e recorrentes** — itens da barra lateral
  desabilitados, com o selo "em breve".
- **Renovação de sessão** — o backend emite refresh token em cookie, mas o
  front não chama `/api/auth/refresh` ao receber 401.
- **Recuperar senha, OAuth, confirmação de e-mail** — nada disso tem
  backend. Não adicione o botão sem o endpoint: botão morto é pior que
  botão ausente.
- **Testes** — nenhum arquivo de teste, nenhum runner configurado.

## Ao mexer aqui

**Adicionar endpoint:** declare o tipo em `api/types.ts`, exporte em
`api/index.ts`, e crie a função na `api.ts` da funcionalidade
correspondente. Nunca chame `fetch` direto num componente.

**Adicionar tela:** crie `features/nome/` com `api.ts`, `components/` e
`pages/`. Acrescente o item em `ITENS` no `Layout.tsx` — a ordem do array
é a ordem na tela.

**Depurar chamada:** aba Network do navegador. Se der 502, o backend está
fora do ar. Se der 401 logo após entrar, o cookie não está sendo enviado —
confira o `credentials: 'include'` e o `refresh-cookie-secure: false` no
`application-local.yaml` do backend, porque cookie `Secure` não trafega em
`http://localhost`.

**Antes de commitar:** rode `npx tsc --noEmit`. Ele pega erro em arquivo
que você não abriu, e é mais rápido que esperar o Vite reclamar.

**Mantenha este arquivo atualizado.** A versão anterior descrevia
`src/api.ts` e afirmava que o token vivia em memória — dois fatos que
deixaram de ser verdade e que levaram a conclusões erradas sobre o próprio
sistema.
