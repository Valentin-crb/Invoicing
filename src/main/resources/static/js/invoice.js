/* ============================================================
   invoice.js — pagina principală. Cea mai complexă dintre cele
   trei, pentru că trebuie să:
     - populeze dropdown-ul de clienți și produsele disponibile
       pentru fiecare linie, din date reale (fetch)
     - lase utilizatorul să adauge/șteargă linii dinamic
     - recalculeze totalul de fiecare dată când ceva se schimbă
     - trimită totul ca CreateInvoiceRequest la POST /api/invoices
     - afișeze facturile existente, cu un buton de "marchează
       plătită" (PATCH pe status)

   Citește-l de sus în jos — funcțiile sunt puse cam în ordinea
   în care se execută în practică.
   ============================================================ */

const msg = document.getElementById("msg");

// ținem produsele în memorie (nu doar în HTML), ca să putem calcula
// prețul fiecărei linii fără să mai facem fetch de fiecare dată
let productsCache = [];
let lineCounter = 0; // id unic pentru fiecare rând de linie generat dinamic

// -------------------- populare dropdown client + produse --------------------

async function loadClientOptions() {
  const clients = await api.getClients();
  const select = document.getElementById("client-select");

  if (clients.length === 0) {
    select.innerHTML = `<option value="">Niciun client — adaugă unul întâi</option>`;
    return;
  }

  select.innerHTML = clients
    .map((c) => `<option value="${c.id}">${c.name} (#${c.id})</option>`)
    .join("");
}

async function loadProductsCache() {
  productsCache = await api.getProducts();
}

function productOptionsHtml() {
  if (productsCache.length === 0) {
    return `<option value="">Niciun produs</option>`;
  }
  return productsCache
    .map((p) => `<option value="${p.id}">${p.name} — ${formatMoney(p.unitPrice)}</option>`)
    .join("");
}

// -------------------- rânduri de linie, adăugate/șterse dinamic --------------------

function addLineRow() {
  lineCounter++;
  const id = `line-${lineCounter}`;

  const row = document.createElement("div");
  row.className = "line-row";
  row.dataset.lineId = id;
  row.innerHTML = `
    <div>
      <label>Produs</label>
      <select class="line-product">${productOptionsHtml()}</select>
    </div>
    <div>
      <label>Cantitate</label>
      <input type="number" class="line-qty" min="1" value="1" />
    </div>
    <div class="qty-price"><span class="line-subtotal">0.00 lei</span></div>
    <button type="button" class="remove-line" title="Șterge linia">×</button>
  `;

  document.getElementById("lines-container").appendChild(row);

  // ascultăm schimbări pe ACEST rând specific, ca să recalculăm totalul
  row.querySelector(".line-product").addEventListener("change", recalculateTotal);
  row.querySelector(".line-qty").addEventListener("input", recalculateTotal);
  row.querySelector(".remove-line").addEventListener("click", () => {
    row.remove();
    recalculateTotal();
  });

  recalculateTotal();
}

// Recalculăm totalul afișat DOAR ca informație vizuală pentru utilizator —
// prețul "adevărat", cel care contează, e calculat din nou pe server, în
// InvoiceService, exact cum am discutat: nu ai încredere într-un total
// trimis de client, îl calculezi tu, din prețurile reale din baza de date.
function recalculateTotal() {
  let total = 0;

  document.querySelectorAll(".line-row").forEach((row) => {
    const productId = row.querySelector(".line-product").value;
    const qty = Number(row.querySelector(".line-qty").value) || 0;
    const product = productsCache.find((p) => String(p.id) === String(productId));
    const subtotal = product ? product.unitPrice * qty : 0;

    row.querySelector(".line-subtotal").textContent = formatMoney(subtotal);
    total += subtotal;
  });

  document.getElementById("total-amount").textContent = formatMoney(total);
}

document.getElementById("add-line").addEventListener("click", addLineRow);

// -------------------- trimiterea facturii --------------------

document.getElementById("submit-invoice").addEventListener("click", async () => {
  const clientId = document.getElementById("client-select").value;
  const lineRows = document.querySelectorAll(".line-row");

  if (!clientId) {
    showMessage(msg, "Alege un client.", "error");
    return;
  }
  if (lineRows.length === 0) {
    showMessage(msg, "Adaugă cel puțin o linie.", "error");
    return;
  }

  // construim exact forma pe care o așteaptă CreateInvoiceRequest:
  // { clientId, invoiceLineRequestList: [{ productId, quantity }, ...] }
  const invoiceLineRequestList = Array.from(lineRows).map((row) => ({
    productId: Number(row.querySelector(".line-product").value),
    quantity: Number(row.querySelector(".line-qty").value),
  }));

  try {
    await api.createInvoice({ clientId: Number(clientId), invoiceLineRequestList });
    showMessage(msg, "Factură emisă.", "ok");

    document.getElementById("lines-container").innerHTML = "";
    addLineRow();

    await loadInvoices();
  } catch (err) {
    showMessage(msg, err.message, "error");
  }
});

// -------------------- lista de facturi existente --------------------

async function loadInvoices() {
  const invoices = await api.getInvoices();

  document.getElementById("invoice-count").textContent =
    invoices.length + (invoices.length === 1 ? " factură" : " facturi");

  const tbody = document.getElementById("invoices-body");
  const emptyMsg = document.getElementById("invoices-empty");

  if (invoices.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  tbody.innerHTML = invoices
    .map((inv) => {
      const total = inv.invoiceLine.reduce((sum, line) => sum + line.price, 0);
      const canMarkPaid = inv.invoiceStatus === "PENDING";

      return `
        <tr>
          <td class="num">#${inv.id}</td>
          <td>${inv.client.name}</td>
          <td>${inv.date}</td>
          <td>${statusPillHtml(inv.invoiceStatus)}</td>
          <td class="num">${formatMoney(total)}</td>
          <td>
            ${canMarkPaid
              ? `<button type="button" class="link mark-paid" data-id="${inv.id}">marchează plătită</button>`
              : ""}
          </td>
        </tr>`;
    })
    .join("");

  // butoanele "marchează plătită" sunt generate dinamic, deci le legăm
  // de eveniment DUPĂ ce au fost inserate în pagină, nu înainte
  document.querySelectorAll(".mark-paid").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api.updateInvoiceStatus(btn.dataset.id, "PAID");
        await loadInvoices();
      } catch (err) {
        showMessage(msg, err.message, "error");
      }
    });
  });
}

// -------------------- pornire pagină --------------------

async function init() {
  await Promise.all([loadClientOptions(), loadProductsCache(), loadInvoices()]);
  addLineRow(); // o primă linie goală, gata de completat
}

init().catch((err) => showMessage(msg, err.message, "error"));
