# Guia de Deploy - MyBeach Admin

Data: 2026-04-27

## Objetivo

Preparar o deploy do painel sem alterar arquitetura ou depender de nova API.

## Requisitos

- Node.js compativel com Next.js 16.
- `npm install` executado.
- Variaveis de ambiente configuradas.
- Acesso ao backend configurado em `NEXT_PUBLIC_API_URL`.

## Variaveis

Ambiente operacional:

```bash
NEXT_PUBLIC_API_URL=https://api.mybeach.com.br
NEXT_PUBLIC_ENABLE_MOBILE_DEMO=false
```

Ambiente de demonstracao interna:

```bash
NEXT_PUBLIC_API_URL=https://api.mybeach.com.br
NEXT_PUBLIC_ENABLE_MOBILE_DEMO=true
```

## Validacao antes do deploy

```bash
npm run test
npm run lint
npm run build
```

Resultado esperado:

- testes aprovados;
- lint sem erro;
- build finalizado com sucesso.

## Execucao local de producao

```bash
npm run build
npm run start
```

## Deploy em Vercel

Configuracao sugerida:

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output: padrao Next.js

Variaveis obrigatorias:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ENABLE_MOBILE_DEMO`

Cuidados:

- nao cadastrar `.env.local` no Git;
- revisar se a URL da API esta apontando para ambiente correto;
- manter `/mobile` desligado em producao, salvo demonstracao autorizada.

## Deploy em VPS

Fluxo minimo:

```bash
npm install
npm run build
npm run start
```

Recomendado:

- executar atras de proxy reverso com HTTPS;
- configurar reinicio por processo supervisionado;
- registrar logs de aplicacao;
- restringir acesso administrativo conforme ambiente.

## Verificacoes pos-deploy

- [ ] `/login` abre.
- [ ] Login valido cria sessao.
- [ ] `/admin` carrega.
- [ ] `/admin/logs` respeita permissao.
- [ ] `/admin/mapa` renderiza.
- [ ] Exportacao CSV funciona em ao menos uma tela.
- [ ] Erros de backend aparecem de forma compreensivel.
- [ ] Nao ha variavel sensivel exposta no repositorio.

## Rollback

Como o repositorio esta versionado no GitHub, o rollback deve usar commit/tag conhecido.

Procedimento sugerido:

1. Identificar commit estavel.
2. Reimplantar o commit anterior no provedor.
3. Validar login, dashboard e rotas principais.
4. Registrar motivo do rollback no `CHANGELOG.md`.

