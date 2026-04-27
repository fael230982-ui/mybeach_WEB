# Pendencias Backend Restantes apos API 1.3 - MyBeach Admin

Data: 2026-04-27

Documento gerado apos revisao da `API Mbeach 1.3` e aplicacao dos ajustes seguros no `mybeach_WEB`.

## Status geral

A API 1.3 resolveu parte importante das pendencias de contrato da 1.2:

- `dashboard/stats` passou a ter schema de resposta.
- `workforce`, `workforce/summary` e `workforce/shifts` passaram a ter schemas de resposta.
- `logs` passou a ter schema de auditoria.
- `fleets/{fleet_id}/telemetry` passou a ter schema de telemetria.

## Pendencias ainda existentes

### 1. Refresh de sessao do painel

O backend expoe `POST /auth/refresh`, mas ainda falta fechar o comportamento esperado para o painel web com cookie `HttpOnly`:

- origem do refresh token;
- tempo de vida da sessao administrativa;
- resposta quando o refresh expira;
- estrategia de renovacao transparente pelo proxy interno.

### 2. Governanca administrativa de Kids e LGPD

A API possui contratos de criancas, consentimentos e politica de foto infantil, mas o painel ainda precisa de definicao operacional antes de expor gestao administrativa:

- quais perfis podem consultar dados infantis;
- quais campos devem ser mascarados;
- trilha de auditoria obrigatoria para consulta/exportacao;
- regras de retencao e remocao;
- aprovacao juridica/LGPD para uso em ambiente administrativo.

### 3. Telemetria de frota

`GET /fleets/{fleet_id}/telemetry` agora esta tipado, mas ainda falta definir o fluxo de uso:

- se a telemetria sera exibida em detalhe da viatura;
- intervalo de atualizacao recomendado;
- comportamento quando `latitude`, `longitude` ou `last_ping` estiverem ausentes;
- se havera historico ou apenas estado atual.

### 4. Relatorios consolidados

`dashboard/stats` entrega metricas operacionais atuais, mas ainda nao entrega todos os indicadores historicos usados em relatorios:

- frota disponivel;
- resgates por periodo;
- preventivas por periodo;
- filtros oficiais por intervalo de data/cidade/praia;
- definicao de periodo para indicadores semanais.

### 5. Padronizacao de OpenAPI

Ainda vale revisar a OpenAPI para reduzir ruido em geracao automatica:

- tags com acentuacao ou encoding inconsistente;
- nomes de schemas padronizados;
- contratos de erro por status;
- exemplos de payload para responses principais.

## Pendencias locais que nao dependem de nova API

- Homologacao guiada por perfil e por tela em ambiente real.
- Validacao visual/manual com dados reais.
- Decisao de produto sobre telas novas para Kids e telemetria detalhada.

## Conclusao

A API 1.3 esta melhor que a 1.2 para o painel web e ja pode ser usada como referencia principal. O que resta no backend e mais ligado a governanca, sessao, relatorios historicos e definicao de fluxo do que a ausencia basica de schemas.

