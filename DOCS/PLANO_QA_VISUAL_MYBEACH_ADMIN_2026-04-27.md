# Plano de QA Visual e Manual - MyBeach Admin

Data: 2026-04-27

## Objetivo

Executar uma validacao manual de interface e comportamento sem depender de novas entregas de API.

## Escopo

Validar:

- layout;
- responsividade;
- textos;
- estados de carregamento;
- estados vazios;
- erros de backend;
- permissoes visiveis;
- exportacoes.

## Tamanhos de tela

Testar no minimo:

- desktop largo;
- notebook;
- tablet;
- celular.

## Criterios visuais

- [ ] Nenhum texto sobreposto.
- [ ] Nenhum botao com texto cortado.
- [ ] Tabelas/listas continuam navegaveis.
- [ ] Filtros cabem no container.
- [ ] Modais cabem na tela.
- [ ] Alertas e mensagens sao compreensiveis.
- [ ] Estados vazios nao parecem erro tecnico.
- [ ] Estados parciais indicam fonte indisponivel quando aplicavel.

## Roteiro manual

### Login

- [ ] Abrir `/login`.
- [ ] Validar video/imagem de fundo quando disponivel.
- [ ] Testar credencial invalida.
- [ ] Testar credencial valida.

### Dashboard

- [ ] Abrir `/admin`.
- [ ] Conferir cards e indicadores.
- [ ] Reduzir largura da janela e verificar responsividade.

### Catalogo operacional

- [ ] Abrir municipios.
- [ ] Abrir praias.
- [ ] Abrir postos.
- [ ] Abrir zonas.
- [ ] Testar filtros e exportacao.

### Operacao

- [ ] Abrir ocorrencias.
- [ ] Abrir mapa.
- [ ] Abrir frota.
- [ ] Abrir efetivo.
- [ ] Conferir se dados parciais ficam claros.

### Administracao

- [ ] Abrir usuarios.
- [ ] Abrir novo usuario.
- [ ] Abrir edicao de usuario.
- [ ] Abrir logs com perfil autorizado.
- [ ] Validar bloqueio com perfil sem permissao.

## Evidencias recomendadas

Para homologacao formal, salvar:

- data da validacao;
- ambiente usado;
- usuario/perfil testado;
- navegador;
- prints das telas principais;
- erros encontrados;
- decisao final: aprovado, aprovado com ressalvas ou reprovado.

## Itens fora de escopo agora

- Alterar contrato da API.
- Remover fallback do frontend.
- Implementar modulos novos.
- Criar regra operacional nao validada pelo backend.

