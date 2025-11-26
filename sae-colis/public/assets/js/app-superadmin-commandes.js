// =============================================
// app-superadmin-commandes.js
// Gestion des commandes pour SuperAdmin
// =============================================

console.log('✅ app-superadmin-commandes.js chargé');

// =========== GESTION MODAL CHANGER STATUT ===========

const modalStatut = document.getElementById('modalStatut');
const btnCloseModalStatut = document.getElementById('btnCloseModalStatut');
const btnAnnulerStatut = document.getElementById('btnAnnulerStatut');
const btnConfirmerStatut = document.getElementById('btnConfirmerStatut');
const formStatut = document.getElementById('formStatut');
const modalStatutTitle = document.getElementById('modalStatutTitle');

let currentCommandeIdStatut = null;

// Fermer le modal
function fermerModalStatut() {
  if (modalStatut) {
    modalStatut.hidden = true;
    formStatut.reset();
    currentCommandeIdStatut = null;
  }
}

if (btnCloseModalStatut) {
  btnCloseModalStatut.addEventListener('click', fermerModalStatut);
}

if (btnAnnulerStatut) {
  btnAnnulerStatut.addEventListener('click', fermerModalStatut);
}

// Fermer en cliquant sur l'overlay
if (modalStatut) {
  const overlayStatut = modalStatut.querySelector('.modal-overlay');
  if (overlayStatut) {
    overlayStatut.addEventListener('click', fermerModalStatut);
  }
}

// Confirmer le changement de statut
if (btnConfirmerStatut) {
  btnConfirmerStatut.addEventListener('click', (e) => {
    e.preventDefault();

    if (!formStatut.checkValidity()) {
      formStatut.reportValidity();
      return;
    }

    const nouveauStatut = document.getElementById('inputNouveauStatut').value;
    const raison = document.getElementById('inputRaison').value.trim();

    console.log('🔄 Changement de statut:', {
      commande: currentCommandeIdStatut,
      nouveauStatut,
      raison
    });

    alert(`✅ Statut de la commande ${currentCommandeIdStatut} modifié avec succès !\n\nNouveau statut: ${nouveauStatut}${raison ? '\nRaison: ' + raison : ''}`);

    fermerModalStatut();
  });
}

// =========== ACTIONS COMMANDES ===========

// Voir les détails d'une commande (réutilise le modal de app-agent.js)
window.voirCommande = function(numeroBC) {
  console.log('👁️ Voir commande SuperAdmin:', numeroBC);

  // Appeler la fonction définie dans app-agent.js
  if (typeof window.afficherDetailsCommande === 'function') {
    window.afficherDetailsCommande(numeroBC);
  } else {
    alert(`📦 Détails de la commande ${numeroBC}\n\nFonctionnalité en cours de développement`);
  }
};

// Modifier une commande
window.modifierCommande = function(numeroBC) {
  console.log('✏️ Modifier commande:', numeroBC);

  const confirmation = confirm(`Voulez-vous modifier la commande ${numeroBC} ?\n\nCette action ouvrira le formulaire d'édition.`);

  if (confirmation) {
    alert(`✏️ Modification de la commande ${numeroBC}\n\nFonctionnalité en cours de développement\n\nEn production, un formulaire d'édition s'ouvrira ici.`);
  }
};

// Changer le statut d'une commande
window.changerStatut = function(numeroBC) {
  console.log('🔄 Changer statut:', numeroBC);

  currentCommandeIdStatut = numeroBC;

  if (modalStatutTitle) {
    modalStatutTitle.textContent = `Changer le statut de ${numeroBC}`;
  }

  if (modalStatut) {
    modalStatut.hidden = false;
  }
};

// Supprimer une commande
window.supprimerCommande = function(numeroBC) {
  console.log('🗑️ Supprimer commande:', numeroBC);

  const confirmation = confirm(`⚠️ ATTENTION ⚠️\n\nVoulez-vous vraiment supprimer la commande ${numeroBC} ?\n\nCette action est IRRÉVERSIBLE et supprimera:\n- La commande\n- Tous les articles associés\n- L'historique des actions\n- Les documents liés\n\nÊtes-vous sûr(e) ?`);

  if (confirmation) {
    const doubleConfirmation = confirm(`Dernière confirmation:\n\nTapez OK pour supprimer définitivement ${numeroBC}`);

    if (doubleConfirmation) {
      alert(`✅ Commande ${numeroBC} supprimée avec succès !`);
      console.log('Commande supprimée:', numeroBC);
      // Ici, rafraîchir le tableau ou supprimer la ligne
    }
  }
};

// =========== FILTRES ===========

