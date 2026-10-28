const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const project = path.resolve(__dirname, "..");
const readScript = (file) => fs.readFileSync(path.join(project, "js", file), "utf8");

function runInContext(source, document) {
  const storedValues = new Map();
  const context = {
    document,
    globalThis: null,
    console,
    window: { localStorage: { getItem: (key) => storedValues.get(key) ?? null, setItem: (key, value) => storedValues.set(key, value) } },
  };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  return { ...context, storedValues };
}

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatch(type, event = {}) {
    for (const callback of this.listeners.get(type) || []) callback(event);
  }
}

test("menu mobile acompanha o estado nativo, fecha com Escape e devolve foco", () => {
  const trigger = { attrs: {}, focusCalls: 0, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focusCalls += 1; } };
  const panel = new FakeEventTarget();
  const menu = new FakeEventTarget();
  let open = false;
  Object.defineProperty(menu, "open", { get: () => open, set(value) { if (open === value) return; open = value; this.dispatch("toggle"); } });
  menu.querySelector = (selector) => selector === "summary" ? trigger : panel;
  const document = { querySelectorAll: (selector) => selector === ".mobile-nav" ? [menu] : [], documentElement: { setAttribute() {}, getAttribute: () => "light" } };

  runInContext(readScript("main.js"), document);
  assert.equal(trigger.attrs["aria-label"], "Abrir navegação principal");
  menu.open = true;
  assert.equal(menu.open, true);
  assert.equal(trigger.attrs["aria-label"], "Fechar navegação principal");

  let prevented = false;
  menu.dispatch("keydown", { key: "Escape", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(menu.open, false);
  assert.equal(trigger.attrs["aria-label"], "Abrir navegação principal");
  assert.equal(trigger.focusCalls, 1);
});

test("menu mobile fecha quando um link é ativado", () => {
  const trigger = { setAttribute() {}, focus() {} };
  const anchor = {};
  const panel = new FakeEventTarget();
  const menu = new FakeEventTarget();
  menu.open = true;
  menu.querySelector = (selector) => selector === "summary" ? trigger : panel;
  panel.dispatch("click", { target: { closest: (selector) => selector === "a" ? anchor : null } });
  const document = { querySelectorAll: (selector) => selector === ".mobile-nav" ? [menu] : [], documentElement: { setAttribute() {}, getAttribute: () => "light" } };

  runInContext(readScript("main.js"), document);
  // Dispatch after the listener is installed.
  panel.dispatch("click", { target: { closest: (selector) => selector === "a" ? anchor : null } });
  assert.equal(menu.open, false);
});

test("alternância de tema escuro e claro atualiza o botão e persiste entre páginas", () => {
  const attrs = {};
  const root = {
    theme: "light",
    setAttribute(name, value) { attrs[name] = value; if (name === "data-theme") this.theme = value; },
    getAttribute(name) { return name === "data-theme" ? this.theme : attrs[name] ?? null; },
  };
  const button = new FakeEventTarget();
  button.attrs = {};
  button.setAttribute = (name, value) => { button.attrs[name] = value; };
  const document = {
    documentElement: root,
    querySelectorAll: (selector) => selector === "[data-theme-toggle]" ? [button] : [],
  };
  const { storedValues } = runInContext(readScript("main.js"), document);

  assert.equal(button.textContent, "Modo escuro");
  button.dispatch("click");
  assert.equal(root.theme, "dark");
  assert.equal(button.textContent, "Modo claro");
  assert.equal(button.attrs["aria-pressed"], "true");
  assert.equal(storedValues.get("recicla-me-theme"), "dark");

  button.dispatch("click");
  assert.equal(root.theme, "light");
  assert.equal(button.textContent, "Modo escuro");
  assert.equal(button.attrs["aria-pressed"], "false");
  assert.equal(storedValues.get("recicla-me-theme"), "light");
});

test("as cinco páginas oferecem o controle de tema e carregam o script compartilhado", () => {
  for (const page of ["index.html", "como-funciona.html", "residuos.html", "acesso.html", "painel.html"]) {
    const html = fs.readFileSync(path.join(project, page), "utf8");
    assert.match(html, /data-theme-toggle/, `${page} deve oferecer o botão de tema`);
    assert.match(html, /js\/main\.js/, `${page} deve carregar o controle de tema`);
  }
});

test("a página inicial exibe os três vídeos na ordem enviada antes da chamada final", () => {
  const html = fs.readFileSync(path.join(project, "index.html"), "utf8");
  const section = html.match(/<section class="[^"]*examples-section[^"]*"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "seção de exemplos deve existir");
  const sources = [...section.matchAll(/<source src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sources, [
    "videos/Reciclagem_Garrafa.mp4",
    "videos/Reciclagem_Vidro.mp4",
    "videos/Rejeitos_Fralda.mp4",
  ]);
  assert.equal((section.match(/<video\b/g) || []).length, 3);
  assert.equal((section.match(/\bcontrols\b/g) || []).length, 3);
  assert.ok(html.indexOf(section) < html.indexOf('<section class="cta-section container">'), "os vídeos devem vir antes da seção final");
  const css = fs.readFileSync(path.join(project, "css", "style.css"), "utf8");
  assert.match(css, /\.example-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.example-video\s*\{[^}]*width:\s*min\(100%,\s*250px\)/, "vídeo vertical deve ter largura limitada para caber nos três cards");
});

class FakeElement extends FakeEventTarget {
  constructor({ id = "", value = "", required = false, type = "text", options = [] } = {}) {
    super();
    this.id = id; this.value = value; this.required = required; this.type = type;
    this.options = options; this.attrs = {}; this.children = []; this.focusCalls = 0;
    this.disabled = false; this.selectionStart = 0; this.selectionEnd = 0;
    this.validity = { typeMismatch: false };
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  removeAttribute(name) { delete this.attrs[name]; }
  focus() { this.focusCalls += 1; }
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  closest(selector) { return selector === ".field" ? this.container : null; }
}

class FakeContainer {
  constructor() { this.children = []; }
  querySelector(selector) { return this.children.find((child) => `#${child.id}` === selector) || null; }
  append(child) { child.parent = this; this.children.push(child); }
  remove(child) { this.children = this.children.filter((item) => item !== child); }
}

function makeForm({ configuredNeighborhood = false, validValues = false } = {}) {
  const ids = ["nome", "cpf", "nascimento", "email", "telefone", "rua", "numero", "bairro", "bairro-outro", "cep"];
  const fields = ids.map((id) => {
    const type = id === "email" ? "email" : id === "nascimento" ? "date" : id === "bairro" ? "select-one" : "text";
    const value = validValues ? ({ nome: "Pessoa Teste", cpf: "529.982.247-25", nascimento: "1990-01-01", email: "teste@example.invalid", telefone: "0000000000", rua: "Rua de Teste", numero: "10", bairro: configuredNeighborhood ? "agua-verde" : "", "bairro-outro": "", cep: "00000000" }[id]) : "";
    const options = configuredNeighborhood && id === "bairro" ? [{ value: "" }, { value: "agua-verde", disabled: false }, { value: "outro", disabled: false }] : [{ value: "" }];
    const field = new FakeElement({ id, value, required: id !== "bairro-outro", type, options });
    if (id === "bairro-outro") { field.disabled = true; field.setAttribute("aria-describedby", "bairro-outro-note"); }
    field.container = new FakeContainer();
    return field;
  });
  const statusText = { textContent: "" };
  const feedback = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, querySelector: () => statusText };
  const customNeighborhoodContainer = { hidden: true };
  const submitButton = { disabled: true };
  const form = new FakeEventTarget();
  form.querySelectorAll = () => fields;
  form.querySelector = (selector) => selector === "#form-feedback" ? feedback
    : selector === 'button[type="submit"]' ? submitButton
      : fields.find((field) => `#${field.id}` === selector)
        || (selector === "#bairro-outro-container" ? customNeighborhoodContainer : null);
  const document = {
    querySelector: () => form,
    createElement: () => ({ className: "", id: "", textContent: "", parent: null, remove() { this.parent?.remove(this); } }),
  };
  runInContext(readScript("form-validation.js"), document);
  return { form, fields, feedback, statusText, submitButton, customNeighborhoodContainer };
}

test("validação de CPF, telefone, CEP e e-mail distingue formatos aceitos e rejeitados", () => {
  const { ReciclaFormValidation: validation } = runInContext(readScript("form-validation.js"), { querySelector: () => null });
  assert.equal(validation.isValidCpf("529.982.247-25"), true);
  assert.equal(validation.isValidCpf("111.111.111-11"), false);
  assert.equal(validation.isValidCpf("52998224724"), false);
  assert.equal(validation.isValidPhone("0000000000"), true);
  assert.equal(validation.isValidPhone("+55 00 00000-0000"), true);
  assert.equal(validation.isValidPhone("12345"), false);
  assert.equal(validation.isValidCep("00000-000"), true);
  assert.equal(validation.isValidCep("8946"), false);
  assert.equal(validation.isValidEmail({ type: "email", value: "teste@example.invalid", validity: { typeMismatch: false } }), true);
  assert.equal(validation.isValidEmail({ type: "email", value: "email-invalido", validity: { typeMismatch: true } }), false);
});

test("máscara de CPF pontua automaticamente, normaliza colagem e limita a onze dígitos", () => {
  const { ReciclaFormValidation: validation } = runInContext(readScript("form-validation.js"), { querySelector: () => null });
  assert.equal(validation.formatCpf("12345678900"), "123.456.789-00");
  assert.equal(validation.formatCpf("00123456789"), "001.234.567-89");
  assert.equal(validation.formatCpf("123.456.789-001234"), "123.456.789-00");

  const input = new FakeElement({ id: "cpf", value: "123.456.789-00" });
  input.selectionStart = input.value.length;
  validation.attachCpfMask(input);
  input.value = "001.234.567-89";
  input.selectionStart = input.value.length;
  input.dispatch("beforeinput", { inputType: "insertFromPaste", data: "001.234.567-89", preventDefault() { assert.fail("colagem deve ser normalizada"); } });
  input.dispatch("input");
  assert.equal(input.value, "001.234.567-89");

  let keyPrevented = false;
  input.dispatch("keydown", { key: ".", preventDefault() { keyPrevented = true; } });
  assert.equal(keyPrevented, true);
  let beforeInputPrevented = false;
  input.dispatch("beforeinput", { inputType: "insertText", data: "-", preventDefault() { beforeInputPrevented = true; } });
  assert.equal(beforeInputPrevented, true);
});

test("máscara preserva cursor em edição intermediária, Backspace e Delete", () => {
  const { ReciclaFormValidation: validation } = runInContext(readScript("form-validation.js"), { querySelector: () => null });
  const input = new FakeElement({ id: "cpf" });
  validation.attachCpfMask(input);

  input.value = "123.9456.789-00";
  input.selectionStart = 5;
  input.dispatch("input");
  assert.equal(input.value, "123.945.678-90");
  assert.equal(input.selectionStart, 5);

  let backspacePrevented = false;
  input.dispatch("keydown", { key: "Backspace", preventDefault() { backspacePrevented = true; } });
  assert.equal(backspacePrevented, false);
  input.value = "123.45.678-90";
  input.selectionStart = 4;
  input.dispatch("input");
  assert.equal(input.value, "123.456.789-0");
  assert.equal(input.selectionStart, 3);

  let deletePrevented = false;
  input.dispatch("keydown", { key: "Delete", preventDefault() { deletePrevented = true; } });
  assert.equal(deletePrevented, false);
});

test("lista de bairros contém os 21 nomes fornecidos em grupos e termina com Outro", () => {
  const html = fs.readFileSync(path.join(project, "acesso.html"), "utf8");
  const select = html.match(/<select id="bairro"[\s\S]*?<\/select>/)?.[0];
  assert.ok(select, "seletor de bairro deve existir");
  const names = [...select.matchAll(/<option\b[^>]*>([^<]*)<\/option>/g)].map((match) => match[1]);
  assert.equal(names.length, 23); // placeholder, 21 bairros/localidades e Outro
  assert.equal(names.at(-1), "Outro");
  assert.ok(select.indexOf('<optgroup label="Bairros urbanos">') < select.indexOf('<optgroup label="Localidades e comunidades rurais">'));
  assert.deepEqual(names.slice(1, -1), [
    "Água Verde", "Alto da Tijuca", "Alto das Palmeiras", "Boa Vista", "Campo da Água Verde", "Centro",
    "Industrial I", "Industrial II", "Jardim Esperança", "Marcílio Dias", "Piedade", "Sossego", "Tricolin",
    "Arroios", "Alto dos Pinheiros", "Barra Mansa", "Bonetes", "Campo do Trigo", "Campo dos Pontes", "Caraguatá", "Cerrito",
  ]);
});

test("formulário marca erros, associa descrições e foca o primeiro campo inválido", () => {
  const { form, fields, feedback, statusText, submitButton } = makeForm();
  assert.equal(submitButton.disabled, false);
  let prevented = false;
  form.dispatch("submit", { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(fields[0].attrs["aria-invalid"], "true");
  assert.match(fields[0].attrs["aria-describedby"], /error-nome/);
  assert.equal(fields[0].focusCalls, 1);
  assert.equal(feedback.attrs["data-state"], "error");
  assert.match(statusText.textContent, /Nenhum dado foi enviado ou salvo/);
});

test("feedback atualiza a quantidade de erros quando um campo é corrigido", () => {
  const { form, fields, statusText } = makeForm();
  form.dispatch("submit", { preventDefault() {} });
  fields[0].value = "Pessoa Teste";
  fields[0].dispatch("blur");
  assert.equal(fields[0].attrs["aria-invalid"], undefined);
  assert.match(statusText.textContent, /8 campos para revisar/);
});

test("formulário exige uma opção de bairro", () => {
  const { form, fields, feedback, statusText } = makeForm({ validValues: true, configuredNeighborhood: false });
  form.dispatch("submit", { preventDefault() {} });
  assert.equal(fields.find((field) => field.id === "bairro").attrs["aria-invalid"], "true");
  assert.equal(feedback.attrs["data-state"], "error");
  assert.match(statusText.textContent, /1 campo para revisar/);
});

test("Outro revela campo obrigatório, valida, oculta e limpa ao escolher bairro da lista", () => {
  const { form, fields, statusText, customNeighborhoodContainer } = makeForm({ validValues: true, configuredNeighborhood: true });
  const neighborhood = fields.find((field) => field.id === "bairro");
  const custom = fields.find((field) => field.id === "bairro-outro");
  neighborhood.value = "outro";
  neighborhood.dispatch("change");
  assert.equal(customNeighborhoodContainer.hidden, false);
  assert.equal(custom.disabled, false);
  assert.equal(custom.required, true);

  form.dispatch("submit", { preventDefault() {} });
  assert.equal(custom.attrs["aria-invalid"], "true");
  assert.match(custom.attrs["aria-describedby"], /error-bairro-outro/);
  assert.match(statusText.textContent, /1 campo para revisar/);

  custom.value = "  Comunidade Teste  ";
  custom.dispatch("blur");
  assert.equal(custom.value, "Comunidade Teste");
  assert.equal(custom.attrs["aria-invalid"], undefined);
  assert.match(statusText.textContent, /Os campos parecem válidos/);
  assert.match(statusText.textContent, /não envia nem salva/);

  neighborhood.value = "agua-verde";
  neighborhood.dispatch("change");
  assert.equal(customNeighborhoodContainer.hidden, true);
  assert.equal(custom.disabled, true);
  assert.equal(custom.required, false);
  assert.equal(custom.value, "");
  assert.equal(custom.attrs["aria-invalid"], undefined);
  assert.equal(custom.attrs["aria-describedby"], "bairro-outro-note");
});

test("formulário comunica sucesso de validação sem alegar envio ou salvamento", () => {
  const { form, fields, feedback, statusText } = makeForm({ validValues: true, configuredNeighborhood: true });
  form.dispatch("submit", { preventDefault() {} });
  assert.equal(fields.every((field) => !field.attrs["aria-invalid"]), true);
  assert.equal(feedback.attrs["data-state"], "success");
  assert.match(statusText.textContent, /não envia nem salva/);
});
