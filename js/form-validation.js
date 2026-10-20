(() => {
  "use strict";

  const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

  function isValidCpf(value) {
    const cpf = onlyDigits(value);
    if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;

    const calculateDigit = (base, weight) => {
      const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
      const remainder = (sum * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };

    return calculateDigit(cpf.slice(0, 9), 10) === Number(cpf[9])
      && calculateDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
  }

  function isValidPhone(value) {
    let phone = onlyDigits(value);
    if (phone.length === 12 || phone.length === 13) {
      if (!phone.startsWith("55")) return false;
      phone = phone.slice(2);
    }
    return phone.length === 10 || phone.length === 11;
  }

  function isValidCep(value) {
    return onlyDigits(value).length === 8;
  }

  function isValidEmail(field) {
    return field.type === "email" && field.value.trim() !== "" && field.validity.typeMismatch === false;
  }

  function neighborhoodListIsConfigured(field) {
    return [...field.options].some((option) => option.value.trim() !== "" && !option.disabled);
  }

  function errorFor(field) {
    const value = field.value.trim();

    if (field.id === "bairro" && !neighborhoodListIsConfigured(field)) {
      return "A lista oficial de bairros ainda não foi configurada; não é possível concluir o cadastro.";
    }
    if (field.required && value === "") return "Preencha este campo obrigatório.";
    if (value === "") return "";

    if (field.id === "nome" && value.length < 2) return "Informe seu nome completo.";
    if (field.id === "cpf" && !isValidCpf(value)) return "Informe um CPF com formato e dígitos verificadores válidos. Isso não confirma identidade.";
    if (field.id === "email" && !isValidEmail(field)) return "Informe um endereço de e-mail válido.";
    if (field.id === "telefone" && !isValidPhone(value)) return "Informe telefone com DDD: 10 ou 11 dígitos, com ou sem código do Brasil (+55).";
    if (field.id === "cep" && !isValidCep(value)) return "Informe um CEP com 8 dígitos.";
    if (field.id === "nascimento") {
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime()) || date > new Date()) return "Informe uma data de nascimento válida, que não seja futura.";
    }

    return "";
  }

  // Exposes only pure validators for automated checks; no personal data is read or stored here.
  globalThis.ReciclaFormValidation = { onlyDigits, isValidCpf, isValidPhone, isValidCep, isValidEmail };

  const form = document.querySelector("#registration-form");
  if (!form) return;

  const requiredFields = [...form.querySelectorAll("input[required], select[required]")];
  const feedback = form.querySelector("#form-feedback");
  const feedbackText = feedback?.querySelector(".form-status-text");
  const submitButton = form.querySelector('button[type="submit"]');
  let submitAttempted = false;

  if (!submitButton) return;

  function setFeedback(message, state = "info") {
    if (feedbackText) feedbackText.textContent = message;
    feedback?.setAttribute("data-state", state);
  }

  function updateFieldError(field) {
    const fieldContainer = field.closest(".field");
    if (!fieldContainer) return errorFor(field);

    const message = errorFor(field);
    const errorId = `error-${field.id}`;
    let errorElement = fieldContainer.querySelector(`#${errorId}`);

    if (message) {
      if (!errorElement) {
        errorElement = document.createElement("small");
        errorElement.className = "field-error";
        errorElement.id = errorId;
        fieldContainer.append(errorElement);
      }
      errorElement.textContent = message;
      field.setAttribute("aria-invalid", "true");
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(errorId);
      field.setAttribute("aria-describedby", [...describedBy].join(" "));
    } else {
      errorElement?.remove();
      field.removeAttribute("aria-invalid");
      const describedBy = (field.getAttribute("aria-describedby") || "")
        .split(/\s+/).filter((id) => id && id !== errorId);
      if (describedBy.length) field.setAttribute("aria-describedby", describedBy.join(" "));
      else field.removeAttribute("aria-describedby");
    }

    return message;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAttempted = true;

    const invalidFields = requiredFields.filter((field) => updateFieldError(field));
    if (invalidFields.length) {
      setFeedback(`Há ${invalidFields.length} campo${invalidFields.length === 1 ? "" : "s"} para revisar. Consulte as mensagens junto aos campos. Nenhum dado foi enviado ou salvo.`, "error");
      invalidFields[0].focus();
      return;
    }

    setFeedback("Os campos parecem válidos. Esta demonstração não envia nem salva o cadastro.", "success");
  });

  // Prevent the browser's default GET submission if the validation script is unavailable.
  submitButton.disabled = false;

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (!submitAttempted) return;
      updateFieldError(field);
      const remainingErrors = requiredFields.filter((item) => errorFor(item)).length;
      if (remainingErrors) {
        setFeedback(`Há ${remainingErrors} campo${remainingErrors === 1 ? "" : "s"} para revisar. Consulte as mensagens junto aos campos. Nenhum dado foi enviado ou salvo.`, "error");
      } else {
        setFeedback("Os campos parecem válidos. Esta demonstração não envia nem salva o cadastro.", "success");
      }
    });
  });
})();
