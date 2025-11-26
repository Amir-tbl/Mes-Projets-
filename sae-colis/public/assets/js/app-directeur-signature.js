/* ================================================================
   SAE-Colis - Page Signature des BC (Directeur)
   Lister les BC en attente, afficher détails, signer
================================================================ */

const formatEuro = (n) => new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n ?? 0);
const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

let bcEnAttente = [];
let bcFiltres = [];
let bcSelectionne = null;

/* ========== RÉCUPÉRER LES BC ========== */
function getBCEnAttenteSignature() {
  if (!window.CommandesManager) return [];
  return window.CommandesManager.getByStatut('en_attente_signature');
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const total = bcFiltres.length;
  const urgents = bcFiltres.filter(bc => bc.urgence || bc.prioritaire).length;
  const montantTotal = bcFiltres.reduce((sum, bc) => sum + (bc.montantTTC || 0), 0);

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiUrgent').textContent = urgents;
  document.getElementById('kpiMontantTotal').textContent = formatEuro(montantTotal);
}

/* ========== AFFICHER LE TABLEAU ========== */
function afficherTableau() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (bcFiltres.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #94a3b8;">
          ✅ Aucun BC en attente de signature
        </td>
      </tr>
    `;
    return;
  }

  bcFiltres.forEach(bc => {
    const dateValidation = bc.dateValidation || bc.dateCreation;
    const dateValid = new Date(dateValidation);
    const aujourdhui = new Date();
    const joursAttente = Math.ceil((aujourdhui - dateValid) / (1000 * 60 * 60 * 24));

    const tr = document.createElement('tr');
    if (bc.urgence || bc.prioritaire) {
      tr.style.background = '#fef2f2';
    }

    const nbPJ = bc.piecesJointes?.length || 0;

    tr.innerHTML = `
      <td><strong>${bc.numeroCommande}</strong>${(bc.urgence || bc.prioritaire) ? ' <span style="color: #dc2626;">🔴</span>' : ''}</td>
      <td>${bc.demandeur?.nom || '—'}</td>
      <td>${bc.demandeur?.departement || '—'}</td>
      <td>${bc.fournisseur?.nom || '—'}</td>
      <td><strong>${formatEuro(bc.montantTTC)}</strong></td>
      <td>${formatDateFR(dateValidation)}</td>
      <td>${joursAttente} j</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td style="text-align: right; padding-right: 16px;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-sm btn-ghost" onclick="afficherDetails(${bc.id})">
            👁️ Voir
          </button>
          <button class="btn btn-sm" onclick="ouvrirModalSignature(${bc.id})">
            ✍️ Signer
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== FILTRES ========== */
function appliquerFiltres() {
  const filterDept = document.getElementById('filterDepartement')?.value || '';
  const filterMontant = document.getElementById('filterMontant')?.value || '';
  const filterUrgence = document.getElementById('filterUrgence')?.value || '';
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  bcFiltres = bcEnAttente.filter(bc => {
    // Filtre département
    if (filterDept && bc.demandeur?.departement !== filterDept) return false;

    // Filtre montant
    if (filterMontant) {
      const montant = bc.montantTTC || 0;
      if (filterMontant === '0-1000' && (montant < 0 || montant > 1000)) return false;
      if (filterMontant === '1000-5000' && (montant < 1000 || montant > 5000)) return false;
      if (filterMontant === '5000-10000' && (montant < 5000 || montant > 10000)) return false;
      if (filterMontant === '10000+' && montant < 10000) return false;
    }

    // Filtre urgence
    if (filterUrgence) {
      const estUrgent = bc.urgence || bc.prioritaire;
      if (filterUrgence === 'true' && !estUrgent) return false;
      if (filterUrgence === 'false' && estUrgent) return false;
    }

    // Recherche
    if (searchQuery) {
      const searchableText = `
        ${bc.numeroCommande}
        ${bc.demandeur?.nom || ''}
        ${bc.demandeur?.departement || ''}
        ${bc.fournisseur?.nom || ''}
      `.toLowerCase();
      if (!searchableText.includes(searchQuery)) return false;
    }

    return true;
  });

  afficherKPIs();
  afficherTableau();
}

function initialiserFiltres() {
  ['filterDepartement', 'filterMontant', 'filterUrgence'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', appliquerFiltres);
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', appliquerFiltres);
  }

  const btnReset = document.getElementById('btnResetFilters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      ['filterDepartement', 'filterMontant', 'filterUrgence'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      if (searchInput) searchInput.value = '';
      appliquerFiltres();
    });
  }
}

