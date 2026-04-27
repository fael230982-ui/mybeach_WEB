# Changelog

Todas as alteracoes relevantes deste projeto devem ser registradas aqui.

## [Unreleased] - 2026-04-27

### Added

- Manual de operacao do painel administrativo.
- Checklist de homologacao por tela, perfil e fluxo operacional.
- Pendencias de backend priorizadas para evitar retrabalho antes de nova API.
- Guia de deploy com variaveis, validacao e verificacoes pos-deploy.
- Plano de QA visual e manual sem dependencia de contrato novo.
- API 1.2 versionada em `DOCS/` e cliente OpenAPI auxiliar regenerado.
- Documento de analise do aproveitamento da API 1.2 pelo admin.
- Documento de pendencias restantes do backend apos revisao da API 1.2.
- Documento de status tecnico do painel.
- API 1.3 versionada em `DOCS/` e cliente OpenAPI auxiliar atualizado.
- Documento de analise do aproveitamento da API 1.3 pelo admin.
- Documento de pendencias restantes do backend apos revisao da API 1.3.

### Changed

- Leitura de `users/active` passa a aceitar tanto o array legado quanto o payload 1.2 com `items`.
- Frota passa a reconhecer campos 1.2 como `current_crew`, `base_sector`, coordenadas, posto vinculado e `is_operational`.
- Mensagens operacionais de erro passam a tratar status comuns de API de forma mais clara.
- Relatorios passam a aceitar `dashboard/stats` no formato 1.3.
- Efetivo passa a usar `workforce` 1.3 como fonte preferencial de ativos quando disponivel, mantendo fallback para `users/active`.
- Logs passam a reconhecer e exportar campos de auditoria 1.3.

## [1.0.0] - 2026-04-27

### Added

- Publicacao inicial da base do MyBeach Admin.
- Painel administrativo em Next.js para gestao operacional do ecossistema MyBeach.
- Rotas administrativas para dashboard, usuarios, logs, mapa, municipios, praias, postos, zonas, frota, efetivo, relatorios e ocorrencias.
- Proxy interno para chamadas autenticadas ao backend.
- Sessao administrativa com cookie `HttpOnly`.
- Suite de testes de helpers, contratos locais, filtros, permissoes, exportacoes e normalizacoes.
- Documentos de autoria, governanca e checklist de publicacao.

### Validated

- `npm run test` executado em 2026-04-27: 52 testes aprovados.
- `npm run lint` executado em 2026-04-27: aprovado.
- `npm run build` executado em 2026-04-27: aprovado.
