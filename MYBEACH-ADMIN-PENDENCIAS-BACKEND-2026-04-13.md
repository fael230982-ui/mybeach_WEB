# MYBEACH ADMIN - PENDÊNCIAS DE BACKEND

Data: 2026-04-13
Origem: revisão do `mybeach-admin` após entrada da nova API na pasta compartilhada

## Objetivo

Registrar o que ainda falta no backend para o `mybeach-admin` deixar de operar com fallback, placeholder ou leitura parcial em algumas áreas.

## Itens já absorvidos pelo admin

- Ajustado consumo de atualização de status de alerta para `PATCH /alerts/{alert_id}/status`.
- Admin preparado para `users/active`, `last_ping`, `battery_level`, `fcm_token` e `is_active`.
- Dashboard e efetivo já conseguem usar `users/active` com fallback local por `last_ping`.

## Pendências prioritárias de backend

### 1. Padronizar `dashboard/stats` com a nova semântica de efetivo ativo

Hoje o admin já consegue calcular `Efetivo ativo` via `GET /users/active`, mas o endpoint `GET /dashboard/stats` ainda parece expor KPIs próprios e potencialmente divergentes.

Necessário:

- garantir que `stats.efetivo` siga a mesma regra de `users/active`
- documentar explicitamente a janela operacional usada para o cálculo
- evitar divergência entre dashboard executivo e módulos operacionais

### 2. Expor API própria de efetivo operacional

O módulo `Efetivo` do admin já deixou de ser placeholder puro, mas ainda depende de composições em cima de `users` e `users/active`.

Necessário:

- endpoint de efetivo com turno, base, função operacional e status
- vínculo entre operador, posto, praia, cidade e unidade
- histórico/auditoria de mudança de escala
- eventual distinção entre cadastrado, escalado, disponível e ativo em campo

Sugestão mínima:

- `GET /workforce`
- `GET /workforce/summary`
- `GET /workforce/shifts`

### 3. Entregar `fleets` com telemetria real

O admin já lê `last_ping`, mas o módulo de frota ainda depende de dados muito simples.

Necessário:

- garantir `last_ping` real por unidade
- expor localização atual da unidade quando existir
- padronizar `status` de frota
- informar disponibilidade operacional de forma canônica

Seria útil incluir:

- `latitude`
- `longitude`
- `battery_level` quando aplicável
- `updated_at`
- `assigned_post_id` ou equivalente

### 4. Consolidar contrato canônico de status em toda a API

O admin já foi ajustado para aceitar aliases, mas o ideal é o backend reduzir a necessidade de normalização defensiva.

Contrato esperado para alertas:

- `REPORTED`
- `ACCEPTED`
- `IN_PROGRESS`
- `RESOLVED`
- `FALSE_ALARM`

Contrato esperado para tipos:

- `DROWNING`
- `MEDICAL`
- `LOST_CHILD`

Necessário:

- responder canonicamente nesses campos
- manter aliases antigos apenas como compatibilidade temporária, se preciso
- documentar deprecação de aliases

### 5. Completar o retorno dos usuários operacionais

O admin agora aproveita `fcm_token`, `last_ping` e `is_active`, mas esses campos precisam vir de forma consistente.

Necessário:

- uniformizar presença de `city_id` e `city_name`
- garantir `last_ping` em formato de data consistente
- garantir `is_active` coerente com `users/active`
- decidir se `fcm_token` deve ou não ser retornado ao admin

Observação:

- se `fcm_token` for sensível, o ideal é não expor o token bruto e sim um campo derivado de diagnóstico, por exemplo `push_enabled`

### 6. Fechar lacunas do módulo de logs e auditoria

O admin já lê logs, mas ainda falta previsibilidade no modelo para auditoria operacional.

Necessário:

- padronizar `action`, `user`, `user_id`, `endpoint`, `status`, `created_at`
- incluir contexto operacional quando houver alteração crítica
- permitir filtro por período, usuário e recurso alterado

### 7. Reduzir dependência de composições no cliente

Hoje algumas telas ainda montam visão operacional cruzando múltiplas fontes.

Necessário:

- endpoints de resumo já agregados para dashboard, relatórios e efetivo
- respostas estáveis para telas de mapa e operação
- menos necessidade de fallback por ausência parcial de fonte

## Pendências secundárias

### 8. Melhorar documentação do contrato de `users/active`

Necessário deixar explícito:

- regra de ativo
- janela temporal
- se usa `last_ping`, `is_active` ou ambos
- se operador sem cidade pode aparecer

### 9. Documentar claramente o contrato de `fleets`

Necessário:

- payload de criação
- payload de listagem
- estados válidos
- campos obrigatórios e opcionais

### 10. Reforçar consistência temporal

Necessário:

- todos os timestamps em formato padronizado
- timezone/documentação consistente
- evitar respostas híbridas com texto livre tipo `Agora`

## Impacto prático no admin hoje

Sem essas entregas, o admin continua funcional, mas com alguns limites:

- módulo de efetivo ainda é uma leitura derivada, não uma fonte oficial
- KPIs executivos podem divergir do operacional se `dashboard/stats` não seguir `users/active`
- frota ainda não consegue operar como rastreamento real
- parte da robustez atual depende de normalização defensiva no frontend

## Ordem recomendada para o backend

1. Alinhar `dashboard/stats` com `users/active`.
2. Fechar contrato canônico de alertas e tipos.
3. Entregar telemetria real de `fleets`.
4. Criar API dedicada de efetivo operacional.
5. Evoluir logs/auditoria com filtros e contexto operacional.