/* ========== AFFICHER DÉTAILS (lecture seule) ========== */
window.afficherDetails = function(bcId) {
  const bc = bcEnAttente.find(b => b.id === bcId);
  if (!bc) return;

  // Réutiliser le modal de signature mais en mode lecture seule
  bcSelectionne = bc;
  remplirModalDetails(bc, true);
  document.getElementById('modalSignature').removeAttribute('hidden');
};

/* ========== OUVRIR MODAL DE SIGNATURE ========== */
window.ouvrirModalSignature = function(bcId) {
  const bc = bcEnAttente.find(b => b.id === bcId);
  if (!bc) return;

  bcSelectionne = bc;
  remplirModalDetails(bc, false);
  document.getElementById('modalSignature').removeAttribute('hidden');
};

/* ========== REMPLIR MODAL DÉTAILS ========== */
function remplirModalDetails(bc, lectureSeule = false) {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBCDetails');
  const btnSigner = document.getElementById('btnSigner');

  if (lectureSeule) {
    modalTitle.textContent = 'Détails du bon de commande';
    if (btnSigner) btnSigner.style.display = 'none';
  } else {
    modalTitle.textContent = 'Signer le bon de commande';
    if (btnSigner) btnSigner.style.display = 'inline-block';
  }

  // Description (si présente)
  const descriptionHTML = bc.description ? `
    <div style="margin-bottom: 16px; padding: 16px; background: #fffbea; border-left: 4px solid #fbbf24; border-radius: 4px;">
      <div style="font-weight: 600; margin-bottom: 8px; color: #1E2A52;">📝 Description de la commande</div>
      <div style="color: #666; white-space: pre-wrap;">${bc.description}</div>
    </div>
  ` : '';

  // Articles
  let articlesHTML = '';
  if (bc.articles && bc.articles.length > 0) {
    articlesHTML = `
      <div style="margin-top: 16px;">
        <h4 style="margin: 0 0 12px 0; color: #1E2A52;">Articles commandés</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 8px; text-align: left; font-size: 13px;">Désignation</th>
              <th style="padding: 8px; text-align: center; font-size: 13px; width: 80px;">Qté</th>
              <th style="padding: 8px; text-align: right; font-size: 13px; width: 100px;">PU</th>
              <th style="padding: 8px; text-align: right; font-size: 13px; width: 80px;">TVA</th>
              <th style="padding: 8px; text-align: right; font-size: 13px; width: 120px;">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${bc.articles.map(art => {
              const prixUnit = art.prixUnitaire || art.prixUnit || 0;
              const totalTTC = art.totalTTC || (art.quantite * prixUnit * (1 + art.tva / 100));
              return `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; font-size: 13px;">${art.designation}</td>
                <td style="padding: 8px; text-align: center; font-size: 13px;">${art.quantite}</td>
                <td style="padding: 8px; text-align: right; font-size: 13px;">${formatEuro(prixUnit)}</td>
                <td style="padding: 8px; text-align: right; font-size: 13px;">${art.tva}%</td>
                <td style="padding: 8px; text-align: right; font-size: 13px;"><strong>${formatEuro(totalTTC)}</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Pièces jointes de la demande initiale
  let piecesJointesHTML = '';
  if (bc.piecesJointes && bc.piecesJointes.length > 0) {
    piecesJointesHTML = `
      <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📎 Pièces jointes de la demande</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${bc.piecesJointes.map(pj => {
            const iconePJ = pj.type === 'pdf' ? '📄' : pj.type === 'image' ? '🖼️' : '📎';
            return `
              <a href="${pj.url}" target="_blank"
                 style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: white; border-radius: 6px; text-decoration: none; color: #1E2A52; border: 1px solid #e2e8f0; transition: all 0.2s ease;"
                 onmouseover="this.style.background='#fef3c7'; this.style.borderColor='#667eea';"
                 onmouseout="this.style.background='white'; this.style.borderColor='#e2e8f0';">
                <span style="font-size: 24px;">${iconePJ}</span>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 14px;">${pj.nom}</div>
                  <div style="font-size: 12px; color: #64748b;">${pj.taille}</div>
                </div>
                <span style="color: #667eea; font-size: 12px;">↗ Ouvrir</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Bon de commande généré par le SF
  let bonCommandeHTML = '';
  if (bc.bonCommande) {
    bonCommandeHTML = `
      <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border: 2px solid #fbbf24;">
        <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">📋 Bon de commande à signer</h4>
        <a href="${bc.bonCommande.url}" target="_blank"
           style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: white; border-radius: 6px; text-decoration: none; color: #1E2A52; border: 1px solid #fbbf24; transition: all 0.2s ease;"
           onmouseover="this.style.background='#fef3c7'; this.style.borderColor='#f59e0b';"
           onmouseout="this.style.background='white'; this.style.borderColor='#fbbf24';">
          <span style="font-size: 28px;">📋</span>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px;">${bc.bonCommande.fichier}</div>
            <div style="font-size: 12px; color: #64748b;">Généré le ${formatDateFR(bc.bonCommande.dateGeneration)} par le Service Financier</div>
          </div>
          <span style="color: #f59e0b; font-size: 12px;">↗ Visualiser le BC</span>
        </a>
      </div>
    `;
  }

  modalBody.innerHTML = `
    ${descriptionHTML}

    <div style="display: grid; gap: 12px; font-size: 14px;">
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">N° BC :</span>
        <span style="color: #1E2A52;"><strong>${bc.numeroCommande}</strong></span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Demandeur :</span>
        <span style="color: #1E2A52;">${bc.demandeur?.nom || '—'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Département :</span>
        <span style="color: #1E2A52;">${bc.demandeur?.departement || '—'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Email :</span>
        <span style="color: #1E2A52;">${bc.demandeur?.email || '—'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Fournisseur :</span>
        <span style="color: #1E2A52;">${bc.fournisseur?.nom || '—'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Date commande :</span>
        <span style="color: #1E2A52;">${formatDateFR(bc.dateCommande)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Date validation SF :</span>
        <span style="color: #1E2A52;">${formatDateFR(bc.dateValidation)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Montant HT :</span>
        <span style="color: #1E2A52;">${formatEuro(bc.montantHT)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">TVA :</span>
        <span style="color: #1E2A52;">${formatEuro(bc.montantTVA)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0;">
        <span style="font-weight: 600; color: #64748b;">Montant TTC :</span>
        <span style="color: #1E2A52; font-size: 18px;"><strong>${formatEuro(bc.montantTTC)}</strong></span>
      </div>
    </div>

    ${articlesHTML}
    ${piecesJointesHTML}
    ${bonCommandeHTML}
  `;
}

/* ========== SIGNER LE BC ========== */
function signerBC() {
  if (!bcSelectionne) return;

  const commentaire = document.getElementById('commentaireSignature')?.value || '';

  // Mettre à jour le statut via CommandesManager
  const result = window.CommandesManager.updateStatut(
    bcSelectionne.id,
    'signee',
    {
      utilisateur: 'Directeur Laurent Petit',
      commentaire: commentaire || 'BC signé par le Directeur'
    }
  );

  if (result.success) {
    // Ajouter les infos de signature
    const commandes = window.CommandesManager.getAll();
    const index = commandes.findIndex(c => c.id === bcSelectionne.id);
    if (index !== -1) {
      commandes[index].dateSignature = new Date().toISOString().split('T')[0];
      commandes[index].signePar = 'Dr. Laurent Petit';
      commandes[index].signataire = {
        nom: 'Dr. Laurent Petit',
        fonction: 'Directeur IUT Villetaneuse',
        date: new Date().toISOString()
      };
      localStorage.setItem('sae_colis_commandes', JSON.stringify(commandes));
    }

    // Afficher message de succès
    alert(`✅ Bon de commande ${bcSelectionne.numeroCommande} signé avec succès!\n\nLe BC est maintenant prêt à être envoyé au fournisseur par le Service Financier.`);

    // Fermer le modal
    fermerModal();

    // Recharger les données
    chargerDonnees();
  } else {
    alert('❌ Erreur lors de la signature. Veuillez réessayer.');
  }
}

/* ========== FERMER MODAL ========== */
function fermerModal() {
  const modal = document.getElementById('modalSignature');
  if (modal) modal.setAttribute('hidden', '');
  bcSelectionne = null;

  const commentaire = document.getElementById('commentaireSignature');
  if (commentaire) commentaire.value = '';
}

/* ========== CHARGER DONNÉES ========== */
function chargerDonnees() {
  bcEnAttente = getBCEnAttenteSignature();
  bcFiltres = [...bcEnAttente];
  afficherKPIs();
  afficherTableau();
}

/* ========== INITIALISATION ========== */
ready(function() {
  chargerDonnees();
  initialiserFiltres();

  // Gestion du modal
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', fermerModal);
  }

  const btnAnnuler = document.getElementById('btnAnnuler');
  if (btnAnnuler) {
    btnAnnuler.addEventListener('click', fermerModal);
  }

  const btnSigner = document.getElementById('btnSigner');
  if (btnSigner) {
    btnSigner.addEventListener('click', signerBC);
  }

  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', fermerModal);
  }
});
