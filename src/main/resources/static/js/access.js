/* ============================================================
   access.js — dialogul pentru codul de acces.

   Include-l pe TOATE paginile, ÎNAINTE de api.js:
     <script src="/js/access.js"></script>
     <script src="/js/api.js"></script>

   Fișierul e autonom: își injectează singur stilurile și HTML-ul,
   deci nu trebuie să modifici style.css sau paginile în afară de
   tag-ul <script> de mai sus.

   Ce expune (funcții globale, folosite din api.js):

     getAccessCode()   -> Promise<string | null>
         Dacă am deja un cod salvat în tab, îl întoarce imediat.
         Altfel deschide dialogul și așteaptă ce face utilizatorul:
         întoarce codul introdus, sau null dacă a anulat.

     clearAccessCode() -> void
         Șterge codul salvat (se apelează când serverul răspunde 403).

   Conceptul nou: dialogul NU blochează codul, cum face prompt().
   Funcția întoarce o Promise — "o valoare care va sosi mai târziu"
   — iar cine o apelează o așteaptă cu `await`. Promise-ul se
   rezolvă abia când utilizatorul apasă OK / Anulează / Enter / Esc.
   ============================================================ */

(function () {
    const STORAGE_KEY = "invoicing-access-code";

    // ---------- stocare (sessionStorage = dispare când închizi tabul) ----------

    function readStored() {
        try {
            return sessionStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null; // unele browsere blochează storage-ul
        }
    }

    function writeStored(code) {
        try {
            sessionStorage.setItem(STORAGE_KEY, code);
        } catch (e) {
            /* dacă nu merge, codul va fi cerut din nou — nu e grav */
        }
    }

    window.clearAccessCode = function () {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
    };

    // ---------- stiluri ----------
    // Reutilizează variabilele și butoanele din style.css; aici definim
    // doar fundalul blurat și caseta din centru.

    const css = `
    .access-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(30, 37, 48, 0.40);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      opacity: 0;
      transition: opacity 0.18s ease;
    }
    .access-overlay.open { opacity: 1; }

    .access-dialog {
      width: min(400px, 100%);
      background: var(--paper, #FBFAF6);
      color: var(--ink, #1E2530);
      border: 1px solid var(--ink, #1E2530);
      border-radius: var(--radius, 3px);
      padding: 28px 28px 24px;
      box-shadow: 0 1px 0 var(--ink, #1E2530), 0 22px 48px rgba(30, 37, 48, 0.22);
      transform: translateY(8px);
      transition: transform 0.18s ease;
    }
    .access-overlay.open .access-dialog { transform: translateY(0); }

    .access-dialog h2 {
      font-family: 'Source Serif 4', serif;
      font-weight: 600;
      font-size: 20px;
      margin: 0 0 6px;
    }
    .access-dialog p {
      font-size: 13.5px;
      color: var(--ink-muted, #6B6558);
      margin: 0 0 18px;
    }
    .access-error {
      font-size: 13px;
      color: var(--danger, #A6402A);
      background: var(--danger-soft, #F3E4DF);
      border-radius: var(--radius, 3px);
      padding: 8px 10px;
      margin: 0 0 14px;
    }
    .access-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .access-overlay { background: rgba(30, 37, 48, 0.72); }
    }
    @media (prefers-reduced-motion: reduce) {
      .access-overlay, .access-dialog { transition: none; }
    }
  `;

    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ---------- dialogul propriu-zis ----------

    let pending = null; // Promise-ul dialogului deschis acum (dacă există)

    function openDialog(errorText) {
        // dacă dialogul e deja deschis, toți cei care așteaptă primesc același rezultat
        if (pending) return pending;

        pending = new Promise((resolve) => {
            const previouslyFocused = document.activeElement;

            const overlay = document.createElement("div");
            overlay.className = "access-overlay";
            overlay.innerHTML = `
        <div class="access-dialog" role="dialog" aria-modal="true"
             aria-labelledby="access-title" aria-describedby="access-desc">
          <h2 id="access-title">Cod de acces</h2>
          <p id="access-desc">
            Vizualizarea e liberă pentru oricine. Ca să adaugi, modifici sau
            ștergi date ai nevoie de codul din CV.
          </p>
          ${errorText ? `<div class="access-error" role="alert">${errorText}</div>` : ""}
          <label for="access-input">Cod</label>
          <input id="access-input" type="password" autocomplete="off"
                 autocapitalize="off" spellcheck="false" />
          <div class="access-actions">
            <button type="button" class="secondary" id="access-cancel">Anulează</button>
            <button type="button" id="access-ok">Continuă</button>
          </div>
        </div>`;

            document.body.appendChild(overlay);

            const input = overlay.querySelector("#access-input");
            const okBtn = overlay.querySelector("#access-ok");
            const cancelBtn = overlay.querySelector("#access-cancel");

            // animația de intrare: clasa .open se adaugă la următorul cadru
            requestAnimationFrame(() => overlay.classList.add("open"));
            input.focus();

            function close(result) {
                document.removeEventListener("keydown", onKeyDown, true);
                overlay.classList.remove("open");
                setTimeout(() => overlay.remove(), 180);
                if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
                pending = null;
                resolve(result);
            }

            function submit() {
                const value = input.value.trim();
                if (!value) {
                    input.focus();
                    return;
                }
                close(value);
            }

            function onKeyDown(e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    close(null);
                } else if (e.key === "Enter" && document.activeElement === input) {
                    e.preventDefault();
                    submit();
                } else if (e.key === "Tab") {
                    // ținem focusul în interiorul dialogului
                    const items = [input, cancelBtn, okBtn];
                    const i = items.indexOf(document.activeElement);
                    e.preventDefault();
                    const next = e.shiftKey
                        ? items[(i - 1 + items.length) % items.length]
                        : items[(i + 1) % items.length];
                    next.focus();
                }
            }

            document.addEventListener("keydown", onKeyDown, true);
            okBtn.addEventListener("click", submit);
            cancelBtn.addEventListener("click", () => close(null));
            // click pe fundalul blurat = anulare
            overlay.addEventListener("mousedown", (e) => {
                if (e.target === overlay) close(null);
            });
        });

        return pending;
    }


    window.getAccessCode = async function (errorText) {
        const stored = readStored();
        if (stored) return stored;

        const code = await openDialog(errorText);
        if (code) writeStored(code);
        return code;
    };
})();