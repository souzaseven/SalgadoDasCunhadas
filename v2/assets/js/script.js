"use strict";

/* =========================================================
   Salgado das Cunhadas — lógica da loja
   ========================================================= */

/* WhatsApp (formato: 55 + DDD + 9 + 8 dígitos = 13 dígitos) */
const ORDER_WHATSAPP = "5565999106408"; // número que recebe os pedidos
const CONTACTS = {
  Ismayara: "5565999016684",
  "Ana Paula": "5565999106408",
};

/* Taxa de entrega (R$). Deixe 0 para não cobrar / combinar no WhatsApp. */
const DELIVERY_FEE = 0;

/* Catálogo — fonte única de verdade para nome, preço e imagem */
const PRODUCTS = [
  {
    name: "12 pequenos de carne",
    label: "12 pequenos de carne",
    price: 23,
    img: "assets/img/risoles12.png",
    alt: "12 salgados pequenos de carne",
  },
  {
    name: "5 grandes de carne e 2 pequenos",
    label: "5 grandes + 2 pequenos",
    price: 28,
    img: "assets/img/salgado.png",
    alt: "5 salgados grandes e 2 pequenos de carne",
  },
  {
    name: "7 salgados pequenos de carne",
    label: "7 salgados pequenos de carne",
    price: 12,
    img: "assets/img/salgado.png",
    alt: "7 salgados pequenos de carne",
  },
  {
    name: "7 salgados grandes",
    label: "7 salgados grandes",
    price: 30,
    img: "assets/img/7salgado.jpeg",
    alt: "7 salgados grandes",
  },
  {
    name: "8 salgados pequenos de carne e queijo",
    label: "8 salgados pequenos de carne e queijo",
    price: 13,
    img: "assets/img/8salgado.jpeg",
    alt: "8 salgados pequenos de carne e queijo",
  },
];

const CART_STORAGE_KEY = "sdc:cart";
const THEME_STORAGE_KEY = "sdc:theme";
const ORDER_NUMBER_KEY = "sdc:orderNumber";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatBRL = (value) => brl.format(value);

/* =========================================================
   Estado do carrinho (com persistência)
   ========================================================= */
let cart = loadCart();

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    // mantém só itens que ainda existem no catálogo
    return parsed.filter((p) => p && findProduct(p.name) && p.qtd > 0);
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* localStorage indisponível — segue sem persistir */
  }
}

function findProduct(name) {
  return PRODUCTS.find((p) => p.name === name);
}

/* =========================================================
   Ações do carrinho
   ========================================================= */
function addToCart(name) {
  const product = findProduct(name);
  if (!product) return;

  const existing = cart.find((p) => p.name === name);
  if (existing) existing.qtd++;
  else cart.push({ name, price: product.price, qtd: 1 });

  saveCart();
  renderCart();
  updateQuantityBadge(name);
  bumpProductCard(name);
}

function removeFromCart(name) {
  const index = cart.findIndex((p) => p.name === name);
  if (index === -1) return;

  cart[index].qtd--;
  if (cart[index].qtd <= 0) cart.splice(index, 1);

  saveCart();
  renderCart();
  updateQuantityBadge(name);
}

