/* ============================================================
   produse.js — exact același tipar ca la clienti.js (creare +
   editare + ștergere). Dacă l-ai înțeles pe acela, ăsta n-ar
   trebui să-ți dea bătăi de cap.
   ============================================================ */

const msg = document.getElementById("msg");
let editingProductId = null;

async function loadProducts() {
  const products = await api.getProducts();

  document.getElementById("product-count").textContent =
    products.length + (products.length === 1 ? " produs" : " produse");

  const tbody = document.getElementById("products-body");
  const emptyMsg = document.getElementById("products-empty");

  if (products.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  tbody.innerHTML = products
    .map(
      (p) => `
        <tr>
          <td class="num">${p.id}</td>
          <td>${p.name}</td>
          <td class="num">${formatMoney(p.unitPrice)}</td>
          <td class="num">${(p.vatRate * 100).toFixed(0)}%</td>
          <td class="row-actions">
            <button type="button" class="edit-btn" data-id="${p.id}">editează</button>
            <button type="button" class="delete-btn" data-id="${p.id}">șterge</button>
          </td>
        </tr>`
    )
    .join("");

  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => startEdit(btn.dataset.id, products))
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id))
  );
}

function startEdit(id, products) {
  const product = products.find((p) => String(p.id) === String(id));
  if (!product) return;

  editingProductId = product.id;

  document.getElementById("name").value = product.name;
  document.getElementById("unitPrice").value = product.unitPrice;
  document.getElementById("vatRate").value = product.vatRate;

  document.getElementById("submit-product").textContent = "Salvează modificarea";
  document.getElementById("cancel-edit-product").style.display = "inline-block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopEdit() {
  editingProductId = null;
  document.getElementById("name").value = "";
  document.getElementById("unitPrice").value = "";
  document.getElementById("vatRate").value = "";
  document.getElementById("submit-product").textContent = "Adaugă produs";
  document.getElementById("cancel-edit-product").style.display = "none";
}

document.getElementById("cancel-edit-product").addEventListener("click", stopEdit);

async function deleteProduct(id) {
  if (!confirm("Ștergi acest produs definitiv?")) return;

  try {
    await api.deleteProduct(id);
    showMessage(msg, "Produs șters.", "ok");
    await loadProducts();
  } catch (err) {
    showMessage(msg, err.message, "error");
  }
}

document.getElementById("submit-product").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const unitPrice = document.getElementById("unitPrice").value;
  const vatRate = document.getElementById("vatRate").value;

  if (!name || unitPrice === "" || vatRate === "") {
    showMessage(msg, "Completează toate câmpurile.", "error");
    return;
  }

  const product = { name, unitPrice: Number(unitPrice), vatRate: Number(vatRate) };

  try {
    if (editingProductId) {
      await api.updateProduct(editingProductId, product);
      showMessage(msg, "Produs actualizat.", "ok");
    } else {
      await api.createProduct(product);
      showMessage(msg, "Produs adăugat.", "ok");
    }

    stopEdit();
    await loadProducts();
  } catch (err) {
    showMessage(msg, err.message, "error");
  }
});

loadProducts().catch((err) => showMessage(msg, err.message, "error"));

