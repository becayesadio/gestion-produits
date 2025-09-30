const produits = [
  {
    id: 1,
    nom: "Pomme",
    description: "Description du produit pomme",
    image: "images/téléchargement (1).jpeg",
    prix: 250,
    detailurl: "card.html?id=1"
  },
  {
    id: 2,
    nom: "Ananas",
    description: "Description du produit ananas",
    image: "images/téléchargement (2).jpeg",
    prix: 2370,
    detailurl: "card.html?id=2"
  },
   {
    id: 3,
    nom: "Mangue",
    description: "Description du produit Mangue",
    image: "images/mange.jpeg",
    prix: 2809,
    detailurl: "card.html?id=2"
  }
  ,
   {
    id: 4,
    nom: "Banane",
    description: "Description du produit Banane",
    image: "images/téléchargement.jpeg",
    prix: 2809,
    detailurl: "card.html?id=2"
  }

];

// ---- Afficher la liste des produits dynamiquement ----
function AfficherListProduits() {
  const container = document.getElementById('produit-card');
  container.innerHTML = ""; 

  produits.forEach((produit) => {
    const card = document.createElement('div');
    card.className = "produit-card col-md-3 border border-2 rounded p-3 m-2 text-center";

    card.innerHTML = `
      <img src="${produit.image}" alt="${produit.nom}" width="200" height="150" style="object-fit:cover;">
      <h3>${produit.nom}</h3>
      <p class="prix">${produit.prix}FCFA</p>
      <p class="description">${produit.description}</p> 
      <button class="btn btn-primary" id="btn-${produit.id}" type="button">Ajouter au panier</button>
      <a href="${produit.detailurl}" class="ms-2"><i class="fa-solid fa-eye"></i></a>
    `;

    container.appendChild(card);

    //  Attacher l'événement au bouton après ajout au DOM
    const btn = card.querySelector(`#btn-${produit.id}`);
    btn.addEventListener("click", () => {
      console.log(`${produit.nom} ajouté au panier !`);

      incrementBadge();
    });
  });
}

// ---- Fonction pour incrémenter le badge panier ----
function incrementBadge() {
  const badge = document.getElementById("compteur");
  if (badge) {
    let n = parseInt(badge.textContent) || 0;
    badge.textContent = n + 1;
  }
}

// ---- Appel au chargement ----
 AfficherListProduits();


// app.js — gère produits, affichage, ajout via prompt/console, et panier (stocké dans localStorage)
document.addEventListener('DOMContentLoaded', () => {
  const PRODUCTS_KEY = 'mes_produits_v1';
  const CART_KEY = 'mon_panier_v1';
  const produitContainer = document.getElementById('produit-card');
  const compteurEl = document.getElementById('compteur');
  const btnNewProduct = document.getElementById('btnNewProduct');

  // ----- utilitaires storage -----
  function loadProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : defaultProducts();
    } catch (e) { console.error(e); return defaultProducts(); }
  }
  function saveProducts(arr) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(arr)); }
  function loadCart() {
    try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : { items: {}, totalQty: 0 }; }
    catch (e) { console.error(e); return { items: {}, totalQty: 0 }; }
  }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  // ----- données initiales par défaut -----
  function defaultProducts() {
    return [
      { id: '1', nom: 'Banane', description: 'Banane locale, douce et sucrée.', image: 'images/téléchargement.jpeg', prix: 3500 },
      { id: '2', nom: 'Mangue', description: 'Mangue juteuse de saison.', image: 'images/mange.jpeg', prix: 4500 },
      {id:'3', nom: 'Pomme', description: 'pomme rouge  ', image:'images/téléchargement (1).jpeg', prix:4200}
    ];
  }

  // ----- rendu carte produit -----
  function createCard(p) {
    const card = document.createElement('div');
    card.className = 'produit-card';
    card.dataset.id = String(p.id || ('p' + Date.now()));
    card.innerHTML = `
      <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.nom)}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <h3>${escapeHtml(p.nom)}</h3>
      <p class="description">${escapeHtml(p.description || '')}</p>
      <p class="prix">${formatPrix(p.prix)}</p>
      <div class="actions">
        <button class="btn btn-primary btn-add-to-cart">Ajouter au panier</button>
        <a class="btn btn-outline-secondary ms-1" href="card.html?id=${encodeURIComponent(card.dataset.id)}"><i class="fa-solid fa-eye"></i></a>
      </div>
    `;
    // attacher listener ajouter au panier
    const addBtn = card.querySelector('.btn-add-to-cart');
    addBtn.addEventListener('click', () => {
      addToCart(extractProductFromCard(card));
      // feedback
      addBtn.textContent = 'Ajouté ✓'; addBtn.disabled = true;
      setTimeout(() => { addBtn.textContent = 'Ajouter au panier'; addBtn.disabled = false; }, 800);
    });
    return card;
  }

  function renderAll() {
    produitContainer.innerHTML = '';
    const products = loadProducts();
    products.forEach(p => {
      produitContainer.appendChild(createCard(p));
    });
  }

  // ----- extraction produit depuis DOM -----
  function extractProductFromCard(cardEl) {
    return {
      id: cardEl.dataset.id,
      nom: cardEl.querySelector('h3').textContent.trim(),
      description: cardEl.querySelector('.description').textContent.trim(),
      image: cardEl.querySelector('img').src,
      prix: parseFloat((cardEl.querySelector('.prix').textContent.match(/[\d.,]+/)||['0'])[0].replace(',', '.')) || 0
    };
  }

  // ----- panier -----
  function renderBadge() {
    const cart = loadCart();
    const n = cart.totalQty || 0;
    if (compteurEl) compteurEl.textContent = n;
  }

  function addToCart(product) {
    const cart = loadCart();
    const id = product.id || ('p' + Date.now());
    if (!cart.items) cart.items = {};
    if (!cart.items[id]) cart.items[id] = { product: product, qty: 0 };
    cart.items[id].qty += 1;
    // recompute totalQty
    let tot = 0; for (const k in cart.items) tot += cart.items[k].qty;
    cart.totalQty = tot;
    saveCart(cart);
    renderBadge();
  }

  // ----- ajouter produit sans formulaire (prompt) -----
  window.addProductPrompt = function () {
    const nom = prompt('Nom du produit (annuler pour quitter) :');
    if (!nom) return;
    const description = prompt('Description :') || '';
    const prixRaw = prompt('Prix (nombre, ex: 3500) :', '0');
    const prix = Number(prixRaw && prixRaw.replace(',', '.')) || 0;
    const image = prompt('URL image (laisser vide pour défaut) :') || '';
    const products = loadProducts();
    const p = { id: 'p' + Date.now(), nom, description, prix, image };
    products.push(p); saveProducts(products);
    produitContainer.appendChild(createCard(p));
  };

  // Exposer addProduct pour console/scripts
  window.addProduct = function (obj) {
    const products = loadProducts();
    const p = {
      id: obj.id || ('p' + Date.now()),
      nom: obj.nom || obj.name || 'Produit',
      description: obj.description || '',
      prix: obj.prix || obj.price || 0,
      image: obj.image || obj.imageUrl || ''
    };
    products.push(p); saveProducts(products);
    produitContainer.appendChild(createCard(p));
  };

  // ----- helpers -----
  function formatPrix(v) {
    const n = Number(v) || 0;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // Attacher bouton nouveau produit
  if (btnNewProduct) btnNewProduct.addEventListener('click', () => window.addProductPrompt());

  // Render initial
  renderAll(); renderBadge();
});