/* =========================================================
   Render de produtos
   ========================================================= */
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = "";
  PRODUCTS.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product";
    card.dataset.name = product.name;
    card.innerHTML = `
      <span class="qty-badge" aria-hidden="true">0</span>
      <img src="${product.img}" alt="${product.alt}" loading="lazy" width="120" height="120" />
      <h3>${product.label}</h3>
      <p>${formatBRL(product.price)}</p>
      <div class="btns">
        <button type="button" data-action="add" data-name="${product.name}"
          aria-label="Adicionar ${product.label}">+ Adicionar</button>
        <button type="button" data-action="remove" data-name="${product.name}"
          aria-label="Remover ${product.label}">− Remover</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateQuantityBadge(name) {
  const card = document.querySelector(`.product[data-name="${CSS.escape(name)}"]`);
  if (!card) return;

  const badge = card.querySelector(".qty-badge");
  const found = cart.find((p) => p.name === name);

  if (found) {
    badge.textContent = found.qtd;
    badge.style.display = "flex";
    badge.style.transform = "scale(1.2)";
    setTimeout(() => (badge.style.transform = "scale(1)"), 300);
  } else {
    badge.style.display = "none";
  }
}

function refreshAllBadges() {
  PRODUCTS.forEach((p) => updateQuantityBadge(p.name));
}

function bumpProductCard(name) {
  const card = document.querySelector(`.product[data-name="${CSS.escape(name)}"]`);
  if (!card) return;
  card.style.transform = "scale(1.05)";
  setTimeout(() => (card.style.transform = "translateY(-10px)"), 300);
}

/* =========================================================
   Totais e carrinho
   ========================================================= */
function cartSubtotal() {
  return cart.reduce((sum, p) => sum + p.price * p.qtd, 0);
}

function currentDeliveryFee() {
  if (DELIVERY_FEE <= 0 || cart.length === 0) return 0;
  const delivery = document.getElementById("delivery-method")?.value;
  return delivery === "Entregar" ? DELIVERY_FEE : 0;
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const totalEl = document.getElementById("total");
  if (!list || !totalEl) return;

  list.innerHTML = "";

  if (cart.length === 0) {
    const li = document.createElement("li");
    li.className = "cart-empty";
    li.textContent = "Seu carrinho está vazio";
    list.appendChild(li);
  } else {
    cart.forEach((p) => {
      const li = document.createElement("li");

      const label = document.createElement("span");
      label.textContent = `${p.qtd}x ${p.name}`;

      const value = document.createElement("span");
      value.textContent = formatBRL(p.price * p.qtd);

      li.append(label, value);
      list.appendChild(li);
    });
  }

  const subtotal = cartSubtotal();
  const fee = currentDeliveryFee();

  const subtotalLine = document.getElementById("subtotal-line");
  const feeLine = document.getElementById("delivery-fee-line");
  if (fee > 0) {
    document.getElementById("subtotal").textContent = formatBRL(subtotal);
    document.getElementById("delivery-fee").textContent = formatBRL(fee);
    subtotalLine.hidden = false;
    feeLine.hidden = false;
  } else {
    subtotalLine.hidden = true;
    feeLine.hidden = true;
  }

  totalEl.textContent = formatBRL(subtotal + fee);
}

/* =========================================================
   Validação de formulário (feedback inline)
   ========================================================= */
function setFieldError(id, message) {
  const field = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (err) err.textContent = message;
  if (field) field.setAttribute("aria-invalid", "true");
}

function clearFieldError(id) {
  const field = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (err) err.textContent = "";
  if (field) field.removeAttribute("aria-invalid");
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function validateOrder() {
  ["client-name", "client-phone", "payment-method", "delivery-method"].forEach(clearFieldError);

  const name = document.getElementById("client-name").value.trim();
  const phoneDigits = onlyDigits(document.getElementById("client-phone").value);
  const payment = document.getElementById("payment-method").value;
  const delivery = document.getElementById("delivery-method").value;

  let firstInvalid = null;
  const fail = (id, msg) => {
    setFieldError(id, msg);
    if (!firstInvalid) firstInvalid = id;
  };

  if (cart.length === 0) {
    alert("Seu carrinho está vazio. Adicione pelo menos um item.");
    return null;
  }
  if (name.length < 2) fail("client-name", "Informe seu nome completo.");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    fail("client-phone", "Informe um telefone válido com DDD, ex.: (65) 99999-9999.");
  }
  if (!payment) fail("payment-method", "Selecione a forma de pagamento.");
  if (!delivery) fail("delivery-method", "Selecione o tipo de entrega.");

  if (firstInvalid) {
    document.getElementById(firstInvalid).focus();
    return null;
  }

  return {
    name,
    phone: document.getElementById("client-phone").value.trim(),
    payment,
    delivery,
    notes: document.getElementById("order-notes").value.trim(),
  };
}

/* =========================================================
   Pedido via WhatsApp
   ========================================================= */
function nextOrderNumber() {
  let n = parseInt(localStorage.getItem(ORDER_NUMBER_KEY) || "0", 10);
  n = Number.isFinite(n) ? n + 1 : 1;
  try {
    localStorage.setItem(ORDER_NUMBER_KEY, String(n));
  } catch {
    /* sem persistência do contador */
  }
  return n;
}

function sendWhatsAppOrder() {
  const data = validateOrder();
  if (!data) return;

  const orderNumber = nextOrderNumber();
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const subtotal = cartSubtotal();
  const fee = currentDeliveryFee();

  const lines = [
    "*🍴 PEDIDO SALGADO DAS CUNHADAS* 🍴",
    "",
    `*Cliente:* ${data.name}`,
    `*Telefone:* ${data.phone}`,
    `*Nº do pedido:* ${orderNumber}`,
    `*Data:* ${date} às ${time}`,
    `*Pagamento:* ${data.payment}`,
    `*Entrega:* ${data.delivery}`,
    "",
    "*ITENS DO PEDIDO:*",
  ];

  cart.forEach((p) => {
    lines.push(`➤ ${p.qtd}x ${p.name} — ${formatBRL(p.price * p.qtd)}`);
  });

  lines.push("");
  if (fee > 0) {
    lines.push(`*Subtotal:* ${formatBRL(subtotal)}`);
    lines.push(`*Entrega:* ${formatBRL(fee)}`);
  }
  lines.push(`*TOTAL: ${formatBRL(subtotal + fee)}*`);
  lines.push("", "⚠️ Salgados congelados ❄");
  lines.push("", `*Observações:* ${data.notes || "—"}`);
  lines.push("", "Obrigado pelo seu pedido! 🎉");

  const encoded = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${ORDER_WHATSAPP}?text=${encoded}`, "_blank", "noopener");
}

