/* ============================================================
   api.js — un singur loc de unde toate paginile vorbesc cu
   backend-ul Spring Boot. Restul fișierelor JS (invoice.js,
   clienti.js, produse.js) importă funcțiile de aici.

   Conceptul cheie: fetch()
   -------------------------------------------------------------
   fetch(url, options) trimite o cerere HTTP către server și
   întoarce o Promise — un obiect care reprezintă "un rezultat
   care încă nu a sosit, dar va sosi". Nu poți folosi rezultatul
   imediat pe linia următoare, pentru că răspunsul vine de pe
   rețea, nu instant, ca o variabilă normală.

   Ca să "aștepți" acel rezultat, ai două stiluri echivalente:

     fetch(url).then(response => { ... })      // stil .then()

     const response = await fetch(url);        // stil async/await
                                                 // (ce folosim aici)

   async/await e doar o sintaxă mai citeață peste aceleași
   Promise-uri — "await" înseamnă "oprește-te aici până vine
   răspunsul, apoi continuă". O funcție care folosește "await"
   trebuie ea însăși declarată "async".
   ============================================================ */

const API_BASE = "/api";

/**
 * Wrapper peste fetch care:
 *  1. adaugă automat header-ul JSON când trimitem un body
 *  2. aruncă o eroare JS reală dacă serverul răspunde cu un
 *     status de eroare (Spring nu face asta implicit — fetch()
 *     NU consideră un 404/400/500 ca fiind o "eroare de rețea",
 *     doar un răspuns ca oricare altul, deci trebuie verificat
 *     manual cu response.ok)
 *  3. parsează automat JSON-ul din răspuns
 */
async function apiRequest(path, { method = "GET", body } = {}) {
  const response = await fetch(API_BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // DELETE și PATCH de succes pot întoarce corp gol (204/200 fără body) —
  // nu încercăm să facem .json() pe un răspuns gol.
  const hasBody = response.headers.get("content-length") !== "0";
  const data = hasBody ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // Backend-ul tău (ResourceNotFoundException prin @ControllerAdvice)
    // întoarce mesajul de eroare direct ca text/JSON simplu — îl folosim
    // dacă există, altfel dăm un mesaj generic.
    const message = (data && (data.message || data)) || `Eroare ${response.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

const api = {
  getClients: () => apiRequest("/clients"),
  createClient: (client) => apiRequest("/clients", { method: "POST", body: client }),
  updateClient: (id, client) => apiRequest(`/clients/${id}`, { method: "PUT", body: client }),
  deleteClient: (id) => apiRequest(`/clients/${id}`, { method: "DELETE" }),

  getProducts: () => apiRequest("/products"),
  createProduct: (product) => apiRequest("/products", { method: "POST", body: product }),
  updateProduct: (id, product) => apiRequest(`/products/${id}`, { method: "PUT", body: product }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),

  getInvoices: () => apiRequest("/invoices"),
  createInvoice: (request) => apiRequest("/invoices", { method: "POST", body: request }),
  updateInvoiceStatus: (id, status) =>
    apiRequest(`/invoices/${id}/status`, { method: "PATCH", body: { status } }),
};
