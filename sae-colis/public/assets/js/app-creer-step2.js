/* ================================================================
   SAE-Colis - Wizard Step 2 (creer-envoi-step2.html)
   REFAIT COMPLÈTEMENT - Version ultra simple et stricte
================================================================ */

ready(function() {
  console.log('Step 2 - Chargement...');

  /* ========== VARIABLES GLOBALES ========== */
  const fmt = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const form = document.getElementById('formStep2');
  const supplier = document.getElementById('supplier');
  const supplierDelay = document.getElementById('supplierDelay');
  const supplierName = document.getElementById('supplierName');
  const supplierEmail = document.getElementById('supplierEmail');
  const supplierPhone = document.getElementById('supplierPhone');
  const otherBlocks = document.querySelectorAll('.supplier-other');

  const articlesBody = document.getElementById('articlesBody');
  const btnAddRow = document.getElementById('btnAddRow');
  const btnClear = document.getElementById('btnClearRows');
  const btnDraft = document.getElementById('btnDraft');

  const elSubtotal = document.getElementById('subtotalHT');
  const elTVA = document.getElementById('totalTVA');
  const elGrand = document.getElementById('grandTotal');

  const pjInput = document.getElementById('pj');
  const filesList = document.getElementById('filesList');
  let attachedFiles = [];

  /* ========== STYLES POUR CHAMPS INVALIDES ========== */
  const style = document.createElement('style');
  style.textContent = `
    .is-invalid {
      border-color: #E5484D !important;
      box-shadow: 0 0 0 3px rgba(229,72,77,.2) inset !important;
      background: #fff8f8 !important;
    }
    #validationError {
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  /* ========== UTILITAIRES ========== */
  function valNum(el, fallback = 0) {
    if (!el) return fallback;
    const v = String(el.value || '').replace(',', '.');
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  /* ========== GESTION DES PIÈCES JOINTES ========== */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function displayFilesList() {
    if (!filesList) return;

    if (attachedFiles.length === 0) {
      filesList.innerHTML = '';
      return;
    }

    let html = '<div style="display: grid; gap: 8px;">';
    attachedFiles.forEach((file, index) => {
      const sizeFormatted = formatFileSize(file.size);
      const fileIcon = file.type.includes('pdf') ? '📄' : '🖼️';

      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <span style="font-size: 20px;">${fileIcon}</span>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 600; color: #1E2A52; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${sizeFormatted}</div>
            </div>
          </div>
          <button type="button" class="btn-danger" onclick="removeFile(${index})" style="padding: 6px 12px; font-size: 12px; white-space: nowrap;">
            Retirer
          </button>
        </div>
      `;
    });
    html += '</div>';

    filesList.innerHTML = html;
  }

  window.removeFile = function(index) {
    attachedFiles.splice(index, 1);
    displayFilesList();
    saveDraft();
  };

  if (pjInput) {
    pjInput.addEventListener('change', function(e) {
      const files = Array.from(e.target.files || []);
      const maxSize = 10 * 1024 * 1024; // 10 Mo

      files.forEach(file => {
        if (file.size > maxSize) {
          alert(`⚠️ Le fichier "${file.name}" dépasse la taille maximale de 10 Mo.`);
          return;
        }

        // Convertir le fichier en base64 pour le stockage
        const reader = new FileReader();
        reader.onload = function(event) {
          attachedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            data: event.target.result
          });
          displayFilesList();
          saveDraft();
        };
        reader.readAsDataURL(file);
      });

      // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
      pjInput.value = '';
    });
  }

  /* ========== CHARGEMENT FOURNISSEURS DEPUIS MANAGER ========== */
  function initFournisseursOptions() {
    if (!supplier) return;

    const fournisseurs = window.FournisseursManager.getActifs();
    const otherOption = supplier.querySelector('option[value="_other"]');

    const existingOptions = supplier.querySelectorAll('option:not(:first-child):not([value="_other"])');
    existingOptions.forEach(opt => opt.remove());

    fournisseurs.forEach(fourn => {
      const option = document.createElement('option');
      option.value = fourn.id;
      option.textContent = fourn.nom;
      option.dataset.fournisseurNom = fourn.nom;
      supplier.insertBefore(option, otherOption);
    });
  }

  if (supplier) {
    initFournisseursOptions();
  }

  function saveCustomSupplier(nom, email, telephone, delai) {
    const result = window.FournisseursManager.ajouter({
      nom,
      email,
      tel: telephone,
      delaiMoyen: delai,
      ajoutePar: 'Agent Butelle Franck'
    });

    if (result.success) {
      initFournisseursOptions();
      supplier.value = result.fournisseur.id;
      updateSupplierOther();
      return true;
    } else {
      alert('⚠️ ' + result.message);
      return false;
    }
  }

  /* ========== AUTO-REMPLISSAGE FOURNISSEUR ========== */
  function autoFillSupplier(fournisseurId) {
    const fournisseur = window.FournisseursManager.getById(fournisseurId);

    if (fournisseur) {
      if (supplierDelay) supplierDelay.value = fournisseur.delaiMoyen || '';
      if (supplierName) supplierName.value = fournisseur.nom || '';
      if (supplierEmail) supplierEmail.value = fournisseur.email || '';
      if (supplierPhone) supplierPhone.value = fournisseur.tel || '';
    } else {
      if (supplierDelay) supplierDelay.value = '';
      if (supplierName) supplierName.value = '';
      if (supplierEmail) supplierEmail.value = '';
      if (supplierPhone) supplierPhone.value = '';
    }
  }

  /* ========== GESTION FOURNISSEUR "AUTRE" ========== */
  function updateSupplierOther() {
    const isOther = supplier && supplier.value === '_other';
    const hasSupplier = supplier && supplier.value && supplier.value !== '';

    [supplierName, supplierEmail, supplierPhone].forEach(inp => {
      if (inp) {
        if (isOther) {
          inp.removeAttribute('readonly');
          inp.style.backgroundColor = '#fff';
          inp.style.cursor = 'text';
        } else {
          inp.setAttribute('readonly', 'readonly');
          inp.style.backgroundColor = '#f5f5f5';
          inp.style.cursor = 'not-allowed';
        }
        inp.classList.remove('is-invalid');
      }
    });

    if (!isOther && hasSupplier) {
      autoFillSupplier(supplier.value);
    } else if (!hasSupplier) {
      if (supplierDelay) supplierDelay.value = '';
      if (supplierName) supplierName.value = '';
      if (supplierEmail) supplierEmail.value = '';
      if (supplierPhone) supplierPhone.value = '';
    } else if (isOther) {
      if (supplierName) supplierName.value = '';
      if (supplierEmail) supplierEmail.value = '';
      if (supplierPhone) supplierPhone.value = '';
    }
  }

  if (supplier) {
    supplier.addEventListener('change', updateSupplierOther);
    updateSupplierOther();
  }

  /* ========== CALCUL DES TOTAUX ========== */
  function recalcAll() {
    let subtotal = 0, tvaTotal = 0;

    const allRows = articlesBody.querySelectorAll('tr');
    allRows.forEach(tr => {
      const qty = valNum(tr.querySelector('.cell-qty'), 0);
      const unit = valNum(tr.querySelector('.cell-unit'), 0);
      const tva = valNum(tr.querySelector('.cell-tva'), 20);

      const lineHT = Math.max(0, qty) * Math.max(0, unit);
      const lineTVA = lineHT * Math.max(0, tva) / 100;

      subtotal += lineHT;
      tvaTotal += lineTVA;

      const tdTotal = tr.querySelector('.cell-total');
      if (tdTotal) {
        tdTotal.dataset.total = (lineHT + lineTVA).toFixed(2);
        tdTotal.textContent = fmt.format(lineHT + lineTVA) + ' €';
      }
    });

    if (elSubtotal) elSubtotal.textContent = fmt.format(subtotal) + ' €';
    if (elTVA) elTVA.textContent = fmt.format(tvaTotal) + ' €';
    if (elGrand) elGrand.textContent = fmt.format(subtotal + tvaTotal) + ' €';
  }

  /* ========== TABLEAU DYNAMIQUE ========== */
  function createRow(item = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="cell-input">
          <input type="text" class="cell-designation" placeholder="Ex: Ordinateur portable" value="${item.designation || ''}" required>
        </div>
      </td>
      <td>
        <div class="cell-input">
          <input type="number" class="cell-qty" min="1" step="1" value="${item.qty ?? 1}" required>
        </div>
      </td>
      <td>
        <div class="cell-input">
          <input type="number" class="cell-unit" min="0" step="0.01" value="${item.unit ?? 0}" required>
        </div>
      </td>
      <td>
        <div class="cell-input">
          <input type="number" class="cell-tva" min="0" step="0.01" value="${item.tva ?? 20}" required>
        </div>
      </td>
      <td class="cell-total">0,00 €</td>
      <td class="row-actions" style="text-align:right; padding-right:16px;">
        <button type="button" class="btn-danger btn-delete-row">Supprimer</button>
      </td>
    `;

    // Attacher les événements
    const inputQty = tr.querySelector('.cell-qty');
    const inputUnit = tr.querySelector('.cell-unit');
    const inputTva = tr.querySelector('.cell-tva');
    const btnDelete = tr.querySelector('.btn-delete-row');

    inputQty.addEventListener('input', recalcAll);
    inputUnit.addEventListener('input', recalcAll);
    inputTva.addEventListener('input', recalcAll);

    // BOUTON SUPPRIMER - Version ultra simple
    btnDelete.addEventListener('click', function() {
      console.log('🗑️ Suppression de la ligne');
      tr.remove();
      recalcAll();
      saveDraft();
    });

    return tr;
  }

  function addRow(item) {
    if (articlesBody) {
      articlesBody.appendChild(createRow(item));
      recalcAll();
    }
  }

  function clearRows() {
    if (articlesBody) {
      articlesBody.innerHTML = '';
      recalcAll();
      saveDraft();
    }
  }

  if (btnAddRow) {
    btnAddRow.addEventListener('click', () => {
      addRow({ qty: 1, unit: 0, tva: 20 });
      console.log('➕ Ligne ajoutée');
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', clearRows);
  }

  /* ========== SAUVEGARDE BROUILLON ========== */
  function serializeArticles() {
    const rows = articlesBody.querySelectorAll('tr');
    const articles = [];

    rows.forEach(tr => {
      const designation = tr.querySelector('.cell-designation')?.value?.trim() || '';
      const qty = valNum(tr.querySelector('.cell-qty'), 0);
      const unit = valNum(tr.querySelector('.cell-unit'), 0);
      const tva = valNum(tr.querySelector('.cell-tva'), 20);

      articles.push({ designation, qty, unit, tva });
    });

    return articles;
  }

  function serializeSupplier() {
    return {
      supplier: supplier?.value || '',
      supplierDelay: supplierDelay?.value || '',
      supplierName: supplierName?.value || '',
      supplierEmail: supplierEmail?.value || '',
      supplierPhone: supplierPhone?.value || '',
    };
  }

  function saveDraft() {
    const data = {
      supplier: serializeSupplier(),
      articles: serializeArticles(),
      piecesJointes: attachedFiles
    };
    localStorage.setItem('sae_envoi_step2', JSON.stringify(data));
  }

  function saveForStep3() {
    // Sauvegarder les articles au format attendu par Step 3
    const articles = serializeArticles();
    const wizardItems = articles.map(art => ({
      name: art.designation,
      qty: art.qty,
      pu: art.unit,
      tva: art.tva
    }));
    localStorage.setItem('wizardItems', JSON.stringify(wizardItems));

    // Sauvegarder le fournisseur au format attendu par Step 3
    const supplierData = serializeSupplier();
    const wizardSupplier = {
      nom: supplierData.supplier === '_other' ? supplierData.supplierName : supplierData.supplier,
      delaiMoyenJours: supplierData.supplierDelay ? parseInt(supplierData.supplierDelay) : 0,
      email: supplierData.supplierEmail || '',
      telephone: supplierData.supplierPhone || ''
    };
    localStorage.setItem('wizardSupplier', JSON.stringify(wizardSupplier));

    // Sauvegarder les pièces jointes
    localStorage.setItem('wizardPiecesJointes', JSON.stringify(attachedFiles));

    // Conserver les données de Step 1 (wizardRequest reste inchangé)
  }

  // Charger brouillon au démarrage
  try {
    const draft = JSON.parse(localStorage.getItem('sae_envoi_step2') || 'null');
    if (draft) {
      // Restaurer fournisseur
      if (draft.supplier && supplier) {
        supplier.value = draft.supplier.supplier || '';
        updateSupplierOther();

        if (supplierDelay) supplierDelay.value = draft.supplier.supplierDelay || '';
        if (supplierName) supplierName.value = draft.supplier.supplierName || '';
        if (supplierEmail) supplierEmail.value = draft.supplier.supplierEmail || '';
        if (supplierPhone) supplierPhone.value = draft.supplier.supplierPhone || '';
      }

      // Restaurer articles
      if (Array.isArray(draft.articles) && draft.articles.length > 0) {
        draft.articles.forEach(addRow);
      } else {
        addRow({ qty: 1, unit: 0, tva: 20 });
      }

      // Restaurer pièces jointes
      if (Array.isArray(draft.piecesJointes) && draft.piecesJointes.length > 0) {
        attachedFiles = draft.piecesJointes;
        displayFilesList();
      }
    } else {
      addRow({ qty: 1, unit: 0, tva: 20 });
    }
  } catch (e) {
    console.warn('Erreur chargement brouillon:', e);
    addRow({ qty: 1, unit: 0, tva: 20 });
  }

  recalcAll();

  /* ========== BOUTON BROUILLON ========== */
  if (btnDraft) {
    btnDraft.addEventListener('click', () => {
      saveDraft();
      // Message de succès
      const msg = document.createElement('div');
      msg.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #2BAE66; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 9999;
      `;
      msg.textContent = '✅ Brouillon enregistré';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);
    });
  }

  /* ========== MESSAGE D'ERREUR ========== */
  function showError(errors) {
    // Supprimer ancien message si existe
    const old = document.getElementById('validationError');
    if (old) old.remove();

    // Créer nouveau message
    const errorBox = document.createElement('div');
    errorBox.id = 'validationError';
    errorBox.style.cssText = `
      background: #fee;
      border: 2px solid #E5484D;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
      color: #c92a2a;
      font-weight: 600;
    `;

    let html = '<div style="font-size: 20px; margin-bottom: 8px;">⚠️ Erreur de validation</div>';
    html += '<div style="font-size: 14px; line-height: 1.6;">';
    html += 'Merci de corriger les erreurs suivantes :<ul style="margin: 8px 0; padding-left: 20px;">';

    errors.forEach(err => {
      html += `<li>${err}</li>`;
    });

    html += '</ul></div>';
    errorBox.innerHTML = html;

    // Insérer avant le formulaire
    form.parentNode.insertBefore(errorBox, form);

    // Scroll vers le message
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideError() {
    const errorBox = document.getElementById('validationError');
    if (errorBox) errorBox.remove();
  }

  /* ========== VALIDATION STRICTE ========== */
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('🔍 Validation du formulaire...');

      hideError();

      // Nettoyer toutes les classes invalid
      document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

      const errors = [];

      // 1. FOURNISSEUR OBLIGATOIRE
      if (!supplier || !supplier.value || supplier.value === '') {
        supplier?.classList.add('is-invalid');
        errors.push('Le fournisseur est obligatoire');
      } else if (supplier.value === '_other') {
        // Si "Autre", vérifier nom, email, téléphone
        if (!supplierName || !supplierName.value.trim()) {
          supplierName?.classList.add('is-invalid');
          errors.push('Le nom du fournisseur est obligatoire (Autre)');
        }
        if (!supplierEmail || !supplierEmail.value.trim()) {
          supplierEmail?.classList.add('is-invalid');
          errors.push("L'email du fournisseur est obligatoire (Autre)");
        }
        if (!supplierPhone || !supplierPhone.value.trim()) {
          supplierPhone?.classList.add('is-invalid');
          errors.push('Le téléphone du fournisseur est obligatoire (Autre)');
        }
      }

      // Note: supplierDelay est OPTIONNEL - on ne le valide pas

      // 2. ARTICLES - AU MOINS 1 OBLIGATOIRE
      const allRows = articlesBody.querySelectorAll('tr');

      if (allRows.length === 0) {
        errors.push('Vous devez ajouter au moins un article');
      } else {
        // Vérifier chaque ligne
        let articlesValides = 0;

        allRows.forEach((tr, index) => {
          const designation = tr.querySelector('.cell-designation');
          const qty = tr.querySelector('.cell-qty');
          const unit = tr.querySelector('.cell-unit');
          const tva = tr.querySelector('.cell-tva');

          let ligneValide = true;

          // Désignation obligatoire
          if (!designation || !designation.value.trim()) {
            designation?.classList.add('is-invalid');
            errors.push(`Article ${index + 1} : La désignation est obligatoire`);
            ligneValide = false;
          }

          // Quantité obligatoire et > 0
          const qtyVal = valNum(qty, 0);
          if (!qty || !qty.value || qtyVal <= 0) {
            qty?.classList.add('is-invalid');
            errors.push(`Article ${index + 1} : La quantité doit être supérieure à 0`);
            ligneValide = false;
          }

          // Prix unitaire obligatoire et >= 0
          const unitVal = valNum(unit, -1);
          if (!unit || !unit.value || unitVal < 0) {
            unit?.classList.add('is-invalid');
            errors.push(`Article ${index + 1} : Le prix unitaire est obligatoire`);
            ligneValide = false;
          }

          // TVA obligatoire et >= 0
          const tvaVal = valNum(tva, -1);
          if (!tva || !tva.value || tvaVal < 0) {
            tva?.classList.add('is-invalid');
            errors.push(`Article ${index + 1} : La TVA est obligatoire`);
            ligneValide = false;
          }

          if (ligneValide) articlesValides++;
        });

        if (articlesValides === 0) {
          errors.push('Au moins un article doit être complètement rempli');
        }
      }

      // SI DES ERREURS => AFFICHER ET BLOQUER
      if (errors.length > 0) {
        console.log('❌ Validation échouée:', errors.length, 'erreurs');
        showError(errors);
        return false; // BLOQUE LA NAVIGATION
      }

      // ✅ TOUT EST OK => SAUVEGARDER ET REDIRIGER
      console.log('✅ Validation réussie !');

      // Si "Autre" sélectionné, sauvegarder le nouveau fournisseur
      if (supplier.value === '_other') {
        const nom = supplierName.value.trim();
        const email = supplierEmail.value.trim();
        const telephone = supplierPhone.value.trim();
        const delai = parseInt(supplierDelay.value) || 0;

        saveCustomSupplier(nom, email, telephone, delai);
      }

      saveDraft();
      saveForStep3();
      window.location.href = 'creer-envoi-step3.html';
    });
  }

  /* ========== SCROLL HORIZONTAL TABLEAU (BONUS) ========== */
  const articlesWrap = document.querySelector('.articlesWrap');
  if (articlesWrap) {
    articlesWrap.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        articlesWrap.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }

  console.log('✅ Step 2 chargé avec succès');
});
