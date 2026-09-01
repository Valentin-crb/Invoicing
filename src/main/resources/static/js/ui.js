/* ============================================================
   ui.js — mici funcții ajutătoare, refolosite pe toate paginile.
   Nimic legat de fetch aici — doar manipulare DOM.
   ============================================================ */

function showMessage(el, text, type = "ok") {
  el.textContent = text;
  el.className = `message show ${type}`;
}

function hideMessage(el) {
  el.className = "message";
}

function formatMoney(value) {
  return Number(value).toFixed(2) + " lei";
}

function statusPillHtml(status) {
  const labels = { PENDING: "În așteptare", PAID: "Plătită", OVERDUE: "Expirată" };
  const cls = { PENDING: "status-pending", PAID: "status-paid", OVERDUE: "status-overdue" };
  return `<span class="status-pill ${cls[status] || ""}">${labels[status] || status}</span>`;
}
