/* ================================================================
   SAE-Colis - Historique signatures (Directeur)
   Afficher tous les BC signés (lecture seule)
================================================================ */

const formatEuro = (n) => new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n ?? 0);
const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

let bcSignes = [];
let bcFiltres = [];
let bcSelectionne = null;

/* ========== RÉCUPÉRER LES BC SIGNÉS ========== */
function getBCSignes() {
  if (!window.CommandesManager) return [];
  const commandes = window.CommandesManager.getAll();
  return commandes.filter(c => c.dateSignature); // BC déjà signés
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const total = bcFiltres.length;

  const aujourdhui = new Date();
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  const mois = bcFiltres.filter(bc => {
    const dateSign = new Date(bc.dateSignature);
    return dateSign >= debutMois;
  }).length;

  const montantTotal = bcFiltres.reduce((sum, bc) => sum + (bc.montantTTC || 0), 0);

  // Calculer délai moyen
  let delaiMoyen = 0;
  if (bcFiltres.length > 0) {
    const delais = bcFiltres.map(bc => {
      const dateValidation = new Date(bc.dateValidation || bc.dateCreation);
      const dateSignature = new Date(bc.dateSignature);
      return Math.ceil((dateSignature - dateValidation) / (1000 * 60 * 60 * 24));
    });
    delaiMoyen = Math.round(delais.reduce((sum, d) => sum + d, 0) / delais.length * 10) / 10;
  }

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiMois').textContent = mois;
  document.getElementById('kpiMontantTotal').textContent = formatEuro(montantTotal);
  document.getElementById('kpiDelaiMoyen').textContent = delaiMoyen ? `${delaiMoyen} j` : '0 j';
}

