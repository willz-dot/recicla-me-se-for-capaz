# Roteiro de demonstração — Recicla-me se for capaz

## Preparação

1. Na raiz do projeto, execute `py -m http.server 8000` (ou `python -m http.server 8000`).
2. Abra `http://127.0.0.1:8000/` no navegador. Use uma janela de navegador com zoom a 100% para a conferência inicial.
3. Para demonstrar responsividade, use o modo dispositivo e teste 320, 390, 768 e 1366 px. Registre qualquer barra de rolagem horizontal ou conteúdo cortado.

## Apresentação das páginas

1. **Início (`index.html`):** explique propósito, chamadas e foco comunitário em Canoinhas - SC.
2. **Como funciona:** mostre as três etapas, esclarecendo que o site orienta, mas não confirma coleta.
3. **Resíduos:** apresente as seis categorias, cuidados e separação de resíduos especiais.
4. **Acesso:** mostre campos e cidade predefinida; explique que não existem bairros confirmados no protótipo e que formulário não envia nem armazena dados.
5. **Painel:** mostre seu estado demonstrativo sem calendário ou dados pessoais reais.
6. Demonstre links do cabeçalho/rodapé e a página atual indicada na navegação.

## Teclado e formulário

1. Recarregue a página inicial e pressione `Tab`: o primeiro foco deve ser “Pular para o conteúdo principal”. Pressione `Enter`; foco/âncora deve ir para o conteúdo principal.
2. Navegue por `Tab` e `Shift+Tab`: verifique foco visível nos links e controles.
3. Em largura móvel, foque o disclosure de navegação; use `Enter` ou `Espaço` para abrir. Use `Escape` para fechar e confira que o foco retorna ao controle do menu. Ative um link e confirme o fechamento do menu.
4. Na página de acesso, envie o formulário vazio: erros devem aparecer associados aos respectivos campos, `aria-invalid` deve refletir o erro e o foco deve ir ao primeiro campo inválido.
5. Corrija um campo e confirme remoção do erro e atualização do resumo. Não use CPF, e-mail, telefone ou endereço real.
6. Em uma execução automatizada reproduzível, rode `node tests/components.test.cjs` e os dois comandos `node --check` documentados no README.

## Auditorias e resultado registrado

| Ferramenta/verificação | O que foi efetivamente testado | Situação / como concluir a demonstração |
|---|---|---|
| Nu HTML Checker (W3C) | As cinco páginas foram enviadas ao serviço oficial; as respostas retornaram zero erros e zero avisos. | **Testado e aprovado nessa execução.** Para repetir: acesse `https://validator.w3.org/nu/`, selecione “Validate by File Upload” e envie cada HTML, ou valide a URL pública após publicar. Guarde a saída de cada página. |
| WAVE | Nenhum relatório WAVE foi produzido. | **Pendente.** Abra a URL publicada em `https://wave.webaim.org/` (ou extensão WAVE), execute em cada página e registre erros/alertas e correções. `localhost` pode não ser acessível ao serviço remoto; use extensão ou publicação. |
| axe / axe DevTools | Não houve relatório axe verificável nesta sessão. | **Pendente.** Instale/abra axe DevTools no navegador, carregue cada página e execute a análise WCAG 2.1 AA. Corrija violações e repita; anexe/registre resultados e impactos. |
| Lighthouse | Lighthouse CLI 12.8.2 foi instalado temporariamente, mas falhou ao inicializar Chrome headless aguardando a porta de depuração. Nenhuma pontuação foi obtida. | **Pendente.** No Chrome, abra cada página (preferencialmente URL publicada), DevTools > Lighthouse, selecione Mobile e as categorias Performance e Accessibility, então gere o relatório. Comprove Accessibility ≥ 90 e Performance ≥ 80 em uma execução documentada; repita depois de correções. |
| Contraste de texto | Cálculo local de contraste sobre 217 nós de texto visíveis nas cinco páginas; nenhuma razão abaixo de 4,5:1 (texto comum) / 3:1 (texto grande) após os ajustes. | **Testado por cálculo automatizado local; não é auditoria WAVE.** Verifique manualmente também contraste não textual de bordas, indicadores de foco e estados. |
| Responsividade | Cinco páginas em viewports de 320, 390, 768 e 1366 px; sem overflow horizontal identificado. | **Testado.** Repita em navegador e confira visualmente conteúdo, navegação, formulários e foco em cada largura. |
| Teclado | Skip link, abertura/fechamento do menu com retorno de foco e submissão inválida do formulário foram verificados no navegador local. | **Testado parcialmente.** Completar tabulação por todos os controles e estados, abrir links, zoom e leitores de tela manualmente. |

## Encerramento

- Apresente `REQUISITOS.md` como fonte do status e não descreva auditorias pendentes como aprovação.
- Se publicar, anote URL, data, páginas testadas, relatórios e notas no checklist.
- Encerre o servidor local com `Ctrl+C`.
