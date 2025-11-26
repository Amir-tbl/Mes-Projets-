/* ================================================================
   SAE-Colis - Page Distribution CRIT
   Afficher et distribuer les colis reçus à l'IUT
================================================================ */

const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

let colisRecusIUT = [];
let colisFiltres = [];

/* ========== DONNÉES DE SIMULATION ========== */
const SIMULATION_RECUS = [
  {
    id: 3,
    numeroCommande: '#BC-2025-0875',
    demandeur: { nom: 'Petit Claire', departement: 'Informatique' },
    livraison: { destinataire: 'Petit Claire', instructions: 'Salle info A202' },
    dateReceptionIUT: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 4,
    numeroCommande: '#BC-2025-0880',
    demandeur: { nom: 'Moreau Lucie', departement: 'GB' },
    livraison: { destinataire: 'Moreau Lucie', instructions: 'Laboratoire L305' },
    dateReceptionIUT: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 5,
    numeroCommande: '#BC-2025-0870',
    demandeur: { nom: 'Faure Thomas', departement: 'Administration' },
    livraison: { destinataire: 'Faure Thomas', instructions: 'Local fournitures administration' },
    dateReceptionIUT: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

/* ========== RÉCUPÉRER LES COLIS REÇUS IUT ========== */
function getColisRecusIUT() {
  if (!window.CommandesManager) return SIMULATION_RECUS;
  const colis = window.CommandesManager.getByStatut('recue_iut');
  return colis.length > 0 ? colis : SIMULATION_RECUS;
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const total = colisFiltres.length;

  const aujourdhui = new Date();
  const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());

  // Compter les colis en retard (> 2 jours)
  let enRetard = 0;
  colisFiltres.forEach(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
    if (joursAttente > 2) enRetard++;
  });

  const distribuesAujourdhui = 0; // Aucun distribué aujourd'hui dans la simulation

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiRetard').textContent = enRetard;
  document.getElementById('kpiDistribuesAujourdhui').textContent = distribuesAujourdhui;
}

/* ========== AFFICHER LE TABLEAU ========== */
function afficherTableau() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (colisFiltres.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
          ✅ Aucun colis à distribuer
        </td>
      </tr>
    `;
    return;
  }

  const aujourdhui = new Date();

  colisFiltres.forEach(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
    const enRetard = joursAttente > 2;

    const nbPJ = c.piecesJointes?.length || 0;

    const tr = document.createElement('tr');
    if (enRetard) {
      tr.style.background = '#fef2f2';
    }

    tr.innerHTML = `
      <td><strong>${c.numeroCommande}</strong>${enRetard ? ' <span style="color: #dc2626; font-weight: bold;">🔴 RETARD</span>' : ''}</td>
      <td>${c.livraison?.destinataire || c.demandeur?.nom || '—'}</td>
      <td>${c.demandeur?.departement || '—'}</td>
      <td style="font-size: 13px;">${c.livraison?.instructions || c.livraison?.adresse || '—'}</td>
      <td>${formatDateFR(c.dateReceptionIUT)}</td>
      <td><strong${enRetard ? ' style="color: #dc2626;"' : ''}>${joursAttente} j</strong></td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td style="text-align: right; padding-right: 16px;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-sm btn-ghost" onclick="afficherDetails(${c.id})">
            👁️ Voir
          </button>
          <button class="btn btn-sm" onclick="ouvrirModalDistribution(${c.id})">
            🚚 Distribuer
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
  const filterUrgence = document.getElementById('filterUrgence')?.value || '';
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  const aujourdhui = new Date();

  colisFiltres = colisRecusIUT.filter(c => {
    // Filtre département
    if (filterDept && c.demandeur?.departement !== filterDept) return false;

    // Filtre urgence (en retard)
    if (filterUrgence) {
      const dateRecep = new Date(c.dateReceptionIUT);
      const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
      const enRetard = joursAttente > 2;

      if (filterUrgence === 'true' && !enRetard) return false;
      if (filterUrgence === 'false' && enRetard) return false;
    }

    // Recherche
    if (searchQuery) {
      const searchableText = `
        ${c.numeroCommande}
        ${c.demandeur?.nom || ''}
        ${c.demandeur?.departement || ''}
        ${c.livraison?.destinataire || ''}
      `.toLowerCase();
      if (!searchableText.includes(searchQuery)) return false;
    }

    return true;
  });

  afficherKPIs();
  afficherTableau();
}

function initialiserFiltres() {
  ['filterDepartement', 'filterUrgence'].forEach(id => {
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
      ['filterDepartement', 'filterUrgence'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      if (searchInput) searchInput.value = '';
      appliquerFiltres();
    });
  }
}