/* ========== AFFICHER LE TABLEAU ========== */
function afficherTableau() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (bcFiltres.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #94a3b8;">
          Aucun BC signé trouvé
        </td>
      </tr>
    `;
    return;
  }

  // Trier par date de signature (plus récent en premier)
  bcFiltres.sort((a, b) => {
    const dateA = new Date(a.dateSignature);
    const dateB = new Date(b.dateSignature);
    return dateB - dateA;
  });

  bcFiltres.forEach(bc => {
    const dateValidation = new Date(bc.dateValidation || bc.dateCreation);
    const dateSignature = new Date(bc.dateSignature);
    const delaiSignature = Math.ceil((dateSignature - dateValidation) / (1000 * 60 * 60 * 24));

    // Déterminer le statut actuel
    const statutMap = {
      'signee': { label: 'Signée', color: '#3b82f6' },
      'bc_envoye': { label: 'BC envoyé', color: '#8b5cf6' },
      'expediee': { label: 'Expédiée', color: '#f59e0b' },
      'recue_iut': { label: 'Reçue IUT', color: '#06b6d4' },
      'livree': { label: 'Livrée', color: '#10b981' },
      'payee': { label: 'Payée', color: '#2BAE66' }
    };
    const statut = statutMap[bc.statut] || { label: bc.statutLabel || bc.statut, color: '#64748b' };

    const nbPJ = bc.piecesJointes?.length || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${bc.numeroCommande}</strong></td>
      <td>${bc.demandeur?.nom || '—'}</td>
      <td>${bc.demandeur?.departement || '—'}</td>
      <td>${bc.fournisseur?.nom || '—'}</td>
      <td><strong>${formatEuro(bc.montantTTC)}</strong></td>
      <td>${formatDateFR(bc.dateSignature)}</td>
      <td>${delaiSignature} j</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td>
        <span style="display: inline-block; padding: 4px 8px; background: ${statut.color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
          ${statut.label}
        </span>
      </td>
      <td style="text-align: right; padding-right: 16px;">
        <button class="btn btn-sm btn-ghost" onclick="afficherDetails(${bc.id})">
          👁️ Voir détails
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== FILTRES ========== */
function appliquerFiltres() {
  const filterPeriode = document.getElementById('filterPeriode')?.value || 'all';
  const filterDept = document.getElementById('filterDepartement')?.value || '';
  const filterStatut = document.getElementById('filterStatut')?.value || '';
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  const aujourdhui = new Date();
  const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
  const debutSemaine = new Date(aujourdhui);
  debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay() + 1);
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
  const debutAnnee = new Date(aujourdhui.getFullYear(), 0, 1);

  bcFiltres = bcSignes.filter(bc => {
    // Filtre période
    if (filterPeriode !== 'all') {
      const dateSign = new Date(bc.dateSignature);
      if (filterPeriode === 'today' && dateSign < debutJour) return false;
      if (filterPeriode === 'week' && dateSign < debutSemaine) return false;
      if (filterPeriode === 'month' && dateSign < debutMois) return false;
      if (filterPeriode === 'year' && dateSign < debutAnnee) return false;
    }

    // Filtre département
    if (filterDept && bc.demandeur?.departement !== filterDept) return false;

    // Filtre statut
    if (filterStatut && bc.statut !== filterStatut) return false;

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
  ['filterPeriode', 'filterDepartement', 'filterStatut'].forEach(id => {
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
      document.getElementById('filterPeriode').value = 'all';
      ['filterDepartement', 'filterStatut'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      if (searchInput) searchInput.value = '';
      appliquerFiltres();
    });
  }
}

/* ========== AFFICHER DÉTAILS ========== */
window.afficherDetails = function(bcId) {
  const bc = bcSignes.find(b => b.id === bcId);
  if (!bc) return;

  bcSelectionne = bc;
  remplirModalDetails(bc);
  document.getElementById('modalDetails').removeAttribute('hidden');
};

/* ========== REMPLIR MODAL DÉTAILS ========== */
function remplirModalDetails(bc) {
  const modalBody = document.getElementById('modalBCDetails');

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

  // Historique du BC
  let historiqueHTML = '';
  if (bc.historique && bc.historique.length > 0) {
    historiqueHTML = `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
        <h4 style="margin: 0 0 12px 0; color: #1E2A52;">📋 Historique du BC</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${bc.historique.slice().reverse().map(h => `
            <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                <span style="font-weight: 600; color: #1E2A52; font-size: 13px;">${h.statutLabel || h.statut}</span>
                <span style="font-size: 12px; color: #64748b;">${formatDateFR(h.date)}</span>
              </div>
              <div style="font-size: 12px; color: #64748b;">Par : ${h.utilisateur}</div>
              ${h.commentaire ? `<div style="font-size: 12px; color: #475569; margin-top: 4px; font-style: italic;">"${h.commentaire}"</div>` : ''}
            </div>
          `).join('')}
        </div>
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
        <span style="font-weight: 600; color: #64748b;">Date signature :</span>
        <span style="color: #1E2A52;"><strong>${formatDateFR(bc.dateSignature)}</strong></span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Signé par :</span>
        <span style="color: #1E2A52;">${bc.signePar || 'Dr. Laurent Petit'}</span>
      </div>
      <div style="display: grid; grid-template-columns: 150px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: 600; color: #64748b;">Statut actuel :</span>
        <span style="color: #1E2A52;"><strong>${bc.statutLabel || bc.statut}</strong></span>
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
    ${historiqueHTML}
  `;
}

/* ========== EXPORT CSV ========== */
function exporterCSV() {
  if (bcFiltres.length === 0) {
    alert('Aucun BC à exporter');
    return;
  }

  const headers = ['N° BC', 'Demandeur', 'Département', 'Fournisseur', 'Montant TTC', 'Date signature', 'Délai signature (j)', 'Statut actuel'];
  const rows = bcFiltres.map(bc => {
    const dateValidation = new Date(bc.dateValidation || bc.dateCreation);
    const dateSignature = new Date(bc.dateSignature);
    const delaiSignature = Math.ceil((dateSignature - dateValidation) / (1000 * 60 * 60 * 24));

    return [
      bc.numeroCommande,
      bc.demandeur?.nom || '—',
      bc.demandeur?.departement || '—',
      bc.fournisseur?.nom || '—',
      bc.montantTTC || 0,
      formatDateFR(bc.dateSignature),
      delaiSignature,
      bc.statutLabel || bc.statut
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historique_signatures_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ========== FERMER MODAL ========== */
function fermerModal() {
  const modal = document.getElementById('modalDetails');
  if (modal) modal.setAttribute('hidden', '');
  bcSelectionne = null;
}

/* ========== CHARGER DONNÉES ========== */
function chargerDonnees() {
  bcSignes = getBCSignes();
  bcFiltres = [...bcSignes];
  afficherKPIs();
  afficherTableau();
}

/* ========== INITIALISATION ========== */
ready(function() {
  chargerDonnees();
  initialiserFiltres();

  // Export CSV
  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', exporterCSV);
  }

  // Gestion du modal
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', fermerModal);
  }

  const btnFermer = document.getElementById('btnFermer');
  if (btnFermer) {
    btnFermer.addEventListener('click', fermerModal);
  }

  const modalOverlay = document.querySelector('#modalDetails .modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', fermerModal);
  }
});
