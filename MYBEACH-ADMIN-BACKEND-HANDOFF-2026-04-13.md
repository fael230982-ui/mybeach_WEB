# MYBEACH ADMIN - HANDOFF FINAL PARA BACKEND

Data: 2026-04-13
Origem: consolidação final após múltiplos lotes de ajustes no `mybeach-admin`

## Situação atual do admin

O `mybeach-admin` ficou funcional e robusto mesmo sem novas entregas imediatas do backend.

O frontend já absorveu e/ou tratou:

- `PATCH /alerts/{alert_id}/status`
- `GET /users/active`
- `last_ping`
- `is_active`
- `battery_level`
- aliases antigos de status e tipo de alerta
- exportações CSV locais para dashboard, relatórios, efetivo, frota, logs, municípios, praias, postos e zonas

Em resumo: o admin está operando, mas ainda cobre várias lacunas do backend com fallback, normalização defensiva e composição local.

## O que ainda falta do backend

### 1. Tornar `dashboard/stats` consistente com `users/active`

Hoje o admin calcula efetivo ativo de forma mais confiável via `GET /users/active`, com fallback para `last_ping`.

O backend ainda precisa:

- alinhar `stats.efetivo` à mesma regra usada em `users/active`
- documentar a janela operacional
- impedir divergência entre dashboard, relatórios e efetivo

### 2. Entregar uma API oficial de efetivo operacional

O módulo `Efetivo` deixou de ser placeholder, mas ainda deriva tudo de `users` + `users/active`.

Ainda falta:

- turno
- base
- função operacional
- escala
- lotação
- histórico de mudança de escala
- vínculo entre operador, posto, praia, cidade e unidade

Sugestão mínima:

- `GET /workforce`
- `GET /workforce/summary`
- `GET /workforce/shifts`

### 3. Evoluir `fleets` para telemetria real

O admin já lê frota, exporta CSV e interpreta `last_ping`, mas isso ainda não é rastreamento operacional completo.

Ainda falta:

- `last_ping` real e estável
- latitude/longitude da unidade
- `updated_at`
- status canônico de frota
- vínculo com posto/base/setor
- `assigned_post_id` ou equivalente
- `battery_level` quando aplicável

### 4. Consolidar o contrato canônico de alertas

O frontend já aceita aliases por compatibilidade, mas isso não deveria continuar indefinidamente.

Contrato esperado:

- status:
  - `REPORTED`
  - `ACCEPTED`
  - `IN_PROGRESS`
  - `RESOLVED`
  - `FALSE_ALARM`
- tipo:
  - `DROWNING`
  - `MEDICAL`
  - `LOST_CHILD`

Ainda falta:

- resposta canônica em toda a API
- documentação de depreciação dos aliases antigos

### 5. Fechar de vez o modelo de usuário operacional

O admin já usa ou reconhece:

- `city_id`
- `city_name`
- `last_ping`
- `is_active`
- `fcm_token`

Ainda falta:

- consistência desses campos em todas as rotas de usuário
- definição clara se `fcm_token` deve ou não ser exposto ao admin
- se o token for sensível, fornecer um derivado como `push_enabled`

### 6. Completar logs e auditoria

O módulo de logs já opera e exporta CSV, mas ainda depende de payloads muito abertos.

Ainda falta:

- padronizar `action`, `endpoint`, `user`, `user_id`, `status`, `created_at`
- incluir filtros de backend por período/usuário/recurso
- incluir contexto operacional para mudanças críticas

### 7. Reduzir a necessidade de composição no frontend

Hoje o admin monta algumas visões cruzando várias fontes.

Ainda falta:

- endpoints agregados para dashboard
- endpoints agregados para relatórios
- endpoints agregados para efetivo
- respostas estáveis para mapa e operação

## Lacunas secundárias

### 8. Melhorar documentação de `users/active`

Ainda precisa ficar explícito:

- regra de ativo
- janela temporal
- se a fonte oficial é `is_active`, `last_ping` ou ambos
- como tratar operador sem cidade

### 9. Documentar melhor `fleets`

Ainda precisa:

- payload de criação
- payload de listagem
- estados válidos
- campos obrigatórios e opcionais

### 10. Padronizar timestamps

Ainda precisa:

- formato temporal único
- timezone/documentação consistente
- evitar valores textuais livres como `Agora`

## Impacto real no admin hoje

Sem essas entregas, o admin continua funcionando, mas com limites importantes:

- o efetivo ainda é visão derivada, não fonte oficial
- relatórios e dashboard podem divergir se `dashboard/stats` não seguir `users/active`
- frota ainda não representa rastreamento operacional completo
- parte da resiliência depende de normalização local no frontend

## Ordem recomendada para o backend

1. Alinhar `dashboard/stats` com `users/active`.
2. Fechar contrato canônico de alertas e tipos.
3. Evoluir `fleets` para telemetria real.
4. Criar API dedicada de efetivo operacional.
5. Padronizar logs e auditoria com filtros.
6. Reduzir composições no frontend com endpoints agregados.
