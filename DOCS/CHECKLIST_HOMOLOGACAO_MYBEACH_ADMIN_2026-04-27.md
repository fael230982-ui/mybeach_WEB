# Checklist de Homologacao - MyBeach Admin

Data: 2026-04-27

## Objetivo

Validar o painel administrativo sem depender de novas entregas de API.

## Ambiente

- [ ] `.env.local` configurado com `NEXT_PUBLIC_API_URL`.
- [ ] `NEXT_PUBLIC_ENABLE_MOBILE_DEMO=false` para ambiente operacional.
- [ ] `npm install` executado.
- [ ] `npm run test` aprovado.
- [ ] `npm run lint` aprovado.
- [ ] `npm run build` aprovado.

## Acesso e sessao

- [ ] `/login` abre corretamente.
- [ ] Login valido cria sessao.
- [ ] Login invalido exibe erro compreensivel.
- [ ] Logout encerra sessao.
- [ ] Acesso direto a `/admin` sem sessao redireciona para login.
- [ ] Parametro `next` aceita apenas caminho relativo de `/admin`.

## Permissoes

- [ ] Perfil `MASTER` acessa areas administrativas sensiveis.
- [ ] Perfil `ADMIN` acessa areas administrativas sensiveis permitidas.
- [ ] Perfil operacional sem permissao nao acessa logs ou areas restritas.
- [ ] Backend continua negando operacoes sem permissao quando aplicavel.

## Dashboard

- [ ] `/admin` carrega sem erro visual.
- [ ] Indicadores aparecem com dados validos.
- [ ] Aviso de dados parciais aparece quando alguma fonte falha.
- [ ] Filtros persistem na URL quando aplicavel.

## Usuarios

- [ ] `/admin/usuarios` lista usuarios.
- [ ] Busca e filtros funcionam.
- [ ] Cadastro de usuario valida campos obrigatorios.
- [ ] Edicao de usuario carrega dados existentes.
- [ ] Erros do backend aparecem de forma compreensivel.

## Logs

- [ ] `/admin/logs` carrega para perfil autorizado.
- [ ] Perfil sem permissao nao acessa a rota.
- [ ] Exportacao CSV gera arquivo com colunas esperadas.
- [ ] Registros incompletos exibem fallback claro.

## Mapa

- [ ] `/admin/mapa` carrega sem erro.
- [ ] Marcadores, praias, postos ou zonas aparecem quando existem dados.
- [ ] Filtros alteram a visualizacao.
- [ ] Mapa continua usavel em tela desktop.
- [ ] Mapa continua usavel em tela mobile/tablet.

## Municipios

- [ ] Lista de municipios carrega.
- [ ] Cadastro de municipio valida campos.
- [ ] Exportacao CSV funciona.

## Praias

- [ ] Lista de praias carrega.
- [ ] Filtros por cidade/status/texto funcionam.
- [ ] Cadastro de praia valida dados obrigatorios.
- [ ] Exportacao CSV funciona.

## Postos

- [ ] Lista de postos carrega.
- [ ] Filtros por cidade/praia/texto funcionam.
- [ ] Coordenadas sao exibidas ou tratadas como ausentes.
- [ ] Exportacao CSV funciona.

## Zonas

- [ ] Lista de zonas carrega.
- [ ] Cadastro de zona abre corretamente.
- [ ] Desenho ou revisao de poligono funciona.
- [ ] Exportacao CSV funciona.

## Frota

- [ ] Lista de frota carrega.
- [ ] Status aparece normalizado.
- [ ] `last_ping` aparece quando retornado pelo backend.
- [ ] Exportacao CSV funciona.

## Efetivo

- [ ] Tela de efetivo carrega.
- [ ] Dados ativos usam `users/active` quando disponivel.
- [ ] Fallback por `last_ping` funciona quando necessario.
- [ ] Exportacao CSV funciona.

## Relatorios

- [ ] Tela de relatorios carrega.
- [ ] Filtros persistem na URL.
- [ ] Exportacao CSV funciona.
- [ ] Dados parciais ficam sinalizados quando alguma fonte falha.

## Ocorrencias

- [ ] Lista de ocorrencias/alertas carrega.
- [ ] Status de alerta aparece normalizado.
- [ ] Filtros funcionam.
- [ ] Transicao de status respeita retorno do backend.

## Responsividade

- [ ] Layout desktop sem sobreposicao.
- [ ] Layout tablet sem sobreposicao.
- [ ] Layout mobile sem texto cortado em botoes ou filtros.
- [ ] Tabelas/listas continuam navegaveis.
- [ ] Modais e formularios cabem na tela.

## Aceite minimo

- [ ] Nenhum erro bloqueante em console durante fluxos principais.
- [ ] Nenhum aviso de segredo ou credencial versionada.
- [ ] Build de producao aprovado.
- [ ] Permissoes sensiveis validadas.
- [ ] Pendencias externas registradas para backend.

