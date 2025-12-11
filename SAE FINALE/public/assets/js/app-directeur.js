/* ================================================================
   SAE-Colis - Tableau de bord Directeur
   Affichage des KPIs et aperçu des BC à signer
================================================================ */

const formatEuro = (n) => new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n ?? 0);
const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

/* ========== RÉCUPÉRER LES COMMANDES ========== */
function getBCEnAttenteSignature() {
  if (!window.CommandesManager) return [];
  return window.CommandesManager.getByStatut('en_attente_signature');
}

function getBCSignes() {
  if (!window.CommandesManager) return [];
  const commandes = window.CommandesManager.getAll();
  return commandes.filter(c => c.dateSignature);
}

/* ========== CALCUL DES KPIs ========== */
function calculerKPIs() {
  const bcEnAttente = getBCEnAttenteSignature();
  const bcSignes = getBCSignes();

  const aujourdhui = new Date();
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
  const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());

  const signesAujourdhui = bcSignes.filter(bc => {
    const dateSign = new Date(bc.dateSignature);
    return dateSign >= debutJour;
  }).length;

  const signesMois = bcSignes.filter(bc => {
    const dateSign = new Date(bc.dateSignature);
    return dateSign >= debutMois;
  });

  const montantMois = signesMois.reduce((sum, bc) => sum + (bc.montantTTC || 0), 0);

  const urgents = bcEnAttente.filter(bc => bc.urgence || bc.prioritaire).length;

  return {
    enAttente: bcEnAttente.length,
    signesAujourdhui,
    signesMois: signesMois.length,
    montantMois,
    urgents,
    total: bcSignes.length
  };
}

/* ========== AFFICHER LES KPIs ========== */
function afficherKPIs() {
  const kpis = calculerKPIs();

  document.getElementById('kpiEnAttente').textContent = kpis.enAttente;
  document.getElementById('kpiSignesAujourdhui').textContent = kpis.signesAujourdhui;
  document.getElementById('kpiSignesMois').textContent = kpis.signesMois;
  document.getElementById('kpiMontantMois').textContent = formatEuro(kpis.montantMois);
  document.getElementById('kpiUrgents').textContent = kpis.urgents;
  document.getElementById('kpiTotal').textContent = kpis.total;
}

/* ========== APERÇU DES BC EN ATTENTE ========== */
function afficherApercu() {
  const bcEnAttente = getBCEnAttenteSignature();
  const tbody = document.getElementById('tablePreview');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (bcEnAttente.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
          ✅ Aucun BC en attente de signature
        </td>
      </tr>
    `;
    return;
  }

  const apercu = bcEnAttente.slice(0, 5);

  apercu.forEach(bc => {
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
      <td><strong>${bc.numeroCommande}</strong></td>
      <td>${bc.demandeur?.nom || '—'}</td>
      <td>${bc.demandeur?.departement || '—'}</td>
      <td>${bc.fournisseur?.nom || '—'}</td>
      <td><strong>${formatEuro(bc.montantTTC)}</strong></td>
      <td>${formatDateFR(dateValidation)}</td>
      <td style="text-align:center;">
        ${genererBadgePiecesJointes(nbPJ)}
      </td>
      <td>
        <a href="signature.html" class="btn btn-sm">
          Consulter →
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== STATISTIQUES MENSUELLES ========== */
function afficherStatsMensuelles() {
  const bcSignes = getBCSignes();
  const aujourdhui = new Date();
  const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  const signesMois = bcSignes.filter(bc => {
    const dateSign = new Date(bc.dateSignature);
    return dateSign >= debutMois;
  });

  document.getElementById('statNbSignatures').textContent = signesMois.length;

  const montantTotal = signesMois.reduce((sum, bc) => sum + (bc.montantTTC || 0), 0);
  document.getElementById('statMontantTotal').textContent = formatEuro(montantTotal);

  let delaiMoyen = 0;
  if (signesMois.length > 0) {
    const delais = signesMois.map(bc => {
      const dateValidation = new Date(bc.dateValidation || bc.dateCreation);
      const dateSignature = new Date(bc.dateSignature);
      return Math.ceil((dateSignature - dateValidation) / (1000 * 60 * 60 * 24));
    });
    delaiMoyen = Math.round(delais.reduce((sum, d) => sum + d, 0) / delais.length * 10) / 10;
  }
  document.getElementById('statDelaiMoyen').textContent = delaiMoyen ? `${delaiMoyen} j` : '0 j';

  const departements = {};
  signesMois.forEach(bc => {
    const dept = bc.demandeur?.departement || 'Non spécifié';
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
  afficherApercu();
  afficherStatsMensuelles();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query) {
        window.location.href = `signature.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
});
