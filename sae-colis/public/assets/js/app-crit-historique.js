/* ================================================================
   SAE-Colis - Historique CRIT
   Afficher tous les colis traités (réceptionnés et distribués)
================================================================ */

const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

let colisTraites = [];
let colisFiltres = [];

/* ========== DONNÉES DE SIMULATION ========== */
const SIMULATION_TRAITES = [
  {
    id: 3,
    numeroCommande: '#BC-2025-0875',
    demandeur: { nom: 'Petit Claire', departement: 'Informatique' },
    fournisseur: { nom: 'LDLC Pro' },
    livraison: { destinataire: 'Petit Claire', instructions: 'Salle info A202' },
    numeroSuivi: 'COLISSIMO-PC875432FR',
    statut: 'recue_iut',
    statutLabel: 'Reçu à l\'IUT',
    dateReceptionIUT: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 4,
    numeroCommande: '#BC-2025-0880',
    demandeur: { nom: 'Moreau Lucie', departement: 'GB' },
    fournisseur: { nom: 'VWR International' },
    livraison: { destinataire: 'Moreau Lucie', instructions: 'Laboratoire L305' },
    numeroSuivi: 'CHRONOPOST-ML880123FR',
    statut: 'recue_iut',
    statutLabel: 'Reçu à l\'IUT',
    dateReceptionIUT: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 5,
    numeroCommande: '#BC-2025-0870',
    demandeur: { nom: 'Faure Thomas', departement: 'Administration' },
    fournisseur: { nom: 'Bureau Vallée' },
    livraison: { destinataire: 'Faure Thomas', instructions: 'Local fournitures administration' },
    numeroSuivi: 'COLISSIMO-FT870987FR',
    statut: 'recue_iut',
    statutLabel: 'Reçu à l\'IUT',
    anomalie: true,
    dateReceptionIUT: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 6,
    numeroCommande: '#BC-2025-0850',
    demandeur: { nom: 'Martin Sophie', departement: 'GEA' },
    fournisseur: { nom: 'Amazon Business' },
    livraison: { destinataire: 'Martin Sophie', instructions: 'Bureau GEA 201' },
    numeroSuivi: 'COLISSIMO-MS850654FR',
    statut: 'livree',
    statutLabel: 'Livré',
    dateReceptionIUT: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateLivraison: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 7,
    numeroCommande: '#BC-2025-0845',
    demandeur: { nom: 'Dubois Jean', departement: 'TC' },
    fournisseur: { nom: 'Manutan' },
    livraison: { destinataire: 'Dubois Jean', instructions: 'Salle TC A105' },
    numeroSuivi: 'CHRONOPOST-DJ845321FR',
    statut: 'livree',
    statutLabel: 'Livré',
    dateReceptionIUT: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateLivraison: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

/* ========== RÉCUPÉRER LES COLIS TRAITÉS ========== */
function getColisTraites() {
  if (!window.CommandesManager) return SIMULATION_TRAITES;
  const commandes = window.CommandesManager.getAll();
  // Colis réceptionnés (recue_iut) ou distribués (livree)
  const traites = commandes.filter(c => c.statut === 'recue_iut' || c.statut === 'livree');
  return traites.length > 0 ? traites : SIMULATION_TRAITES;
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const total = colisFiltres.length;

  const aujourdhui = new Date();
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  // Ce mois
  const mois = colisFiltres.filter(c => {
    const date = new Date(c.dateReceptionIUT || c.dateLivraison);
    return date >= debutMois;
  }).length;

  // Délai moyen de distribution
  const colisDistribues = colisFiltres.filter(c => c.statut === 'livree' && c.dateReceptionIUT && c.dateLivraison);
  let delaiMoyen = 0;
  if (colisDistribues.length > 0) {
    const delais = colisDistribues.map(c => {
      const dateRecep = new Date(c.dateReceptionIUT);
      const dateLiv = new Date(c.dateLivraison);
      return Math.ceil((dateLiv - dateRecep) / (1000 * 60 * 60 * 24));
    });
    delaiMoyen = Math.round(delais.reduce((sum, d) => sum + d, 0) / delais.length * 10) / 10;
  }

  // Anomalies
  const anomalies = colisFiltres.filter(c => c.anomalie).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiMois').textContent = mois;
  document.getElementById('kpiDelaiMoyen').textContent = delaiMoyen ? `${delaiMoyen} j` : '0 j';
  document.getElementById('kpiAnomalies').textContent = anomalies;
}

/* ========== AFFICHER LE TABLEAU ========== */
function afficherTableau() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (colisFiltres.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #94a3b8;">
          Aucun colis traité trouvé
        </td>
      </tr>
    `;
    return;
  }

  // Trier par date de réception (plus récent en premier)
  colisFiltres.sort((a, b) => {
    const dateA = new Date(a.dateReceptionIUT || a.dateLivraison);
    const dateB = new Date(b.dateReceptionIUT || b.dateLivraison);
    return dateB - dateA;
  });

  colisFiltres.forEach(c => {
    const dateRecep = c.dateReceptionIUT;
    const dateDistrib = c.dateLivraison;

    // Calculer le délai
    let delai = '—';
    if (dateRecep && dateDistrib) {
      const dr = new Date(dateRecep);
      const dd = new Date(dateDistrib);
      const jours = Math.ceil((dd - dr) / (1000 * 60 * 60 * 24));
      delai = `${jours} j`;
    }

    const nbPJ = c.piecesJointes?.length || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.numeroCommande}</strong>${c.anomalie ? ' <span style="color: #f59e0b;">⚠️</span>' : ''}</td>
      <td>${c.livraison?.destinataire || c.demandeur?.nom || '—'}</td>
      <td>${c.demandeur?.departement || '—'}</td>
      <td>${c.fournisseur?.nom || '—'}</td>
      <td>${formatDateFR(dateRecep)}</td>
      <td>${formatDateFR(dateDistrib)}</td>
      <td>${delai}</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td style="text-align: right; padding-right: 16px;">
        <button class="btn btn-sm btn-ghost" onclick="afficherDetails(${c.id})">
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

  colisFiltres = colisTraites.filter(c => {
    // Filtre période
    if (filterPeriode !== 'all') {
      const date = new Date(c.dateReceptionIUT || c.dateLivraison);
      if (filterPeriode === 'today' && date < debutJour) return false;
      if (filterPeriode === 'week' && date < debutSemaine) return false;
      if (filterPeriode === 'month' && date < debutMois) return false;
      if (filterPeriode === 'year' && date < debutAnnee) return false;
    }

    // Filtre département
    if (filterDept && c.demandeur?.departement !== filterDept) return false;

    // Filtre statut
    if (filterStatut) {
      if (filterStatut === 'recue_iut' && c.statut !== 'recue_iut') return false;
      if (filterStatut === 'livree' && c.statut !== 'livree') return false;
      if (filterStatut === 'anomalie' && !c.anomalie) return false;
    }

    // Recherche
    if (searchQuery) {
      const searchableText = `
        ${c.numeroCommande}
        ${c.demandeur?.nom || ''}
        ${c.demandeur?.departement || ''}
        ${c.fournisseur?.nom || ''}
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
window.afficherDetails = function(colisId) {
  const colis = colisTraites.find(c => c.id === colisId);
  if (!colis) return;

  let delai = '—';
  let delaiJours = null;
  if (colis.dateReceptionIUT && colis.dateLivraison) {
    const dr = new Date(colis.dateReceptionIUT);
    const dd = new Date(colis.dateLivraison);
    delaiJours = Math.ceil((dd - dr) / (1000 * 60 * 60 * 24));
    delai = `${delaiJours} jour${delaiJours > 1 ? 's' : ''}`;
  }

  const modalDetailsContent = document.getElementById('modalColisDetails');
  if (!modalDetailsContent) return;

  const estDistribue = colis.statut === 'livree';
  const aAnomalie = colis.anomalie;

  modalDetailsContent.innerHTML = `
    <div style="display: grid; gap: 20px;">
      <!-- En-tête -->
      <div style="padding: 16px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px; color: white;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${colis.numeroCommande}</div>
        <div style="opacity: 0.9;">Statut : ${colis.statutLabel || (estDistribue ? 'Distribué' : 'Reçu à l\'IUT')}</div>
      </div>

      ${aAnomalie ? `
      <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
        <div style="font-weight: 600; color: #d97706; margin-bottom: 4px;">⚠️ ANOMALIE SIGNALÉE</div>
        <div style="color: #92400e; font-size: 14px;">${typeof aAnomalie === 'string' ? aAnomalie : 'Une anomalie a été signalée pour ce colis.'}</div>
      </div>
      ` : ''}

      <!-- Informations principales -->
      <div style="display: grid; gap: 12px;">
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DESTINATAIRE</div>
          <div style="font-weight: 600; color: #1E2A52;">${colis.livraison?.destinataire || colis.demandeur?.nom || '—'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DÉPARTEMENT</div>
            <div style="font-weight: 600; color: #1E2A52;">${colis.demandeur?.departement || '—'}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">FOURNISSEUR</div>
            <div style="font-weight: 600; color: #1E2A52;">${colis.fournisseur?.nom || '—'}</div>
          </div>
        </div>

        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">LIEU DE LIVRAISON</div>
          <div style="font-weight: 600; color: #1E2A52;">${colis.livraison?.instructions || colis.livraison?.adresse || '—'}</div>
        </div>

        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">NUMÉRO DE SUIVI</div>
          <div style="font-weight: 600; color: #1E2A52; font-family: monospace;">${colis.numeroSuivi || '—'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE RÉCEPTION IUT</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(colis.dateReceptionIUT)}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE DISTRIBUTION</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(colis.dateLivraison)}</div>
          </div>
        </div>

        ${delaiJours !== null ? `
        <div style="padding: 12px; background: ${delaiJours > 2 ? '#fef2f2' : '#f0fdf4'}; border-radius: 6px;">
          <div style="font-size: 12px; color: ${delaiJours > 2 ? '#dc2626' : '#16a34a'}; margin-bottom: 4px;">DÉLAI DE DISTRIBUTION</div>
          <div style="font-weight: 600; color: ${delaiJours > 2 ? '#dc2626' : '#16a34a'};">${delai}${delaiJours > 2 ? ' ⚠️' : ' ✓'}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  const modal = document.getElementById('modalDetails');
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.textContent = `Détails du colis ${colis.numeroCommande}`;
  if (modal) modal.hidden = false;
};

/* ========== FERMER MODAL DÉTAILS ========== */
function fermerModalDetails() {
  const modal = document.getElementById('modalDetails');
  if (modal) modal.hidden = true;
}

ready(function() {
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnFermer = document.getElementById('btnFermer');
  const modalDetails = document.getElementById('modalDetails');

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', fermerModalDetails);
  }
  if (btnFermer) {
    btnFermer.addEventListener('click', fermerModalDetails);
  }
  if (modalDetails) {
    modalDetails.addEventListener('click', (e) => {
      if (e.target === modalDetails || e.target.classList.contains('modal-overlay')) {
        fermerModalDetails();
      }
    });
  }
});

/* ========== EXPORT CSV ========== */
function exporterCSV() {
  if (colisFiltres.length === 0) {
    alert('Aucun colis à exporter');
    return;
  }

  const headers = ['N° Commande', 'Destinataire', 'Département', 'Fournisseur', 'Date réception', 'Date distribution', 'Délai (j)'];
  const rows = colisFiltres.map(c => {
    let delai = '';
    if (c.dateReceptionIUT && c.dateLivraison) {
      const dr = new Date(c.dateReceptionIUT);
      const dd = new Date(c.dateLivraison);
      delai = Math.ceil((dd - dr) / (1000 * 60 * 60 * 24));
    }

    return [
      c.numeroCommande,
      c.livraison?.destinataire || c.demandeur?.nom || '—',
      c.demandeur?.departement || '—',
      c.fournisseur?.nom || '—',
      formatDateFR(c.dateReceptionIUT),
      formatDateFR(c.dateLivraison),
      delai
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
  link.download = `historique_crit_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ========== CHARGER DONNÉES ========== */
function chargerDonnees() {
  colisTraites = getColisTraites();
  colisFiltres = [...colisTraites];
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
});
