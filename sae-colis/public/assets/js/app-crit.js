/* ================================================================
   SAE-Colis - Tableau de bord CRIT
   Affichage des KPIs et aperçus des colis
================================================================ */

const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

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

/* ========== RÉCUPÉRER LES COLIS ========== */
function getColisExpedies() {
  if (!window.CommandesManager) return SIMULATION_EXPEDIES;
  const colis = window.CommandesManager.getByStatut('expediee');
  return colis.length > 0 ? colis : SIMULATION_EXPEDIES;
}

function getColisRecusIUT() {
  if (!window.CommandesManager) return SIMULATION_RECUS;
  const colis = window.CommandesManager.getByStatut('recue_iut');
  return colis.length > 0 ? colis : SIMULATION_RECUS;
}

function getColisDistribues() {
  if (!window.CommandesManager) return [];
  return window.CommandesManager.getByStatut('livree');
}

/* ========== CALCUL DES KPIs ========== */
function calculerKPIs() {
  const colisExpedies = getColisExpedies();
  const colisRecusIUT = getColisRecusIUT();
  const colisDistribues = getColisDistribues();

  const aujourdhui = new Date();
  const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  const recusAujourdhui = colisRecusIUT.filter(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    return dateRecep >= debutJour;
  }).length;

  const distribuesAujourdhui = colisDistribues.filter(c => {
    const dateLiv = new Date(c.dateLivraison);
    return dateLiv >= debutJour;
  }).length;

  let aDistribuer = 0;
  colisRecusIUT.forEach(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
    if (joursAttente > 2) aDistribuer++;
  });

  const anomalies = window.CommandesManager.getAll().filter(c => c.anomalie).length;

  const recusMois = colisRecusIUT.filter(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    return dateRecep >= debutMois;
  }).length;

  const distribuesMois = colisDistribues.filter(c => {
    const dateLiv = new Date(c.dateLivraison);
    return dateLiv >= debutMois;
  }).length;

  return {
    enAttente: colisExpedies.length,
    recusAujourdhui,
    aDistribuer: colisRecusIUT.length,
    distribuesAujourdhui,
    anomalies,
    totalMois: recusMois + distribuesMois
  };
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const kpis = calculerKPIs();

  document.getElementById('kpiEnAttente').textContent = kpis.enAttente;
  document.getElementById('kpiRecusAujourdhui').textContent = kpis.recusAujourdhui;
  document.getElementById('kpiADistribuer').textContent = kpis.aDistribuer;
  document.getElementById('kpiDistribuesAujourdhui').textContent = kpis.distribuesAujourdhui;
  document.getElementById('kpiAnomalies').textContent = kpis.anomalies;
  document.getElementById('kpiTotalMois').textContent = kpis.totalMois;
}

/* ========== APERÇU COLIS EN ATTENTE DE RÉCEPTION ========== */
function afficherApercuReception() {
  const colisExpedies = getColisExpedies();
  const tbody = document.getElementById('tablePreviewReception');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (colisExpedies.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
          ✅ Aucun colis en attente de réception
        </td>
      </tr>
    `;
    return;
  }

  const apercu = colisExpedies.slice(0, 5);

  apercu.forEach(c => {
    const dateExp = new Date(c.dateExpedition);
    const aujourdhui = new Date();
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
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td>
        <a href="reception.html" class="btn btn-sm">
          Voir →
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== APERÇU COLIS À DISTRIBUER ========== */
function afficherApercuDistribution() {
  const colisRecusIUT = getColisRecusIUT();
  const tbody = document.getElementById('tablePreviewDistribution');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (colisRecusIUT.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
          ✅ Aucun colis à distribuer
        </td>
      </tr>
    `;
    return;
  }

  const apercu = colisRecusIUT.slice(0, 5);
  const aujourdhui = new Date();

  apercu.forEach(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    const joursAttente = Math.ceil((aujourdhui - dateRecep) / (1000 * 60 * 60 * 24));
    const enRetard = joursAttente > 2;

    const nbPJ = c.piecesJointes?.length || 0;

    const tr = document.createElement('tr');
    if (enRetard) {
      tr.style.background = '#fef2f2';
    }

    tr.innerHTML = `
      <td><strong>${c.numeroCommande}</strong>${enRetard ? ' <span style="color: #dc2626;">🔴</span>' : ''}</td>
      <td>${c.livraison?.destinataire || c.demandeur?.nom || '—'}</td>
      <td>${c.demandeur?.departement || '—'}</td>
      <td>${c.livraison?.instructions || c.livraison?.adresse || '—'}</td>
      <td>${formatDateFR(c.dateReceptionIUT)}</td>
      <td>${joursAttente} j</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td>
        <a href="distribution.html" class="btn btn-sm">
          Distribuer →
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== STATISTIQUES MENSUELLES ========== */
function afficherStatsMensuelles() {
  const colisRecusIUT = getColisRecusIUT();
  const colisDistribues = getColisDistribues();
  const aujourdhui = new Date();
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  const recusMois = colisRecusIUT.filter(c => {
    const dateRecep = new Date(c.dateReceptionIUT);
    return dateRecep >= debutMois;
  }).length;
  document.getElementById('statNbReceptions').textContent = recusMois;

  const distribuesMois = colisDistribues.filter(c => {
    const dateLiv = new Date(c.dateLivraison);
    return dateLiv >= debutMois;
  }).length;
  document.getElementById('statNbDistributions').textContent = distribuesMois;

  let delaiMoyen = 0;
  if (colisDistribues.length > 0) {
    const delais = colisDistribues.map(c => {
      const dateRecep = new Date(c.dateReceptionIUT);
      const dateLiv = new Date(c.dateLivraison);
      return Math.ceil((dateLiv - dateRecep) / (1000 * 60 * 60 * 24));
    });
    delaiMoyen = Math.round(delais.reduce((sum, d) => sum + d, 0) / delais.length * 10) / 10;
  }
  document.getElementById('statDelaiMoyen').textContent = delaiMoyen ? `${delaiMoyen} j` : '0 j';

  const departements = {};
  [...colisRecusIUT, ...colisDistribues].forEach(c => {
    const dept = c.demandeur?.departement || 'Non spécifié';
    departements[dept] = (departements[dept] || 0) + 1;
  });

  let deptTop = '—';
  let maxCount = 0;
  for (const [dept, count] of Object.entries(departements)) {
    if (count > maxCount) {
      maxCount = count;
      deptTop = dept;
    }
  }
  document.getElementById('statDepartementTop').textContent = deptTop;
}

/* ========== INITIALISATION ========== */
ready(function() {
  afficherKPIs();
  afficherApercuReception();
  afficherApercuDistribution();
  afficherStatsMensuelles();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query) {
        window.location.href = `reception.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
});
