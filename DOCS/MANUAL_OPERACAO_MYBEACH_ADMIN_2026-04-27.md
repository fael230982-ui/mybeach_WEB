# Manual de Operacao - MyBeach Admin

Data: 2026-04-27

## Objetivo

Orientar o uso operacional do painel web administrativo do MyBeach sem depender de novas entregas de API.

## Acesso

Rota principal:

```text
/login
```

Depois do login, o painel redireciona para:

```text
/admin
```

A sessao administrativa usa cookie `HttpOnly`. As chamadas autenticadas passam pelo proxy interno do painel.

## Variaveis de ambiente

Criar `.env.local` no ambiente de execucao:

```bash
NEXT_PUBLIC_API_URL=https://api.mybeach.com.br
NEXT_PUBLIC_ENABLE_MOBILE_DEMO=false
```

`NEXT_PUBLIC_ENABLE_MOBILE_DEMO=true` libera a rota `/mobile` apenas para demonstracoes internas.

## Dashboard

Rota:

```text
/admin
```

Uso esperado:

- acompanhar resumo operacional;
- observar indicadores de alertas, efetivo e atividade;
- identificar carregamento parcial quando alguma fonte do backend estiver indisponivel.

Observacao:

O dashboard pode exibir dados parciais quando uma fonte falha. Esse comportamento e intencional para evitar tela zerada enganosa.

## Usuarios

Rotas:

```text
/admin/usuarios
/admin/usuarios/novo-usuario
/admin/editar-usuario/[id]
```

Uso esperado:

- listar usuarios;
- filtrar e consultar cadastros;
- criar usuarios administrativos ou operacionais;
- editar dados quando permitido pelo perfil.

Cuidados:

- permissao final continua dependendo do backend;
- senhas devem ser tratadas como dado sensivel;
- perfis administrativos devem ser concedidos apenas quando houver autorizacao operacional.

## Logs

Rota:

```text
/admin/logs
```

Uso esperado:

- consultar auditoria operacional;
- exportar registros quando necessario;
- apoiar investigacao de acoes administrativas.

Restricao:

Area restrita a perfis `MASTER` e `ADMIN`.

## Mapa

Rota:

```text
/admin/mapa
```

Uso esperado:

- consultar distribuicao operacional;
- filtrar por cidade, praia, posto, zona ou status;
- apoiar decisao tatico-operacional.

Observacao:

Coordenadas seguem a ordem esperada pelo Leaflet. O painel possui testes cobrindo essa regra.

## Municipios

Rotas:

```text
/admin/municipios
/admin/municipios/nova
```

Uso esperado:

- listar municipios;
- cadastrar nova cidade operacional;
- exportar dados quando necessario.

## Praias

Rotas:

```text
/admin/praias
/admin/praias/nova
```

Uso esperado:

- listar praias;
- filtrar por cidade, status e texto;
- cadastrar nova praia;
- exportar catalogo.

## Postos

Rota:

```text
/admin/postos
```

Uso esperado:

- listar postos operacionais;
- consultar vinculo com praia/cidade;
- verificar coordenadas;
- apoiar distribuicao operacional.

## Zonas

Rotas:

```text
/admin/zonas
/admin/zonas/nova
```

Uso esperado:

- listar zonas;
- cadastrar zona operacional;
- desenhar ou revisar poligonos;
- exportar zonas.

## Frota

Rota:

```text
/admin/frota
```

Uso esperado:

- consultar unidades de frota;
- verificar status normalizado;
- observar `last_ping` quando disponivel;
- exportar dados.

Limite atual:

Telemetria real ainda depende de contrato mais completo do backend.

## Efetivo

Rota:

```text
/admin/efetivo
```

Uso esperado:

- consultar leitura operacional derivada de usuarios;
- acompanhar ativos por `users/active`;
- usar fallback por `last_ping` quando necessario;
- exportar resumo.

Limite atual:

Ainda nao existe API dedicada de efetivo operacional com turno, base, escala e lotacao.

## Relatorios

Rota:

```text
/admin/relatorios
```

Uso esperado:

- consolidar visoes operacionais;
- aplicar filtros persistidos na URL;
- exportar CSV.

## Ocorrencias

Rota:

```text
/admin/ocorrencias
```

Uso esperado:

- acompanhar alertas/ocorrencias;
- interpretar status normalizados;
- apoiar resposta operacional.

## Exportacoes CSV

O painel possui exportacoes locais para areas como:

- dashboard;
- relatorios;
- efetivo;
- frota;
- logs;
- municipios;
- praias;
- postos;
- zonas.

Antes de usar relatorio exportado como documento oficial, validar se o backend retornou todas as fontes esperadas.

## Comportamento degradado

Quando uma fonte do backend falha, o painel tenta:

- preservar dados validos quando possivel;
- sinalizar carregamento parcial;
- evitar retry em erros de cliente como `401`, `403` e `404`;
- reservar retry para falhas transientes.

## Procedimento recomendado de uso diario

1. Entrar em `/login`.
2. Conferir dashboard em `/admin`.
3. Validar ocorrencias e mapa.
4. Conferir efetivo e frota.
5. Exportar relatorios apenas apos confirmar que nao ha aviso de dados parciais.
6. Consultar logs em caso de alteracao critica.

