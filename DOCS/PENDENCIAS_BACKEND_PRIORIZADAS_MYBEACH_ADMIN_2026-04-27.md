# Pendencias Backend Priorizadas - MyBeach Admin

Data: 2026-04-27

## Objetivo

Consolidar as pendencias externas do backend em uma lista curta, evitando pedidos duplicados e retrabalho no painel web.

## Obrigatorio para producao

### 1. Alinhar `dashboard/stats` com `users/active`

Necessario:

- `stats.efetivo` deve seguir a mesma regra de `GET /users/active`;
- documentar janela operacional;
- evitar divergencia entre dashboard, relatorios e efetivo.

Impacto:

Sem isso, indicadores executivos podem divergir da leitura operacional.

### 2. Fechar contrato canonico de alertas

Status esperados:

- `REPORTED`
- `ACCEPTED`
- `IN_PROGRESS`
- `RESOLVED`
- `FALSE_ALARM`

Tipos esperados:

- `DROWNING`
- `MEDICAL`
- `LOST_CHILD`

Impacto:

Hoje o frontend aceita aliases por compatibilidade, mas isso deve ser temporario.

### 3. Tipar formalmente `GET /users/active`

Campos minimos:

- `id`
- `name`
- `role`
- `city_id`
- `city_name`
- `last_ping`
- `is_active`

Impacto:

Admin, mobile e relatorios dependem dessa leitura para presenca operacional.

### 4. Padronizar logs e auditoria

Campos minimos:

- `action`
- `endpoint`
- `user`
- `user_id`
- `status`
- `created_at`

Filtros esperados:

- periodo;
- usuario;
- recurso;
- status.

Impacto:

Sem contrato estavel, auditoria continua dependente de payloads abertos.

## Importante, mas pode vir depois

### 5. API dedicada de efetivo operacional

Endpoints sugeridos:

- `GET /workforce`
- `GET /workforce/summary`
- `GET /workforce/shifts`

Campos esperados:

- turno;
- base;
- funcao operacional;
- escala;
- lotacao;
- vinculo com posto, praia, cidade e unidade.

Impacto:

O modulo de efetivo deixaria de ser leitura derivada de usuarios.

### 6. Telemetria real de frota

Campos esperados:

- `last_ping`
- `latitude`
- `longitude`
- `updated_at`
- `status`
- `assigned_post_id`
- `battery_level`, quando aplicavel.

Impacto:

Frota passaria a representar rastreamento operacional real.

### 7. Endpoints agregados para dashboard e relatorios

Necessario:

- reduzir composicao no frontend;
- retornar respostas estaveis;
- sinalizar fontes parciais no proprio backend quando aplicavel.

Impacto:

Menos chamadas cruzadas e menos divergencia entre telas.

## Melhoria futura

### 8. Semantica multiplataforma de push

Necessario:

- definir se `fcm_token` continua como campo oficial;
- ou evoluir para `push_token` com `platform` e `provider`;
- evitar expor token bruto ao admin se for sensivel.

### 9. Padronizacao temporal

Necessario:

- formato unico de timestamp;
- timezone documentado;
- evitar texto livre como `Agora`.

### 10. Contratos futuros Kids/Admin

Antes de implementar modulos Kids no admin, o backend deve publicar:

- consentimento parental versionado;
- conteudo infantil com aprovacao do responsavel;
- notificacoes parentais;
- auditoria de revisao e publicacao.

## O que nao fazer no frontend agora

- Remover fallbacks antes do backend fechar contratos.
- Criar modulo Kids administrativo antes dos endpoints oficiais.
- Trocar enums locais sem resposta canonica publicada.
- Refatorar dashboard/relatorios para depender de endpoints ainda inexistentes.
- Assumir telemetria de frota sem contrato estavel.

