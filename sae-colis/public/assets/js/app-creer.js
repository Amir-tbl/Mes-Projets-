/* ================================================================
   SAE-Colis - Wizard Step 1 (creer-envoi.html)
   Validation formulaire, gestion brouillon, navigation vers Step 2
================================================================ */

ready(function() {
  /* ------- Wizard Étape 1 : Validation & Draft ------- */
  const form = document.getElementById('formStep1');
  const btnDraft = document.getElementById('btnDraft');
  const btnCancel = document.getElementById('btnCancel');

  try {
    const draft = JSON.parse(localStorage.getItem('sae_envoi_step1') || 'null');
    if (draft) {
      for (const [k, v] of Object.entries(draft)) {
        const el = document.getElementById(k);
        if (!el) continue;
        if (el.type === 'file') continue;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'INPUT') {
          el.value = v;
        }
      }
    }
  } catch (e) {
    console.warn('[Step 1] Erreur lors du chargement du brouillon:', e);
  }

  function serializeForm() {
    const data = {};
    ['demandeur', 'departement', 'titre', 'description', 'budget', 'dateSouhaitee', 'lieu'].forEach(id => {
      const el = document.getElementById(id);
      if (el) data[id] = el.value.trim();
    });
    return data;
  }

  function validateForm() {
    const requiredIds = ['departement', 'titre', 'description', 'budget', 'dateSouhaitee', 'lieu'];
    let valid = true;

    requiredIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const ok = el.value && el.value.trim() !== '';
      el.classList.toggle('is-invalid', !ok);

      if (!ok) valid = false;
    });

    const b = document.getElementById('budget');
    if (b && (Number.isNaN(+b.value) || +b.value < 0)) {
      b.classList.add('is-invalid');
      valid = false;
    }

    return valid;
  }

  const style = document.createElement('style');
  style.textContent = `
    .page-wizard .wizard-form .is-invalid {
      border-color: #E5484D !important;
      box-shadow: 0 0 0 2px rgba(229,72,77,.12) inset;
    }
  `;
  document.head.appendChild(style);

  if (btnDraft) {
    btnDraft.addEventListener('click', () => {
      const payload = serializeForm();
      localStorage.setItem('sae_envoi_step1', JSON.stringify(payload));
      alert('Brouillon enregistré ✅');
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (confirm('Annuler la création et revenir au tableau de bord ?')) {
        window.location.href = 'index.html';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        alert('Merci de compléter les champs requis.');
        return;
      }

      const payload = serializeForm();
      localStorage.setItem('sae_envoi_step1', JSON.stringify(payload));
      window.location.href = 'creer-envoi-step2.html';
    });
  }
});
