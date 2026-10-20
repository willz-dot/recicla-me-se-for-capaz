# Recicla-me se for capaz — requisitos e estado

Estados: **pendente** (ainda não implementado ou verificado), **implementado** (presente no código), **testado** (verificação executada) e **aprovado** (critério comprovado). Criar um arquivo não significa que ele foi aprovado.

## Estrutura e conteúdo

- [x] **Implementado** — `index.html`, início com propósito, benefícios, chamadas e links úteis.
- [x] **Implementado** — `como-funciona.html`, três etapas do serviço.
- [x] **Implementado** — `residuos.html`, seis categorias, cuidados e distinção para resíduos especiais.
- [x] **Implementado** — `acesso.html`, campos previstos para dados pessoais e endereço; Canoinhas - SC predefinida; bairro sem opções oficiais inventadas.
- [x] **Implementado** — `painel.html`, estado demonstrativo sem dados de usuário ou calendário não confirmado.
- [x] **Implementado** — navegação compartilhada, links internos e rodapé consistente.
- [x] **Implementado** — identidade visual baseada em `#174D38`, `#55B86A`, `#F7F5ED`, `#252B27` e `#F2A65A`.
- [x] **Implementado** — formulário demonstrativo valida no navegador; não envia nem armazena dados. O botão fica desabilitado se o script de validação não carregar.
- [ ] **Pendente** — conteúdo institucional definitivo e fontes municipais oficiais para bairros, dias, categorias e horários.

## HTML semântico e acessibilidade

- [x] **Implementado** — doctype, `lang="pt-BR"`, UTF-8, viewport, header, nav, main e footer nas cinco páginas.
- [x] **Implementado** — um H1 visível em cada página, títulos hierárquicos e IDs de conteúdo únicos.
- [x] **Implementado** — links com `<a>`, campos com `<label>` associado, agrupamentos com `<fieldset>`/`<legend>`.
- [x] **Implementado** — skip link para o conteúdo principal em cada página.
- [x] **Implementado** — estado atual de navegação por `aria-current`; `details`/`summary` nativo para menu compacto.
- [x] **Implementado** — estados de foco visíveis e preferência por movimento reduzido.
- [x] **Testado** — Nu HTML Checker oficial: cinco páginas retornaram zero erros e zero avisos após correções.
- [x] **Testado** — contraste de texto calculado sobre 217 nós de texto visíveis nas cinco páginas; nenhuma relação abaixo dos limites AA de 4,5:1/3:1 após correções.
- [ ] **Pendente** — testar manualmente zoom, todos os estados de foco e leitores de tela no navegador.
- [ ] **Pendente** — repetir WAVE após correção de contraste da ilustração inicial; aguardar resultado sem erros/contrast errors.
- [ ] **Pendente** — axe sem problemas críticos/graves e correção dos demais; nenhum relatório axe verificável foi produzido nesta sessão.
- [ ] **Pendente** — Lighthouse Accessibility >= 90; tentativa com Lighthouse CLI 12.8.2 falhou ao iniciar Chrome headless (não foi obtida porta de depuração), portanto não há nota válida.
- [ ] **Pendente** — conferência manual do contraste não textual dos indicadores de foco e componentes (além da medição dos textos acima).

## Responsividade e desempenho

- [x] **Implementado** — CSS mobile-first com Grid, Flexbox e media queries; layouts para celular, tablet e desktop.
- [x] **Implementado** — largura mínima de layout de 320 px, formulários em coluna em telas estreitas e navegação móvel nativa por `details`.
- [x] **Testado** — cinco páginas em 320, 390, 768 e 1366 px; sem overflow horizontal ou elementos transbordando, menu adequado ao breakpoint.
- [ ] **Pendente** — adicionar imagens finais somente quando houver ativos; otimizar formato e dimensões e aplicar lazy loading às imagens fora da primeira tela.
- [ ] **Pendente** — Lighthouse Performance >= 80; tentativa com Lighthouse CLI 12.8.2 falhou ao iniciar Chrome headless (não foi obtida porta de depuração), portanto não há nota válida.

## JavaScript e serviços

