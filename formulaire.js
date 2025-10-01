document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "mes_produits_v1";
  const form = document.getElementById("add-product-form");
  const msgEl = document.getElementById("add-product-msg");

  function loadProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveProducts(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nom = document.getElementById("prod-nom").value.trim();
    const description = document.getElementById("prod-desc").value.trim();
    const prix = parseFloat(document.getElementById("prod-prix").value);
    const file = document.getElementById("prod-image").files[0];

    if (!nom || !description || isNaN(prix)) {
      msgEl.textContent = "Veuillez remplir tous les champs obligatoires.";
      msgEl.className = "text-danger";
      return;
    }

    const produit = {
      id: "p" + Date.now(),
      nom,
      description,
      prix,
      image: "",
    };

    // Si une image est uploadée, on la lit en DataURL
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        produit.image = ev.target.result;
        enregistrerProduit(produit);
      };
      reader.readAsDataURL(file);
    } else {
      enregistrerProduit(produit);
    }
  });

  function enregistrerProduit(produit) {
    const produits = loadProducts();
    produits.push(produit);
    saveProducts(produits);

    msgEl.textContent = "Produit ajouté avec succès ✅";
    msgEl.className = "text-success fw-bold";

    form.reset();
  }
});