const filterStatut = document.getElementById('filterStatut');
const filterDepartement = document.getElementById('filterDepartement');
const filterRole = document.getElementById('filterRole');
const filterDateDebut = document.getElementById('filterDateDebut');
const filterDateFin = document.getElementById('filterDateFin');
const btnAppliquerFiltres = document.getElementById('btnAppliquerFiltres');
const btnResetFiltres = document.getElementById('btnResetFiltres');
const searchInput = document.getElementById('searchInput');

// Appliquer les filtres
function appliquerFiltres() {
  const statutValue = filterStatut ? filterStatut.value.toLowerCase() : '';
  const departementValue = filterDepartement ? filterDepartement.value.toLowerCase() : '';
  const roleValue = filterRole ? filterRole.value.toLowerCase() : '';
  const dateDebutValue = filterDateDebut ? filterDateDebut.value : '';
  const dateFinValue = filterDateFin ? filterDateFin.value : '';
  const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

  console.log('🔍 Filtres appliqués:', {
    statut: statutValue,
    departement: departementValue,
    role: roleValue,
    dateDebut: dateDebutValue,
    dateFin: dateFinValue,
    recherche: searchValue
  });

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const numero = row.cells[0]?.textContent.toLowerCase() || '';
    const demandeur = row.cells[1]?.textContent.toLowerCase() || '';
    const departement = row.cells[2]?.textContent.toLowerCase() || '';
    const fournisseur = row.cells[3]?.textContent.toLowerCase() || '';
    const statut = row.cells[6]?.textContent.toLowerCase() || '';

    let visible = true;

    // Filtre par statut
    if (statutValue && !statut.includes(statutValue)) {
      visible = false;
    }

    // Filtre par département
    if (departementValue && !departement.includes(departementValue)) {
      visible = false;
    }

    // Filtre par recherche
    if (searchValue && !numero.includes(searchValue) && !demandeur.includes(searchValue) && !fournisseur.includes(searchValue)) {
      visible = false;
    }

    // TODO: Filtres par date et rôle (nécessite des attributs data supplémentaires dans le HTML)

    row.style.display = visible ? '' : 'none';
  });

  // Mettre à jour les KPI en fonction des filtres
  updateKPIsBasedOnFilters(rows);
}

// Mettre à jour les KPIs
function updateKPIsBasedOnFilters(rows) {
  let total = 0;
  let enCours = 0;
  let aValider = 0;
  let livrees = 0;
  let retards = 0;

  rows.forEach(row => {
    if (row.style.display !== 'none') {
      total++;
      const statut = row.cells[6]?.textContent.toLowerCase() || '';

      if (statut.includes('en cours')) enCours++;
      if (statut.includes('valider')) aValider++;
      if (statut.includes('livr')) livrees++;
      if (statut.includes('retard')) retards++;
    }
  });

  const kpiTotal = document.getElementById('kpiTotal');
  const kpiEnCours = document.getElementById('kpiEnCours');
  const kpiAValider = document.getElementById('kpiAValider');
  const kpiLivrees = document.getElementById('kpiLivrees');
  const kpiRetards = document.getElementById('kpiRetards');

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiEnCours) kpiEnCours.textContent = enCours;
  if (kpiAValider) kpiAValider.textContent = aValider;
  if (kpiLivrees) kpiLivrees.textContent = livrees;
  if (kpiRetards) kpiRetards.textContent = retards;
}

// Écouter les changements
if (searchInput) searchInput.addEventListener('input', appliquerFiltres);

if (btnAppliquerFiltres) {
  btnAppliquerFiltres.addEventListener('click', appliquerFiltres);
}

// Réinitialiser les filtres
if (btnResetFiltres) {
  btnResetFiltres.addEventListener('click', () => {
    if (filterStatut) filterStatut.value = '';
    if (filterDepartement) filterDepartement.value = '';
    if (filterRole) filterRole.value = '';
    if (filterDateDebut) filterDateDebut.value = '';
    if (filterDateFin) filterDateFin.value = '';
    if (searchInput) searchInput.value = '';

    // Réafficher toutes les lignes
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = '';
      });
      updateKPIsBasedOnFilters(rows);
    }
  });
}

// =========== EXPORT ===========

// Export CSV
const btnExportCsv = document.getElementById('btnExportCsv');
if (btnExportCsv) {
  btnExportCsv.addEventListener('click', () => {
    console.log('📥 Export CSV demandé');
    alert('📥 Export CSV\n\nFonctionnalité en cours de développement\n\nLe fichier CSV sera généré avec toutes les commandes visibles après filtrage.');
  });
}

// Export PDF
const btnExportPdf = document.getElementById('btnExportPdf');
if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    console.log('📄 Export PDF demandé');
    alert('📄 Export PDF\n\nFonctionnalité en cours de développement\n\nUn rapport PDF sera généré avec toutes les commandes visibles après filtrage.');
  });
}

console.log('✅ Gestionnaire de commandes SuperAdmin initialisé');
