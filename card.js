(function () {
  const CART_KEY = "mon_panier_v1";
  const cartList = document.getElementById("cart-list");
  const cartTotalEl = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout");

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : { items: {}, totalQty: 0 };
    } catch (e) {
      return { items: {}, totalQty: 0 };
    }
  }
  function saveCart(c) {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
  }

  function formatFCFA(n) {
    const x = Number(n) || 0;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  }

  function render() {
    cartList.innerHTML = "";
    const cart = loadCart();
    let total = 0;
    const keys = Object.keys(cart.items || {});
    if (!keys.length) {
      cartList.innerHTML = "<p>Votre panier est vide.</p>";
      cartTotalEl.textContent = "0 FCFA";
      return;
    }

    keys.forEach((k) => {
      const it = cart.items[k];
      const p = it.product;
      const qty = it.qty || 0;
      const lineTotal = (Number(p.prix || p.price || 0) || 0) * qty;
      total += lineTotal;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
            <img src="${escapeHtml(
              p.image || ""
            )}" onerror="this.src='https://via.placeholder.com/120x80?text=No+Image'">
            <div style="flex:1">
              <div style="font-weight:700">${escapeHtml(p.nom || p.name)}</div>
              <div style="color:#666">${escapeHtml(p.description || "")}</div>
            </div>
            <div style="text-align:right">
              <div>${formatFCFA(p.prix || p.price || 0)}</div>
              <div class="qty">
                <button class="btn btn-sm btn-outline-secondary dec">-</button>
                <input type="text" value="${qty}" style="width:36px;text-align:center;" readonly>
                <button class="btn btn-sm btn-outline-secondary inc">+</button>
              </div>
              <div style="margin-top:8px">Ligne: <strong>${formatFCFA(
                lineTotal
              )}</strong></div>
              <div style="margin-top:6px"><button class="btn btn-sm btn-danger del">Supprimer</button></div>
            </div>
          `;
      cartList.appendChild(div);

      // events
      div.querySelector(".inc").addEventListener("click", () => {
        cart.items[k].qty += 1;
        saveCart(cart);
        render();
      });
      div.querySelector(".dec").addEventListener("click", () => {
        cart.items[k].qty -= 1;
        if (cart.items[k].qty <= 0) delete cart.items[k];
        saveCart(cart);
        render();
      });
      div.querySelector(".del").addEventListener("click", () => {
        if (!confirm("Supprimer cet article ?")) return;
        delete cart.items[k];
        saveCart(cart);
        render();
      });
    });

    cart.totalQty = Object.values(cart.items).reduce(
      (s, it) => s + (it.qty || 0),
      0
    );
    saveCart(cart);
    cartTotalEl.textContent = formatFCFA(total);
  }

  clearBtn.addEventListener("click", () => {
    if (!confirm("Vider le panier ?")) return;
    localStorage.removeItem(CART_KEY);
    render();
  });

  checkoutBtn.addEventListener("click", () => {
    const cart = loadCart();
    if (!cart || !cart.totalQty) {
      alert("Panier vide.");
      return;
    }
    alert("Paiement simulé — merci !");
    localStorage.removeItem(CART_KEY);
    render();
  });

  function escapeHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // initial render
  render();
})();
