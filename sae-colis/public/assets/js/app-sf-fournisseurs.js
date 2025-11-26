/* ================================================================
   SAE-Colis - Page Gestion Fournisseurs SF
   CRUD fournisseurs + statistiques (utilise FournisseursManager)
================================================================ */

ready(function() {
  console.log('Page Gestion Fournisseurs - Chargement...');

  /* ========== UTILISATION FOURNISSEURS MANAGER ========== */
  let fournisseurSelectionne = null;
  let modeEdition = false;

  /* ========== CHARGEMENT KPI ========== */
  function updateKPI() {
    const fournisseurs = window.FournisseursManager.getAll();
    const total = fournisseurs.length;
    const actifs = fournisseurs.filter(f => f.statut === 'actif').length;

    // Calcul du nombre de commandes et délai moyen
    const commandes = window.FournisseursManager.getCommandesHistory();
    const commandesMois = commandes.length; // TODO: filtrer par mois
    const delaiMoyen = fournisseurs.length > 0
      ? (fournisseurs.reduce((sum, f) => sum + (f.delaiMoyen || 0), 0) / total).toFixed(1)
      : 0;

    document.getElementById('kpiTotalFourn').textContent = total;
    document.getElementById('kpiActifs').textContent = actifs;
    document.getElementById('kpiCommandesMois').textContent = commandesMois;
    document.getElementById('kpiDelaiMoyen').textContent = delaiMoyen + ' j';
  }

  /* ========== CHARGEMENT TABLEAU ========== */
  function loadTableau() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const fournisseurs = window.FournisseursManager.getAll();

    if (fournisseurs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#999;">Aucun fournisseur enregistré</td></tr>';
      return;
    }

    fournisseurs.forEach(fourn => {
      const tr = document.createElement('tr');
      if (fourn.statut === 'inactif') {
        tr.style.opacity = '0.6';
      }

      // Calculer les stats depuis le manager
      const stats = window.FournisseursManager.getStatsFournisseur(fourn.id);

      tr.innerHTML = `
        <td><strong>${fourn.nom}</strong>${fourn.type === 'custom' ? ' <span style="color: #2BAE66; font-size: 11px;">●</span>' : ''}</td>
        <td>${fourn.email}</td>
        <td>${fourn.tel || '—'}</td>
        <td style="text-align:center;">${stats.nbCommandes || 0}</td>
        <td style="text-align:center;">${fourn.delaiMoyen || 0}j</td>
        <td><strong>${formatEuro(stats.montantTotal || 0)}</strong></td>
        <td><span class="badge ${fourn.statut === 'actif' ? 'b-green' : 'b-grey'}">${fourn.statut === 'actif' ? 'Actif' : 'Inactif'}</span></td>
        <td style="text-align:right; padding-right:16px;">
          <button class="btn-ghost btn-sm" data-id="${fourn.id}" data-action="details">Détails</button>
          <button class="btn-ghost btn-sm" data-id="${fourn.id}" data-action="modifier" style="margin-left:4px;">Modifier</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Événements
    tbody.querySelectorAll('.btn-sm').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        const action = this.getAttribute('data-action');
        if (action === 'details') {
          ouvrirModalDetails(id);
        } else if (action === 'modifier') {
          modifierFournisseur(id);
        }
      });
    });

    updateKPI();
  }

  /* ========== RECHERCHE ========== */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const rows = document.querySelectorAll('#tableBody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  /* ========== MODAL AJOUTER/MODIFIER ========== */
  function ouvrirModalAjout() {
    modeEdition = false;
    fournisseurSelectionne = null;

    document.getElementById('modalTitle').textContent = 'Ajouter un fournisseur';
    document.getElementById('formFournisseur').reset();
    document.getElementById('modalFournisseur').removeAttribute('hidden');
  }

  function modifierFournisseur(id) {
    modeEdition = true;
    fournisseurSelectionne = window.FournisseursManager.getById(id);
    if (!fournisseurSelectionne) return;

    document.getElementById('modalTitle').textContent = 'Modifier le fournisseur';
    document.getElementById('fournNom').value = fournisseurSelectionne.nom;
    document.getElementById('fournEmail').value = fournisseurSelectionne.email;
    document.getElementById('fournTel').value = fournisseurSelectionne.tel || '';
    document.getElementById('fournAdresse').value = fournisseurSelectionne.adresse || '';
    document.getElementById('fournDelai').value = fournisseurSelectionne.delaiMoyen || '';
    document.getElementById('fournStatut').value = fournisseurSelectionne.statut;
    document.getElementById('fournNotes').value = fournisseurSelectionne.notes || '';

    document.getElementById('modalFournisseur').removeAttribute('hidden');
  }

  function fermerModalAjout() {
    document.getElementById('modalFournisseur').setAttribute('hidden', '');
    document.getElementById('formFournisseur').reset();
    fournisseurSelectionne = null;
    modeEdition = false;
  }

  document.getElementById('btnAjouterFournisseur').addEventListener('click', ouvrirModalAjout);
  document.getElementById('btnCloseModal').addEventListener('click', fermerModalAjout);
  document.getElementById('btnAnnuler').addEventListener('click', fermerModalAjout);

  document.getElementById('btnSauvegarder').addEventListener('click', () => {
    const form = document.getElementById('formFournisseur');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      nom: document.getElementById('fournNom').value,
      email: document.getElementById('fournEmail').value,
      tel: document.getElementById('fournTel').value,
      adresse: document.getElementById('fournAdresse').value,
      delaiMoyen: parseInt(document.getElementById('fournDelai').value) || 0,
      statut: document.getElementById('fournStatut').value,
      notes: document.getElementById('fournNotes').value,
      ajoutePar: 'SF Marie Dubois' // TODO: utilisateur réel
    };

    let result;
    if (modeEdition && fournisseurSelectionne) {
      // Modifier
      result = window.FournisseursManager.modifier(fournisseurSelectionne.id, data);
      if (result.success) {
        showToast('✅ Fournisseur modifié avec succès', 'success');
      }
    } else {
      // Ajouter
      result = window.FournisseursManager.ajouter(data);
      if (result.success) {
        showToast('✅ Fournisseur ajouté avec succès', 'success');
      } else {
        showToast('⚠️ ' + result.message, 'error');
      }
    }

    if (result.success) {
      fermerModalAjout();
      loadTableau();
    }
  });

  /* ========== MODAL DÉTAILS ========== */
  function ouvrirModalDetails(id) {
    fournisseurSelectionne = window.FournisseursManager.getById(id);
    if (!fournisseurSelectionne) return;

    document.getElementById('modalDetailsTitle').textContent = fournisseurSelectionne.nom;

    const detailsHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Email</div>
          <div style="font-weight: 600;">${fournisseurSelectionne.email}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Téléphone</div>
          <div style="font-weight: 600;">${fournisseurSelectionne.tel || '—'}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Adresse</div>
          <div style="font-weight: 600;">${fournisseurSelectionne.adresse || '—'}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Type</div>
          <span class="badge ${fournisseurSelectionne.type === 'predefined' ? 'b-blue' : 'b-green'}">${fournisseurSelectionne.type === 'predefined' ? 'Prédéfini' : 'Ajouté par ' + (fournisseurSelectionne.ajoutePar || 'Agent')}</span>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Statut</div>
          <span class="badge ${fournisseurSelectionne.statut === 'actif' ? 'b-green' : 'b-grey'}">${fournisseurSelectionne.statut === 'actif' ? 'Actif' : 'Inactif'}</span>
        </div>
      </div>
      ${fournisseurSelectionne.notes ? `
        <div style="margin-top: 16px; padding: 12px; background: #fffbea; border-left: 3px solid #fbbf24; border-radius: 4px;">
          <strong>Notes:</strong> ${fournisseurSelectionne.notes}
        </div>
      ` : ''}
    `;

    document.getElementById('fournisseurDetails').innerHTML = detailsHTML;

    // Stats depuis le manager
    const stats = window.FournisseursManager.getStatsFournisseur(fournisseurSelectionne.id);
    document.getElementById('detailNbCmd').textContent = stats.nbCommandes || 0;
    document.getElementById('detailMontant').textContent = formatEuro(stats.montantTotal || 0);
    document.getElementById('detailDelai').textContent = (stats.delaiMoyen || 0) + ' j';
    document.getElementById('detailTaux').textContent = (stats.tauxLivraison || 0) + '%';

    // Dernières commandes
    let commandesHTML = '';
    if (stats.dernieresCommandes && stats.dernieresCommandes.length > 0) {
      commandesHTML = '<ul style="list-style: none; padding: 0; margin: 0;">';
      stats.dernieresCommandes.forEach(cmd => {
        commandesHTML += `
          <li style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${cmd.numero || cmd.numeroCommande}</strong>
              <div style="font-size: 14px; color: #666;">${formatDate(cmd.date || cmd.dateCommande)}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600;">${formatEuro(cmd.montant || cmd.montantTTC)}</div>
              <div style="font-size: 14px; color: #666;">${cmd.statut}</div>
            </div>
          </li>
        `;
      });
      commandesHTML += '</ul>';
    } else {
      commandesHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucune commande récente</p>';
    }
    document.getElementById('dernieresCommandes').innerHTML = commandesHTML;

    document.getElementById('modalDetails').removeAttribute('hidden');
  }

  function fermerModalDetails() {
    document.getElementById('modalDetails').setAttribute('hidden', '');
    fournisseurSelectionne = null;
  }

  document.getElementById('btnCloseDetails').addEventListener('click', fermerModalDetails);
  document.getElementById('btnFermerDetails').addEventListener('click', fermerModalDetails);

  document.getElementById('btnModifierDetails').addEventListener('click', () => {
    if (!fournisseurSelectionne) return;
    fermerModalDetails();
    modifierFournisseur(fournisseurSelectionne.id);
  });

  /* ========== HELPERS ========== */
  function formatEuro(montant) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(montant);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${type === 'success' ? '#2BAE66' : '#EF4444'};
      color: white; padding: 16px 24px; border-radius: 8px;
      font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,.3);
      z-index: 9999; animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ========== CHARGEMENT INITIAL ========== */
  loadTableau();

  console.log('✅ Page Gestion Fournisseurs chargée avec succès');
});