- [x] **Testado** — menu móvel nativo `<details>/<summary>`; o navegador expõe o estado aberto/fechado, o nome acessível acompanha a ação, Escape fecha e devolve foco; ativar link fecha o menu. Enter/Espaço usam o comportamento nativo.
- [x] **Testado** — validação de campos obrigatórios e formatos de CPF, telefone, CEP e e-mail; erros têm mensagem associada, `aria-invalid`, foco no primeiro erro e bloqueio de envio. CPF não é tratado como confirmação de identidade.
- [x] **Testado** — feedback acessível de erro e validação, sem alegar que dados foram enviados ou salvos; envio padrão fica prevenido.
- [x] **Testado** — navegador local com teclado: Enter abre menu, Escape fecha e devolve foco; submit vazio marca/foca erros e correção de campo atualiza o feedback.
- [ ] **Pendente** — testar com leitor de tela e completar a verificação manual de foco em todos os controles.
- [ ] **Pendente** — FAQ/filtro de resíduos opcional.
- [ ] **Pendente** — decidir e implementar backend, autenticação segura, armazenamento mínimo necessário e integração de calendário, caso entrem no escopo.
- [x] **Implementado** — não são inventados bairros, calendário, horários ou confirmação de cadastro; nenhuma senha ou dado pessoal está embutido.

## Entrega e apresentação

- [x] **Implementado** — README com tecnologias, funcionalidades, estrutura, execução, limitações e passos de publicação.
- [x] **Testado** — repositório Git local com branch `main`, `.gitignore` e histórico integrado ao remoto `https://github.com/willz-dot/recicla-me-se-for-capaz.git`; push da branch `main` concluído.
- [ ] **Pendente** — repetir WAVE após correção e executar/registrar axe DevTools e Lighthouse. Nu HTML Checker foi executado e passou.
- [x] **Testado** — GitHub Pages configurado para branch `main`, raiz `/(root)`; API reportou `built`. A URL pública `https://willz-dot.github.io/recicla-me-se-for-capaz/` e as cinco páginas, CSS e scripts responderam HTTP 200.
- [x] **Implementado** — `ROTEIRO-DEMONSTRACAO.md` documenta páginas, responsividade, teclado, skip link, foco, formulário, auditorias e estado medido/pendente.
- [ ] **Pendente** — confirmar no Teams o ano e o prazo exato informado como 21/10 às 22h.

## Evidência desta etapa

- [x] **Testado** — todos os destinos locais de links `href` e referências locais de folhas de estilo verificados por script; resultado: sem destinos internos ausentes.
- [x] **Testado** — cinco documentos HTML verificados por script para doctype, idioma, metadados, landmarks semânticos, um H1, IDs únicos, labels e destinos locais de links/scripts; sem problemas estruturais nessas verificações.
- [x] **Testado** — execução final `node tests/components.test.cjs`: 7 testes automatizados passaram para menu, Escape, fechamento por link, formatos, erros acessíveis, bairro sem configuração, feedback de validação e atualização após corrigir campo.
- [x] **Testado** — testes de formulário usam DOM simulado; CPF/telefone/CEP/e-mail têm casos aceitos e rejeitados; nenhum dado real é usado ou persistido.
- [x] **Testado** — navegador local: Enter abre o menu, Escape fecha e devolve o foco; envio vazio foca o primeiro campo e anuncia erros; corrigir o nome remove seu erro e atualiza a contagem; console sem erros.
- [x] **Testado** — Nu HTML Checker oficial: todas as cinco páginas sem erros ou avisos.
- [x] **Testado** — publicação estática: home, cinco páginas HTML, folha CSS e dois scripts retornaram HTTP 200 na URL do GitHub Pages publicada.
- [x] **Testado** — capturas WAVE fornecidas para as cinco páginas: zero erros gerais em todas; Início mostrou 3 Contrast Errors, as outras quatro 0; alertas de “Redundant link” foram de 1 a 3 por página e precisam de revisão manual. As capturas não mostram os elementos individuais.
- [x] **Corrigido** — escurecidos três glifos decorativos de baixo contraste na ilustração do Início; razões calculadas com o fundo da arte `#e7efe2`: 4,76:1, 4,96:1 e 5,09:1. **Pendente** repetir WAVE na URL publicada para confirmar.
- [ ] **Pendente** — axe DevTools sem relatório verificável; Lighthouse CLI 12.8.2 falhou ao aguardar a porta de depuração do Chrome headless. Nenhuma aprovação dessas ferramentas é declarada.
- [x] **Testado** — `node --test tests/components.test.cjs` tentou iniciar subprocesso e foi bloqueado (`spawn EPERM`); execução direta `node tests/components.test.cjs` passou os 7 testes.

