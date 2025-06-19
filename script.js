   const cart = [];

    function addToCart(item, price) {
      const existing = cart.find(p => p.name === item);
      if (existing) {
        existing.qtd++;
      } else {
        cart.push({ name: item, price: price, qtd: 1 });
      }
      renderCart();
      updateQuantityBadge(item);
      
      // Feedback visual
      const productElement = document.querySelector(`.product[data-name="${item}"]`);
      if (productElement) {
        productElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
          productElement.style.transform = 'translateY(-10px)';
        }, 300);
      }
    }

    function removeFromCart(item) {
      const index = cart.findIndex(p => p.name === item);
      if (index !== -1) {
        cart[index].qtd--;
        if (cart[index].qtd <= 0) {
          cart.splice(index, 1);
        }
        renderCart();
        updateQuantityBadge(item);
      }
    }

    function updateQuantityBadge(itemName) {
      const product = document.querySelector(`.product[data-name="${itemName}"]`);
      if (!product) return;
      const badge = product.querySelector('.qty-badge');
      const found = cart.find(p => p.name === itemName);
      if (found) {
        badge.textContent = found.qtd;
        badge.style.display = 'flex';
        // Animação ao atualizar
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => {
          badge.style.transform = 'scale(1)';
        }, 300);
      } else {
        badge.style.display = 'none';
      }
    }

    function renderCart() {
      const list = document.getElementById('cart-list');
      const totalEl = document.getElementById('total');
      list.innerHTML = '';
      let total = 0;
      
      if (cart.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Seu carrinho está vazio';
        li.style.textAlign = 'center';
        li.style.padding = '1.5rem';
        li.style.opacity = '0.7';
        list.appendChild(li);
      } else {
        cart.forEach(p => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${p.qtd}x ${p.name}</span>
            <span>R$ ${(p.price * p.qtd).toFixed(2)}</span>
          `;
          list.appendChild(li);
          total += p.price * p.qtd;
        });
      }
      
      totalEl.textContent = total.toFixed(2);
    }

    function sendWhatsAppOrder() {
const now = new Date();
      const name = document.getElementById('client-name').value.trim();
      const payment = document.getElementById('payment-method').value;
      const delivery = document.getElementById('delivery-method').value;
const notes = document.getElementById('extra-notes').value.trim();


      if (!name) {
        alert('Por favor, preencha seu nome.');
        document.getElementById('client-name').focus();
        return;
      }

      if (!payment) {
        alert('Por favor, selecione a forma de pagamento.');
        return;
      }

      if (!delivery) {
        alert('Por favor, selecione o tipo de entrega.');
        return;
      }

      let orderNumber = parseInt(localStorage.getItem("orderNumber") || "0");
orderNumber++;
localStorage.setItem("orderNumber", orderNumber);

      const date = now.toLocaleDateString('pt-BR');
      const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      let message = `*🍴 PEDIDO SALGADO DAS CUNHADAS* 🍴\n\n`;
      message += `*Cliente:* ${name}\n`;
      message += `*Nº do pedido:* ${orderNumber}\n`;
      message += `*Data:* ${date} às ${time}\n`;
      message += `*Pagamento:* ${payment}\n`;
      message += `*Entrega:* ${delivery}\n\n`;
      message += `*ITENS DO PEDIDO:*\n`;

      let total = 0;
      cart.forEach(p => {
        const subtotal = p.price * p.qtd;
        message += `➤ ${p.qtd}x ${p.name} - R$ ${subtotal.toFixed(2)}\n`;
        total += subtotal;
      });

      message += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
      message += `\n*Observações:* ${notes || "______________________________"}\n\n`;

      message += `Obrigado pelo seu pedido! 🎉`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/5565999106408?text=${encoded}`, '_blank');
    }

    function contactPerson(name, number) {
      const message = encodeURIComponent(`Olá ${name}, gostaria de saber mais sobre o salgado das cunhadas!`);
      window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    }

    function closeImageModal() {
      const modal = document.getElementById('image-modal');
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }

    document.addEventListener("DOMContentLoaded", () => {
      const modal = document.getElementById("image-modal");
      const modalImage = document.getElementById("modal-image");

      document.querySelectorAll(".product img").forEach(img => {
        img.addEventListener("click", () => {
          modalImage.src = img.src;
          modal.style.display = "flex";
          setTimeout(() => {
            modal.classList.add('show');
          }, 10);
        });
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeImageModal();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeImageModal();
      });
      
      // Adiciona placeholders melhores
      document.getElementById('payment-method').children[0].textContent = 'Forma de pagamento';
      document.getElementById('delivery-method').children[0].textContent = 'Tipo de entrega';
      
      // Renderiza o carrinho vazio inicial
      renderCart();
    });

// Alternância de tema
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const icon = document.getElementById("theme-toggle").querySelector("i");
  if (document.body.classList.contains("light-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
  }
});
