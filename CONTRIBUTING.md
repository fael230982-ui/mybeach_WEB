# Contribuicao

## Padrao geral

- Mantenha alteracoes pequenas, objetivas e relacionadas ao problema tratado.
- Antes de publicar, execute os testes aplicaveis.
- Nao versionar credenciais, tokens, `.env`, chaves privadas ou dados sensiveis.
- Atualize o `CHANGELOG.md` quando a alteracao mudar comportamento, contrato, tela ou fluxo operacional.
- Preserve os handoffs tecnicos quando houver mudanca relevante de integracao com backend ou outros modulos.

## Commits

Use mensagens objetivas, por exemplo:

```bash
feat: adiciona modulo de auditoria
fix: corrige filtro de efetivo ativo
docs: atualiza pendencias de backend
chore: prepara publicacao inicial
```

## Validacao minima

```bash
npm run test
npm run lint
npm run build
```

