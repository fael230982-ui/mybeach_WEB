# Status Tecnico - MyBeach Admin

Data: 2026-04-27

## Repositorio

- GitHub: `https://github.com/fael230982-ui/mybeach_WEB`
- Branch principal: `main`
- Modulo: painel web administrativo do MyBeach

## Estado validado

Ultima validacao tecnica executada:

- `npm run generate-api:local`: aprovado
- `npm run test`: aprovado, 55 testes
- `npm run lint`: aprovado
- `npm run build`: aprovado

## API de referencia

- API versionada no projeto: `DOCS/API-Mbeach-1.3.openapi.json`
- Fonte original copiada: `DOCS/API Mbeach 1.3.txt`
- Script local de geracao: `npm run generate-api:local`

## Contratos ja aproveitados da API 1.3

- `GET /users/active`: aceito em formato legado de array e formato com `items`.
- `GET /workforce`: usado como fonte preferencial de efetivo ativo quando retornar `items`.
- `GET /dashboard/stats`: aceita `metricas_cards` e `workforce.active_guards`.
- `GET /logs`: reconhece campos de auditoria 1.3 como perfil, recurso e IP.
- `GET /fleets`: campos operacionais reconhecidos no admin:
  - `current_crew`
  - `base_sector`
  - `latitude`
  - `longitude`
  - `assigned_post_id`
  - `is_operational`

## Comportamento degradado

O painel foi mantido defensivo:

- nao repete retry para `401`, `403`, `404` e demais erros de cliente;
- tenta preservar leitura parcial em dashboard, relatorios e efetivo;
- exibe erro operacional mais claro para sessao expirada, falta de permissao, recurso ausente, validacao e falha da API.

## Pendencias externas

Documento principal:

```text
DOCS/PENDENCIAS_BACKEND_RESTANTES_API_1_3_MYBEACH_ADMIN_2026-04-27.md
```

Copia compartilhada:

```text
C:\Users\Pc Rafa\Desktop\RAFIELS-MYBEACH\MYBEACH-ADMIN-PENDENCIAS-BACKEND-API-1-3-2026-04-27.md
```

Principais pendencias:

- fechar refresh de sessao para painel com cookie `HttpOnly`;
- definir governanca de Kids administrativo e LGPD no admin;
- definir uso operacional de telemetria individual de frota;
- consolidar metricas historicas de relatorios;
- padronizar tags da OpenAPI.

## Itens locais a observar

- `.codex-compare/` e ignorada pelo Git; se existir localmente, e apenas residuo temporario de comparacao.
- A copia antiga da API na raiz local e ignorada por `.gitignore`.
- O cliente OpenAPI em `generated/` e artefato auxiliar; o runtime usa wrappers internos em `src/lib`.
