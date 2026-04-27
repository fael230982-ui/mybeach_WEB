# API 1.2 - Analise de Aproveitamento no MyBeach Admin

Data: 2026-04-27

## Fonte analisada

- Arquivo compartilhado: `C:\Users\Pc Rafa\Desktop\RAFIELS-MYBEACH\API\API Mbeach 1.2.txt`
- Copia versionada: `DOCS/API Mbeach 1.2.txt`
- OpenAPI JSON normalizado: `DOCS/API-Mbeach-1.2.openapi.json`

## Resultado geral

A API 1.2 cobre parte relevante das pendencias anteriores, mas nem todos os novos endpoints ja possuem schema de resposta suficientemente tipado para troca segura no admin.

Foi aproveitado agora apenas o que reduz retrabalho e preserva compatibilidade:

- novo formato de `GET /users/active`;
- campos novos de frota retornados por `FleetResponse`;
- regeneracao do cliente OpenAPI auxiliar;
- documentacao da API 1.2 dentro do repositorio.

## Novos endpoints identificados na 1.2

- `POST /auth/refresh`
- `GET /auth/me/privacy-consent`
- `POST /auth/me/privacy-consent`
- `GET /children/{child_id}/photo-policy`
- `GET /fleets/{fleet_id}/telemetry`
- `GET /kids/content`
- `POST /kids/content`
- `PATCH /kids/content/{content_id}`
- `POST /kids/content/{content_id}/request-publication`
- `POST /kids/content/{content_id}/review`
- `GET /kids/guardian-consents/current`
- `POST /kids/guardian-consents`
- `POST /kids/guardian-consents/revoke`
- `GET /kids/guardian-notifications`
- `POST /kids/guardian-notifications/{notification_id}/read`
- `GET /workforce`
- `GET /workforce/summary`
- `GET /workforce/shifts`

## Aproveitado agora

### `GET /users/active`

Antes o admin esperava array direto.

Na API 1.2 o contrato tipado e:

- `active_guards`
- `active_window_minutes`
- `generated_at`
- `items`

Alteracao aplicada:

- `src/lib/queries.ts` agora aceita array legado e objeto 1.2 com `items`;
- dashboard, relatorios e efetivo passam a reaproveitar o mesmo extractor;
- `tests/queries.test.ts` cobre o novo formato.

Impacto:

- sem quebra para API antiga;
- admin passa a consumir corretamente a 1.2 quando `users/active` retornar objeto.

### Frota

`FleetResponse` agora documenta:

- `current_crew`
- `base_sector`
- `last_ping`
- `updated_at`
- `latitude`
- `longitude`
- `assigned_post_id`
- `is_operational`

Alteracao aplicada:

- `src/lib/types.ts` reconhece os campos novos;
- `src/lib/fleet-data.ts` exporta latitude, longitude, posto vinculado e operacional;
- `src/app/admin/frota/page.tsx` mostra guarnicao/base novas e coordenadas quando existirem;
- `tests/fleet-data.test.ts` cobre o payload 1.2.

Impacto:

- a tela de frota fica pronta para telemetria basica retornada na listagem;
- ainda nao foi criada acao nova para `GET /fleets/{fleet_id}/telemetry`, porque a OpenAPI nao tipa a resposta.

### Cliente OpenAPI

Foi criada uma fonte local normalizada:

```text
DOCS/API-Mbeach-1.2.openapi.json
```

E o cliente auxiliar foi regenerado com:

```bash
npm run generate-api:local
```

Impacto:

- modelos novos ficam versionados em `generated/openapi-client`;
- o runtime principal continua usando wrappers internos em `src/lib`.

## Nao aproveitado agora

### `GET /workforce`, `/workforce/summary`, `/workforce/shifts`

Motivo:

- endpoints existem;
- responses aparecem com schema vazio na OpenAPI 1.2.

Decisao:

- manter modulo de efetivo derivado de `users` + `users/active`;
- nao trocar para endpoint sem contrato tipado.

### Kids no admin

Motivo:

- API 1.2 ja traz contratos de Kids, consentimento e notificacoes;
- o admin ainda nao possui modulo Kids;
- implementar agora criaria escopo novo de produto e moderacao.

Decisao:

- registrar como oportunidade futura;
- aguardar definicao de regras administrativas, permissoes e auditoria de moderacao.

### Refresh de sessao

Motivo:

- `POST /auth/refresh` existe e possui `TokenRefreshResponse`;
- fluxo atual do admin usa cookie `HttpOnly` e login via rota interna;
- integrar refresh exige decisao de seguranca sobre armazenamento, expiracao e rotacao.

Decisao:

- nao alterar sessao agora;
- registrar pendencia de alinhamento de seguranca.

### Consentimento LGPD no admin

Motivo:

- endpoints de consentimento existem para usuario autenticado;
- o painel admin ainda nao tem fluxo de aceite juridico proprio.

Decisao:

- nao criar gate sem texto juridico final e regra operacional.

## Conclusao

A API 1.2 ja reduz pendencias reais, principalmente em `users/active`, frota, Kids e consentimentos.

O admin foi atualizado apenas nos pontos com contrato suficiente e baixo risco:

- compatibilidade com `users/active` 1.2;
- telemetria basica de frota;
- cliente OpenAPI auxiliar 1.2;
- documentacao de pendencias restantes.

