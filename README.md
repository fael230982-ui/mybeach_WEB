# MyBeach Admin

Painel administrativo em Next.js para operacao, monitoramento e gestao do ecossistema MyBeach.

## Autoria

- Nome: RAFAEL DA SILVA BEZEERA
- E-mail: FAEL230982@GMAIL.COM
- Cargo: DESENVOLVEDOR E PROJETISTA

## Repositorio

- GitHub: `https://github.com/fael230982-ui/mybeach_WEB`
- Modulo: painel web administrativo do MyBeach

## Documentos do repositorio

- `LICENSE`
- `AUTHORSHIP.md`
- `AUTHORS.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CHECKLIST.md`

## Requisitos

```bash
npm install
```

## Variaveis de ambiente

Crie um `.env.local` com:

```bash
NEXT_PUBLIC_API_URL=https://api.mybeach.com.br
NEXT_PUBLIC_ENABLE_MOBILE_DEMO=false
```

`NEXT_PUBLIC_ENABLE_MOBILE_DEMO` libera a rota `/mobile` apenas para demos internas.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:e2e
npm run generate-api
```

## Fluxos principais

- `/login`: autenticacao do painel
- `/admin`: dashboard operacional
- `/admin/usuarios`: gestao centralizada de usuarios e acessos
- `/admin/logs`: auditoria restrita a `MASTER` e `ADMIN`

## Convencoes do painel

- Filtros operacionais relevantes persistem na URL em telas como dashboard, relatorios, usuarios, frota, praias, postos, zonas e mapa.
- Rotas administrativas sensiveis sao protegidas no `middleware.ts` e continuam dependendo de validacao de permissao no backend.
- A pagina `/admin/efetivo` ja consolida leitura operacional derivada de `users` e `users/active`, com fallback por `last_ping` quando a fonte de ativos falha.
- Redirecionamentos de retorno (`next`) aceitam apenas caminhos relativos de `/admin`, evitando open redirect no fluxo de login.

## Observacoes de arquitetura

- A sessao do painel usa cookie `HttpOnly`; o frontend autenticado conversa com a API via proxy interno e o middleware protege as rotas administrativas.
- O consumo de dados compartilhados usa React Query em `src/lib/queries.ts`.
- Queries nao repetem `retry` para erros `401`, `403`, `404` e outros erros de cliente; o retry fica reservado para falhas transientes.
- Dashboard e relatorios agora sinalizam quando carregam dados parciais por indisponibilidade de uma ou mais fontes do backend, em vez de parecerem "zerados".
- As chamadas autenticadas do frontend passam pelo proxy interno `src/app/api/proxy/[...path]/route.ts`, que responde `502` quando o backend configurado nao esta acessivel.
- A sessao administrativa e aberta em `src/app/api/session/login/route.ts` com cookie `HttpOnly`.

## Geracao do cliente OpenAPI

```bash
npm run generate-api
```

O cliente gerado fica em `generated/openapi-client`.

Ele nao faz parte do runtime atual do frontend; serve apenas como artefato auxiliar de contrato e referencia. Depois de regenerar, revise os wrappers de `src/lib/queries.ts` e qualquer adaptacao de tipos em `src/lib/types.ts`.

## Qualidade

- `npm run lint` valida o padrao do projeto.
- `npm run test` cobre helpers e regras compartilhadas.
- `npm run test:e2e` executa os cenarios de login e autorizacao via Playwright.

## E2E

Para os testes E2E, defina:

```bash
E2E_BASE_URL=http://127.0.0.1:3000
E2E_ADMIN_EMAIL=admin@exemplo.com
E2E_ADMIN_PASSWORD=senha
E2E_GV_EMAIL=gv@exemplo.com
E2E_GV_PASSWORD=senha
```

Os cenarios pulam automaticamente quando as credenciais de ambiente nao estiverem configuradas.