/* ========== AFFICHER DÉTAILS (lecture seule) ========== */
window.afficherDetails = function(colisId) {
  const colis = colisRecusIUT.find(c => c.id === colisId);
  if (!colis) return;

  const aujourdhui = new Date();
  const dateRecep = new Date(colis.dateReceptionIUT);
  const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
  const enRetard = joursAttente > 2;

  const modalDetailsContent = document.getElementById('modalDetailsContent');
  if (!modalDetailsContent) return;

  modalDetailsContent.innerHTML = `
    <div style="display: grid; gap: 20px;">
      <!-- En-tête -->
      <div style="padding: 16px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px; color: white;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${colis.numeroCommande}</div>
        <div style="opacity: 0.9;">Statut : Reçu à l'IUT - En attente de distribution</div>
      </div>

      ${enRetard ? `
      <div style="padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px;">
        <div style="font-weight: 600; color: #dc2626; margin-bottom: 4px;">🔴 COLIS EN RETARD</div>
        <div style="color: #991b1b; font-size: 14px;">Ce colis attend depuis plus de 2 jours. Distribution prioritaire recommandée.</div>
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
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">NUMÉRO DE SUIVI</div>
            <div style="font-weight: 600; color: #1E2A52; font-family: monospace; font-size: 13px;">${colis.numeroSuivi || '—'}</div>
          </div>
        </div>

        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">LIEU DE LIVRAISON</div>
          <div style="font-weight: 600; color: #1E2A52;">${colis.livraison?.instructions || colis.livraison?.adresse || '—'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE RÉCEPTION IUT</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(colis.dateReceptionIUT)}</div>
          </div>
          <div style="padding: 12px; background: ${enRetard ? '#fef2f2' : '#f8fafc'}; border-radius: 6px;">
            <div style="font-size: 12px; color: ${enRetard ? '#dc2626' : '#64748b'}; margin-bottom: 4px;">JOURS D'ATTENTE</div>
            <div style="font-weight: 600; color: ${enRetard ? '#dc2626' : '#1E2A52'};">${joursAttente} jour${joursAttente > 1 ? 's' : ''}${enRetard ? ' ⚠️' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById('modalDetails');
  const modalTitle = document.getElementById('modalDetailsTitle');
  if (modalTitle) modalTitle.textContent = `Détails du colis ${colis.numeroCommande}`;
  if (modal) modal.hidden = false;
};

/* ========== FERMER MODAL DÉTAILS ========== */
function fermerModalDetails() {
  const modal = document.getElementById('modalDetails');
  if (modal) modal.hidden = true;
}

document.addEventListener('DOMContentLoaded', function() {
  const btnCloseModalDetails = document.getElementById('btnCloseModalDetails');
  const btnFermerDetails = document.getElementById('btnFermerDetails');
  const modalDetails = document.getElementById('modalDetails');

  if (btnCloseModalDetails) {
    btnCloseModalDetails.addEventListener('click', fermerModalDetails);
  }
  if (btnFermerDetails) {
    btnFermerDetails.addEventListener('click', fermerModalDetails);
  }
  if (modalDetails) {
    modalDetails.addEventListener('click', (e) => {
      if (e.target === modalDetails || e.target.classList.contains('modal-overlay')) {
        fermerModalDetails();
      }
    });
  }
});

/* ========== OUVRIR MODAL DE DISTRIBUTION ========== */
window.ouvrirModalDistribution = function(colisId) {
  const colis = colisRecusIUT.find(c => c.id === colisId);
  if (!colis) return;

  const aujourdhui = new Date();
  const dateRecep = new Date(colis.dateReceptionIUT);
  const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));

  alert(`⚠️ Fonction de distribution\n\n` +
    `Colis : ${colis.numeroCommande}\n` +
    `Destinataire : ${colis.livraison?.destinataire || colis.demandeur?.nom}\n` +
    `Attente : ${joursAttente} jours\n\n` +
    `Cette fonctionnalité sera activée lors de l'implémentation du backend.\n\n` +
    `Action : Distribuer le colis au destinataire et changer le statut en "livree"`);
};

/* ========== CHARGER DONNÉES ========== */
function chargerDonnees() {
  colisRecusIUT = getColisRecusIUT();
  colisFiltres = [...colisRecusIUT];
  afficherKPIs();
  afficherTableau();
}

/* ========== INITIALISATION ========== */
ready(function() {
  chargerDonnees();
  initialiserFiltres();
});
