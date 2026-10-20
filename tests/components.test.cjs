const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const project = path.resolve(__dirname, "..");
const readScript = (file) => fs.readFileSync(path.join(project, "js", file), "utf8");

function runInContext(source, document) {
  const context = { document, globalThis: null, console };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  return context;
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
  const document = { querySelectorAll: () => [menu] };

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
  const document = { querySelectorAll: () => [menu] };

  runInContext(readScript("main.js"), document);
  // Dispatch after the listener is installed.
  panel.dispatch("click", { target: { closest: (selector) => selector === "a" ? anchor : null } });
  assert.equal(menu.open, false);
});

class FakeElement extends FakeEventTarget {
  constructor({ id = "", value = "", required = false, type = "text", options = [] } = {}) {
    super();
    this.id = id; this.value = value; this.required = required; this.type = type;
    this.options = options; this.attrs = {}; this.children = []; this.focusCalls = 0;
    this.validity = { typeMismatch: false };
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  removeAttribute(name) { delete this.attrs[name]; }
  focus() { this.focusCalls += 1; }
  closest(selector) { return selector === ".field" ? this.container : null; }
}

class FakeContainer {
  constructor() { this.children = []; }
  querySelector(selector) { return this.children.find((child) => `#${child.id}` === selector) || null; }
  append(child) { child.parent = this; this.children.push(child); }
  remove(child) { this.children = this.children.filter((item) => item !== child); }
}

function makeForm({ configuredNeighborhood = false, validValues = false } = {}) {
  const ids = ["nome", "cpf", "nascimento", "email", "telefone", "rua", "numero", "bairro", "cep"];
  const fields = ids.map((id) => {
    const type = id === "email" ? "email" : id === "nascimento" ? "date" : id === "bairro" ? "select-one" : "text";
    const value = validValues ? ({ nome: "Pessoa Teste", cpf: "529.982.247-25", nascimento: "1990-01-01", email: "teste@example.invalid", telefone: "0000000000", rua: "Rua de Teste", numero: "10", bairro: configuredNeighborhood ? "bairro-teste" : "", cep: "00000000" }[id]) : "";
    const options = configuredNeighborhood && id === "bairro" ? [{ value: "" }, { value: "bairro-teste", disabled: false }] : [{ value: "" }];
    const field = new FakeElement({ id, value, required: true, type, options });
    field.container = new FakeContainer();
    return field;
  });
  const statusText = { textContent: "" };
  const feedback = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, querySelector: () => statusText };
  const submitButton = { disabled: true };
  const form = new FakeEventTarget();
  form.querySelectorAll = () => fields;
  form.querySelector = (selector) => selector === "#form-feedback" ? feedback : selector === 'button[type="submit"]' ? submitButton : null;
  const document = {
    querySelector: () => form,
    createElement: () => ({ className: "", id: "", textContent: "", parent: null, remove() { this.parent?.remove(this); } }),
  };
  runInContext(readScript("form-validation.js"), document);
  return { form, fields, feedback, statusText, submitButton };
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

test("formulário não permite concluir sem lista de bairros configurada", () => {
  const { form, fields, feedback, statusText } = makeForm({ validValues: true, configuredNeighborhood: false });
  form.dispatch("submit", { preventDefault() {} });
  assert.equal(fields.find((field) => field.id === "bairro").attrs["aria-invalid"], "true");
  assert.equal(feedback.attrs["data-state"], "error");
  assert.match(statusText.textContent, /1 campo para revisar/);
});

test("formulário comunica sucesso de validação sem alegar envio ou salvamento", () => {
  const { form, fields, feedback, statusText } = makeForm({ validValues: true, configuredNeighborhood: true });
  form.dispatch("submit", { preventDefault() {} });
  assert.equal(fields.every((field) => !field.attrs["aria-invalid"]), true);
  assert.equal(feedback.attrs["data-state"], "success");
  assert.match(statusText.textContent, /não envia nem salva/);
});
