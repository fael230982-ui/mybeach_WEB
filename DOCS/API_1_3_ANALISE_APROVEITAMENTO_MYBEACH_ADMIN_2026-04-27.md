# API 1.3 - Analise de Aproveitamento no MyBeach Admin

Data: 2026-04-27

## Referencias

- Arquivo compartilhado: `C:\Users\Pc Rafa\Desktop\RAFIELS-MYBEACH\API\API Mbeach 1.3.txt`
- Copia versionada: `DOCS/API Mbeach 1.3.txt`
- OpenAPI JSON normalizado: `DOCS/API-Mbeach-1.3.openapi.json`
- Cliente auxiliar: `generated/openapi-client`

## Resumo

A API 1.3 nao adiciona novas rotas em relacao a 1.2, mas melhora o contrato de respostas que antes estavam sem schema suficiente. Isso reduz pendencia de integracao em dashboard, efetivo, logs e telemetria de frota.

## Contratos novos ou corrigidos

- `GET /dashboard/stats`: agora possui `DashboardStatsResponse`.
- `GET /workforce`: agora possui `WorkforceListResponse`.
- `GET /workforce/summary`: agora possui `WorkforceSummaryResponse`.
- `GET /workforce/shifts`: agora possui `WorkforceShiftsResponse`.
- `GET /fleets/{fleet_id}/telemetry`: agora possui `FleetTelemetryResponse`.
- `GET /logs`: agora possui `AuditLogResponse`.
- `ChildPhotoPolicyResponse` foi adicionado para politicas de foto infantil.

## Aproveitamento aplicado no admin

- `npm run generate-api:local` passa a usar a OpenAPI 1.3 versionada.
- `src/lib/queries.ts` aceita o formato 1.3 de `dashboard/stats`, incluindo `metricas_cards` e `workforce.active_guards`.
- `src/lib/queries.ts` usa `GET /workforce` como fonte preferencial de efetivo ativo quando retornar `items`, mantendo fallback para `GET /users/active`.
- `src/lib/types.ts` reconhece campos de auditoria 1.3:
  - `user_role`
  - `resource_type`
  - `resource_id`
  - `details`
  - `ip_address`
- `/admin/logs` exporta os novos campos de auditoria no CSV e exibe perfil/recurso na tabela.

## Decisoes conservadoras

- O admin nao passou a depender exclusivamente de `GET /workforce`, porque a tela de efetivo ainda precisa de `/users` para cadastro completo, e `workforce` representa apenas a leitura operacional ativa.
- `dashboard/stats` foi normalizado sem inventar metricas que a API nao entrega. Os campos 1.3 sao preservados e `efetivo` e preenchido a partir de `workforce.active_guards` quando disponivel.
- Telemetria individual de frota foi documentada, mas nao virou tela nova neste ciclo para evitar fluxo sem homologacao guiada.

## Validacao esperada

Executar:

```bash
npm run generate-api:local
npm run test
npm run lint
npm run build
```

