/* ============================================================
   clienti.js
   Cel mai simplu dintre cele trei fișiere — bun punct de plecare
   ca să înțelegi tiparul, înainte de invoice.js (mai complex).

   Tiparul general, pe orice pagină:
     1. la încărcare, cerem datele existente și le desenăm
     2. ascultăm click pe butonul de submit
     3. trimitem datele din formular către API
     4. reîncărcăm lista, ca să vezi noua înregistrare

   Editare vs. creare — aceeași idee ca la orice PUT pe care ai
   scris-o deja în Spring: dacă `editingClientId` are o valoare,
   butonul face UPDATE (PUT) pe acel id, nu POST. E doar un "steag"
   care ne spune în ce mod e formularul.
   ============================================================ */

const msg = document.getElementById("msg");
let editingClientId = null;

// -------------------- 1. încărcare + desenare tabel --------------------

async function loadClients() {
  const clients = await api.getClients();

  document.getElementById("client-count").textContent =
    clients.length + (clients.length === 1 ? " client" : " clienți");

  const tbody = document.getElementById("clients-body");
  const emptyMsg = document.getElementById("clients-empty");

  if (clients.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  tbody.innerHTML = clients
    .map(
      (c) => `
        <tr>
          <td class="num">${c.id}</td>
          <td>${c.name}</td>
          <td>${c.taxId}</td>
          <td>${c.email}</td>
          <td class="row-actions">
            <button type="button" class="edit-btn" data-id="${c.id}">editează</button>
            <button type="button" class="delete-btn" data-id="${c.id}">șterge</button>
          </td>
        </tr>`
    )
    .join("");

  // legăm butoanele nou create de evenimente — trebuie făcut DUPĂ ce
  // rândurile există deja în pagină, altfel document.querySelectorAll
  // nu găsește nimic
  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => startEdit(btn.dataset.id, clients))
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => deleteClient(btn.dataset.id))
  );
}

// -------------------- pornirea modului "editare" --------------------

function startEdit(id, clients) {
  const client = clients.find((c) => String(c.id) === String(id));
  if (!client) return;

  editingClientId = client.id;

  document.getElementById("name").value = client.name;
  document.getElementById("taxId").value = client.taxId;
  document.getElementById("email").value = client.email;

  document.getElementById("submit-client").textContent = "Salvează modificarea";
  document.getElementById("cancel-edit-client").style.display = "inline-block";

  // derulăm sus, la formular, ca utilizatorul să vadă imediat ce editează
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopEdit() {
  editingClientId = null;
  document.getElementById("name").value = "";
  document.getElementById("taxId").value = "";
  document.getElementById("email").value = "";
  document.getElementById("submit-client").textContent = "Adaugă client";
  document.getElementById("cancel-edit-client").style.display = "none";
}

document.getElementById("cancel-edit-client").addEventListener("click", stopEdit);

// -------------------- ștergere --------------------

async function deleteClient(id) {
  if (!confirm("Ștergi acest client definitiv?")) return;

  try {
    await api.deleteClient(id);
    showMessage(msg, "Client șters.", "ok");
    await loadClients();
  } catch (err) {
    // dacă backend-ul respinge ștergerea (ex: clientul are facturi legate),
    // eroarea din @ControllerAdvice ajunge direct aici, în err.message
    showMessage(msg, err.message, "error");
  }
}

// -------------------- 2 & 3. submit formular (creare SAU update) --------------------

document.getElementById("submit-client").addEventListener("click", async () => {
  const client = {
    name: document.getElementById("name").value.trim(),
    taxId: document.getElementById("taxId").value.trim(),
    email: document.getElementById("email").value.trim(),
  };

  if (!client.name || !client.taxId || !client.email) {
    showMessage(msg, "Completează toate câmpurile.", "error");
    return;
  }

  try {
    if (editingClientId) {
      await api.updateClient(editingClientId, client);
      showMessage(msg, "Client actualizat.", "ok");
    } else {
      await api.createClient(client);
      showMessage(msg, "Client adăugat.", "ok");
    }

    stopEdit();
    await loadClients();
  } catch (err) {
    showMessage(msg, err.message, "error");
  }
});

// pornim
loadClients().catch((err) => showMessage(msg, err.message, "error"));