function contactPerson(name) {
  const number = CONTACTS[name];
  if (!number) return;
  const message = encodeURIComponent(
    `Olá ${name}, gostaria de saber mais sobre o Salgado das Cunhadas!`
  );
  window.open(`https://wa.me/${number}?text=${message}`, "_blank", "noopener");
}

/* =========================================================
   Modal de imagem
   ========================================================= */
let lastFocusedBeforeModal = null;

function openImageModal(src, alt) {
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  lastFocusedBeforeModal = document.activeElement;
  modalImage.src = src;
  modalImage.alt = alt || "Imagem ampliada";
  modal.style.display = "flex";
  requestAnimationFrame(() => modal.classList.add("show"));
  modal.querySelector("button").focus();
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (!modal.classList.contains("show") && modal.style.display !== "flex") return;
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
}

/* =========================================================
   Tema (com persistência)
   ========================================================= */
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-mode", isLight);
  const icon = document.querySelector("#theme-toggle i");
  if (icon) {
    icon.classList.toggle("fa-sun", isLight);
    icon.classList.toggle("fa-moon", !isLight);
  }
}

function toggleTheme() {
  const next = document.body.classList.contains("light-mode") ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* sem persistência do tema */
  }
}

/* =========================================================
   Bootstrap
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) applyTheme(savedTheme);
  } catch {
    /* ignora */
  }

  renderProducts();
  renderCart();
  refreshAllBadges();

  // Botão flutuante do WhatsApp
  const float = document.getElementById("whatsapp-float");
  if (float) {
    float.href = `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(
      "Olá! Gostaria de fazer um pedido no Salgado das Cunhadas."
    )}`;
  }

  // Delegação de eventos na grade de produtos
  const grid = document.getElementById("product-grid");
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (btn) {
      if (btn.dataset.action === "add") addToCart(btn.dataset.name);
      if (btn.dataset.action === "remove") removeFromCart(btn.dataset.name);
      return;
    }
    const img = e.target.closest("img");
    if (img) openImageModal(img.src, img.alt);
  });

  // Ações
  document.getElementById("checkout-btn").addEventListener("click", sendWhatsAppOrder);
  document.getElementById("order-form").addEventListener("submit", (e) => {
    e.preventDefault(); // evita reload ao pressionar Enter num campo
    sendWhatsAppOrder();
  });
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.querySelectorAll("[data-contact]").forEach((btn) => {
    btn.addEventListener("click", () => contactPerson(btn.dataset.contact));
  });

  // Recalcula total quando muda o tipo de entrega; limpa erros ao editar
  ["client-name", "client-phone", "payment-method", "delivery-method"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => clearFieldError(id));
    el.addEventListener("change", () => clearFieldError(id));
  });
  document.getElementById("delivery-method").addEventListener("change", renderCart);

  // Modal
  const modal = document.getElementById("image-modal");
  modal.querySelector("button").addEventListener("click", closeImageModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeImageModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeImageModal();
  });
});
