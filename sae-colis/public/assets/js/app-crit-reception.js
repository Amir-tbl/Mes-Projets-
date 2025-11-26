/* ================================================================
   SAE-Colis - Page Réception CRIT
   Afficher et réceptionner les colis expédiés
================================================================ */

const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

let colisExpedies = [];
let colisFiltres = [];

/* ========== DONNÉES DE SIMULATION ========== */
const SIMULATION_EXPEDIES = [
  {
    id: 1,
    numeroCommande: '#BC-2025-0888',
    demandeur: { nom: 'Rousseau Anne', departement: 'GEA' },
    fournisseur: { nom: 'Amazon Business' },
    livraison: { destinataire: 'Rousseau Anne', instructions: 'Bureau GEA 305' },
    numeroSuivi: 'COLISSIMO-AB123456789FR',
    dateExpedition: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 2,
    numeroCommande: '#BC-2025-0890',
    demandeur: { nom: 'Garcia Pablo', departement: 'TC' },
    fournisseur: { nom: 'LDLC' },
    livraison: { destinataire: 'Garcia Pablo', instructions: 'Local matériel TC' },
    numeroSuivi: 'CHRONOPOST-XY987654321FR',
    dateExpedition: new Date().toISOString().split('T')[0]
  }
];

/* ========== RÉCUPÉRER LES COLIS EXPÉDIÉS ========== */
function getColisExpedies() {
  if (!window.CommandesManager) return SIMULATION_EXPEDIES;
  const colis = window.CommandesManager.getByStatut('expediee');
  return colis.length > 0 ? colis : SIMULATION_EXPEDIES;
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const total = colisFiltres.length;

  const aujourdhui = new Date();
  const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());

  // Compter les colis expédiés aujourd'hui
  const recusAujourdhui = 0; // Pour l'instant, aucun réceptionné aujourd'hui dans la simulation

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiRecusAujourdhui').textContent = recusAujourdhui;
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
          ✅ Aucun colis en attente de réception
        </td>
      </tr>
    `;
    return;
  }

  const aujourdhui = new Date();

  colisFiltres.forEach(c => {
    const dateExp = new Date(c.dateExpedition);
    const joursTransit = Math.ceil((aujourdhui - dateExp) / (1000 * 60 * 60 * 24));

    const nbPJ = c.piecesJointes?.length || 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.numeroCommande}</strong></td>
      <td>${c.livraison?.destinataire || c.demandeur?.nom || '—'}</td>
      <td>${c.demandeur?.departement || '—'}</td>
      <td>${c.fournisseur?.nom || '—'}</td>
      <td>${c.numeroSuivi || '—'}</td>
      <td>${formatDateFR(c.dateExpedition)}</td>
      <td>${joursTransit} j</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td style="text-align: right; padding-right: 16px;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-sm btn-ghost" onclick="afficherDetails(${c.id})">
            👁️ Voir
          </button>
          <button class="btn btn-sm" onclick="ouvrirModalReception(${c.id})">
            ✅ Réceptionner
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
  const filterFourn = document.getElementById('filterFournisseur')?.value || '';
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  colisFiltres = colisExpedies.filter(c => {
    // Filtre département
    if (filterDept && c.demandeur?.departement !== filterDept) return false;

    // Filtre fournisseur
    if (filterFourn && !c.fournisseur?.nom?.includes(filterFourn)) return false;

    // Recherche
    if (searchQuery) {
      const searchableText = `
        ${c.numeroCommande}
        ${c.demandeur?.nom || ''}
        ${c.demandeur?.departement || ''}
        ${c.fournisseur?.nom || ''}
        ${c.numeroSuivi || ''}
      `.toLowerCase();
      if (!searchableText.includes(searchQuery)) return false;
    }

    return true;
  });

  afficherKPIs();
  afficherTableau();
}

function initialiserFiltres() {
  ['filterDepartement', 'filterFournisseur'].forEach(id => {
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
      ['filterDepartement', 'filterFournisseur'].forEach(id => {
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
  const colis = colisExpedies.find(c => c.id === colisId);
  if (!colis) return;

  const aujourdhui = new Date();
  const dateExp = new Date(colis.dateExpedition);
  const joursTransit = Math.ceil((aujourdhui - dateExp) / (1000 * 60 * 60 * 24));

  const modalDetailsContent = document.getElementById('modalDetailsContent');
  if (!modalDetailsContent) return;

  modalDetailsContent.innerHTML = `
    <div style="display: grid; gap: 20px;">
      <!-- En-tête -->
      <div style="padding: 16px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px; color: white;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${colis.numeroCommande}</div>
        <div style="opacity: 0.9;">Statut : En attente de réception</div>
      </div>

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
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE EXPÉDITION</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(colis.dateExpedition)}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">JOURS EN TRANSIT</div>
            <div style="font-weight: 600; color: #1E2A52;">${joursTransit} jour${joursTransit > 1 ? 's' : ''}</div>
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

/* ========== OUVRIR MODAL DE RÉCEPTION ========== */
window.ouvrirModalReception = function(colisId) {
  const colis = colisExpedies.find(c => c.id === colisId);
  if (!colis) return;

  alert(`⚠️ Fonction de réception\n\n` +
    `Colis : ${colis.numeroCommande}\n` +
    `N° Suivi : ${colis.numeroSuivi}\n\n` +
    `Cette fonctionnalité sera activée lors de l'implémentation du backend.\n\n` +
    `Action : Réceptionner le colis et changer le statut en "recue_iut"`);
};

/* ========== CHARGER DONNÉES ========== */
function chargerDonnees() {
  colisExpedies = getColisExpedies();
  colisFiltres = [...colisExpedies];
  afficherKPIs();
  afficherTableau();
}

/* ========== INITIALISATION ========== */
ready(function() {
  chargerDonnees();
  initialiserFiltres();
});
