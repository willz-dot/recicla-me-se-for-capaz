# Recicla-me se for capaz

Site educativo de sustentabilidade e preparação para coleta seletiva em Canoinhas - SC. O projeto é estático, responsivo e sem dependências de execução no navegador. As informações locais sobre bairros, calendário e horários não são inventadas: dependem de confirmação por fontes oficiais.

## Páginas

- `index.html` — apresentação e chamadas para ação.
- `como-funciona.html` — etapas demonstrativas do serviço.
- `residuos.html` — orientação sobre seis categorias de resíduos e cuidados.
- `acesso.html` — formulário demonstrativo com validação no cliente.
- `painel.html` — painel demonstrativo, sem dados ou calendário de usuário.

Todas as páginas compartilham navegação, identidade visual, skip link e rodapé. O formulário não envia nem persiste dados; o painel não representa uma conta real.

## Tecnologias

- HTML5 semântico e CSS3 (Grid, Flexbox, media queries e preferência por movimento reduzido).
- JavaScript sem framework: menu móvel nativo `<details>/<summary>` e validação acessível.
- Node.js, opcional, para executar os testes automatizados. Não há etapa de build nem dependências npm no site.

## Estrutura

```text
.
├── index.html
├── como-funciona.html
├── residuos.html
├── acesso.html
├── painel.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── form-validation.js
├── tests/
│   └── components.test.cjs
├── README.md
├── ROTEIRO-DEMONSTRACAO.md
└── REQUISITOS.md
```

## Executar localmente

Abra PowerShell/Terminal na pasta raiz do projeto e inicie um servidor HTTP simples com Python:

```powershell
py -m http.server 8000
```

Se `py` não existir, use `python -m http.server 8000`. Acesse `http://127.0.0.1:8000/` e navegue pelas páginas. Para encerrar, pressione `Ctrl+C` no terminal. Não abra por `file://`: um servidor local aproxima a navegação da publicação estática.

## Testes automatizados

Requer Node.js instalado (sem pacote externo):

```powershell
node tests/components.test.cjs
node --check js/main.js
node --check js/form-validation.js
```

Os testes unitários simulam o DOM para menu e validação. Eles não substituem testes completos no navegador, leitor de tela nem auditorias externas. Execute os comandos na raiz do projeto.

## Acessibilidade e auditorias

O projeto inclui idioma `pt-BR`, landmarks semânticos, hierarquia de títulos, labels, estados ARIA de formulário, mensagens de erro associadas, skip link, foco visível, menu nativo operável por teclado e layouts para viewport a partir de 320 px.

Estado medido nesta entrega, detalhado em `REQUISITOS.md`:

- Nu HTML Checker oficial: cinco páginas sem erros ou avisos.
- Testes automatizados JavaScript: 7 passaram.
- Verificação em navegador: cinco páginas em 320, 390, 768 e 1366 px, sem overflow horizontal; teste de teclado do skip link, menu e formulário.
- Contraste de texto calculado localmente: 217 nós visíveis, sem relações abaixo de 4,5:1/3:1 após ajustes. Contraste não textual ainda requer avaliação manual.
- WAVE e axe DevTools: sem relatório verificável disponível nesta sessão.
- Lighthouse CLI 12.8.2: a execução falhou ao iniciar Chrome headless/porta de depuração; notas de Accessibility e Performance não foram obtidas. Portanto as metas de 90 e 80 não estão comprovadas.
- Leitor de tela, zoom e verificação manual de todos os focos ainda precisam de execução.

Para repetir as auditorias externas, consulte `ROTEIRO-DEMONSTRACAO.md`. Não marque uma meta como aprovada até guardar o relatório/URL com a página e a data testadas.

## Limitações e conteúdo dependente de confirmação

- Não há backend, autenticação, envio, armazenamento de dados ou serviço de calendário.
- Não inserir dados reais no formulário demonstrativo.
- Bairros, dias, horários, categorias da coleta local e conteúdo institucional definitivo dependem de confirmação municipal; a lista de bairros permanece sem opções inventadas.
- Não há imagens externas ou bibliotecas/fontes de terceiros necessárias para executar o projeto.

## Publicação estática pelo GitHub Pages

O diretório entregue não tinha remoto GitHub configurado. A publicação não foi realizada e não foi usado um repositório de outro projeto. Com um repositório próprio criado e acesso autorizado:

1. Crie no GitHub um repositório vazio para o projeto (por exemplo `recicla-me-se-for-capaz`); não selecione README, licença nem `.gitignore` se for enviar o histórico local já preparado.
2. Na raiz local, associe o endereço do repositório e envie a branch `main`:

   ```powershell
   git remote add origin https://github.com/SEU-USUARIO/recicla-me-se-for-capaz.git
   git push -u origin main
   ```

3. No repositório GitHub, abra **Settings > Pages**. Em **Build and deployment**, selecione **Deploy from a branch**, escolha `main` e a pasta `/(root)`, então salve.
4. Aguarde o workflow do Pages terminar e abra a URL exibida em **Settings > Pages**. Confirme a página inicial e cada link de navegação. Em um projeto de site de usuário/organização a URL costuma usar o domínio raiz; em um projeto comum, o caminho inclui o nome do repositório — use sempre o endereço efetivamente fornecido pelo GitHub.
5. Execute novamente WAVE, axe e Lighthouse na URL publicada e registre os resultados em `REQUISITOS.md`.

O projeto usa links relativos entre páginas e para `css/` e `js/`, adequados a publicação no diretório raiz ou em subdiretório de projeto. Não há fluxo de CI/build configurado; GitHub Pages publica os arquivos estáticos diretamente.

## Documentação de entrega

- `REQUISITOS.md` — checklist rastreável e evidências atuais, distinguindo itens implementados, testados e pendentes.
- `ROTEIRO-DEMONSTRACAO.md` — sequência de demonstração e passos para repetir as auditorias.
