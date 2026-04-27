# Pendencias Backend Restantes apos API 1.2 - MyBeach Admin

Data: 2026-04-27

## Contexto

Documento gerado apos revisao da `API Mbeach 1.2` e aplicacao dos ajustes seguros no `mybeach_WEB`.

## O que deixou de ser pendencia critica

### `GET /users/active`

Status: parcialmente resolvido.

A API 1.2 agora possui schema `UserActiveResponse` com:

- `active_guards`
- `active_window_minutes`
- `generated_at`
- `items`

O admin ja foi ajustado para consumir esse novo formato e manter compatibilidade com o array legado.

Pendencia residual:

- confirmar em ambiente real que o endpoint retorna exatamente esse payload;
- documentar se `active_guards` conta apenas `GUARDA` ou todos os perfis operacionais ativos.

### Frota basica

Status: parcialmente resolvido.

`FleetResponse` agora inclui campos operacionais importantes:

- `current_crew`
- `base_sector`
- `last_ping`
- `updated_at`
- `latitude`
- `longitude`
- `assigned_post_id`
- `is_operational`

O admin ja reconhece e exporta esses campos.

Pendencia residual:

- tipar formalmente `GET /fleets/{fleet_id}/telemetry`;
- documentar frequencia, origem e confiabilidade da telemetria.

## Pendencias obrigatorias restantes

### 1. Tipar respostas de workforce

Endpoints existem:

- `GET /workforce`
- `GET /workforce/summary`
- `GET /workforce/shifts`

Problema:

- a OpenAPI 1.2 expoe response `200` com schema vazio.

Necessario:

- criar schemas formais para lista, resumo e turnos;
- documentar campos obrigatorios;
- definir relacao entre operador, cidade, praia, posto, base, escala e turno.

Impacto:

Sem isso, o admin deve continuar usando a composicao conservadora de `users` + `users/active`.

### 2. Tipar `dashboard/stats`

Problema:

- response `200` ainda aparece com schema vazio.

Necessario:

- publicar schema de KPIs;
- explicitar se `efetivo` usa a mesma janela de `users/active`;
- documentar fontes e criterio de dados parciais.

Impacto:

Dashboard e relatorios ainda precisam tratar `stats` defensivamente.

### 3. Tipar logs/auditoria

Endpoints existem:

- `GET /logs`
- `GET /logs/`

Problema:

- nao ha schema dedicado para item de auditoria.

Necessario:

- schema com `id`, `created_at`, `action`, `endpoint`, `user`, `user_id`, `ip`, `status`;
- filtros por periodo, usuario, recurso e status;
- padronizacao de acoes criticas.

Impacto:

O admin continua normalizando logs abertos para exportacao.

### 4. Tipar telemetry endpoint de frota

Endpoint existe:

- `GET /fleets/{fleet_id}/telemetry`

Problema:

- response `200` esta sem schema.

Necessario:

- schema de telemetria atual;
- historico ou snapshot;
- timestamps;
- coordenadas;
- fonte do sinal;
- bateria, quando aplicavel;
- regra para unidade sem sinal.

Impacto:

O admin aproveita telemetria basica da listagem, mas nao deve criar tela detalhada de telemetria sem contrato.

### 5. Fechar semantica de refresh de sessao para painel admin

Endpoint existe:

- `POST /auth/refresh`

Problema:

- falta alinhamento de seguranca para uso em painel com cookie `HttpOnly`.

Necessario:

- definir onde fica refresh token;
- definir expiracao e rotacao;
- definir resposta em caso de token revogado;
- definir comportamento multi-aba.

Impacto:

O admin nao deve alterar sessao ate esse fluxo estar fechado.

## Pendencias importantes

### 6. Kids administrativo

API 1.2 adicionou:

- conteudo kids;
- consentimento parental;
- notificacoes parentais;
- politica de foto infantil.

Ainda falta para o admin:

- regra de permissao administrativa;
- escopo de moderacao;
- acoes permitidas e proibidas;
- trilha de auditoria administrativa;
- criterio juridico para visualizacao de dados infantis.

Impacto:

Nao implementar modulo Kids no admin sem desenho de governanca.

### 7. Consentimento LGPD no painel admin

Endpoints existem:

- `GET /auth/me/privacy-consent`
- `POST /auth/me/privacy-consent`

Ainda falta:

- texto juridico final;
- versao vigente;
- regra para bloquear painel sem aceite;
- comportamento para usuario administrativo que recusa ou precisa renovar.

### 8. Padronizar tags/nomes da OpenAPI

Foi observado que o cliente gerado criou nomes de servico com acentos/encoding, por exemplo serviço de usuarios com nome derivado de tag acentuada.

Necessario:

- padronizar tags da OpenAPI em ASCII ou nomes canonicos;
- evitar nomes gerados inconsistentes.

Impacto:

O cliente gerado e auxiliar, mas tags limpas reduzem risco para consumidores futuros.

## Melhorias futuras

### 9. Agregacoes oficiais para relatorios

Necessario:

- endpoint agregado para relatorios;
- resposta com fontes usadas;
- indicacao de dado parcial;
- filtros server-side.

### 10. Contrato de status canonico documentado

Ainda e importante manter documentado:

- status de alerta;
- status de frota;
- status de praia/zona;
- status de conteudo kids.

## Recomendacao de ordem para o backend

1. Tipar `workforce`, `workforce/summary` e `workforce/shifts`.
2. Tipar `dashboard/stats`.
3. Tipar logs/auditoria.
4. Tipar `fleets/{fleet_id}/telemetry`.
5. Fechar refresh de sessao para painel com cookie `HttpOnly`.
6. Definir governanca do Kids administrativo.
7. Fechar gate LGPD administrativo.
8. Padronizar tags da OpenAPI.

