// =============================================
// app-superadmin-logs.js
// Gestion des logs pour SuperAdmin
// =============================================

console.log('✅ app-superadmin-logs.js chargé');

// =========== FILTRES ===========

const filterTypeAction = document.getElementById('filterTypeAction');
const filterUtilisateur = document.getElementById('filterUtilisateur');
const filterRole = document.getElementById('filterRole');
const filterDateDebut = document.getElementById('filterDateDebut');
const filterDateFin = document.getElementById('filterDateFin');
const btnAppliquerFiltres = document.getElementById('btnAppliquerFiltres');
const btnResetFiltres = document.getElementById('btnResetFiltres');
const searchInput = document.getElementById('searchInput');

// Appliquer les filtres
function appliquerFiltres() {
  const typeActionValue = filterTypeAction ? filterTypeAction.value.toLowerCase() : '';
  const utilisateurValue = filterUtilisateur ? filterUtilisateur.value.toLowerCase() : '';
  const roleValue = filterRole ? filterRole.value.toLowerCase() : '';
  const dateDebutValue = filterDateDebut ? filterDateDebut.value : '';
  const dateFinValue = filterDateFin ? filterDateFin.value : '';
  const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

  console.log('🔍 Filtres logs appliqués:', {
    typeAction: typeActionValue,
    utilisateur: utilisateurValue,
    role: roleValue,
    dateDebut: dateDebutValue,
    dateFin: dateFinValue,
    recherche: searchValue
  });

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  let visibleCount = 0;

  rows.forEach(row => {
    const dateTime = row.cells[0]?.textContent || '';
    const utilisateur = row.cells[1]?.textContent.toLowerCase() || '';
    const role = row.cells[2]?.textContent.toLowerCase() || '';
    const typeAction = row.cells[3]?.textContent.toLowerCase() || '';
    const description = row.cells[4]?.textContent.toLowerCase() || '';
    const ressource = row.cells[5]?.textContent.toLowerCase() || '';
    const ip = row.cells[6]?.textContent.toLowerCase() || '';

    let visible = true;

    // Filtre par type d'action
    if (typeActionValue && !typeAction.includes(typeActionValue)) {
      visible = false;
    }

    // Filtre par utilisateur
    if (utilisateurValue && !utilisateur.includes(utilisateurValue)) {
      visible = false;
    }

    // Filtre par rôle
    if (roleValue && !role.includes(roleValue)) {
      visible = false;
    }

    // Filtre par recherche globale
    if (searchValue) {
      const matchSearch =
        utilisateur.includes(searchValue) ||
        description.includes(searchValue) ||
        ressource.includes(searchValue) ||
        ip.includes(searchValue);

      if (!matchSearch) {
        visible = false;
      }
    }

    // TODO: Filtres par date (nécessite parsing des dates)

    if (visible) {
      visibleCount++;
    }

    row.style.display = visible ? '' : 'none';
  });

  // Mettre à jour les KPI
  updateKPIsBasedOnFilters(visibleCount);

  console.log(`✅ ${visibleCount} logs affichés après filtrage`);
}

// Mettre à jour les KPIs en fonction des filtres
function updateKPIsBasedOnFilters(visibleCount) {
  const kpiTotal = document.getElementById('kpiTotal');

  if (kpiTotal) {
    // En production, ces valeurs seraient calculées côté serveur
    // Ici on met juste à jour le total visible
    console.log(`📊 ${visibleCount} événements visibles`);
  }
}

// Écouter les changements
if (searchInput) searchInput.addEventListener('input', appliquerFiltres);

if (btnAppliquerFiltres) {
  btnAppliquerFiltres.addEventListener('click', appliquerFiltres);
}

// Réinitialiser les filtres
if (btnResetFiltres) {
  btnResetFiltres.addEventListener('click', () => {
    if (filterTypeAction) filterTypeAction.value = '';
    if (filterUtilisateur) filterUtilisateur.value = '';
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
      updateKPIsBasedOnFilters(rows.length);
    }

    console.log('🔄 Filtres réinitialisés');
  });
}

// =========== EXPORT ===========

// Export CSV
const btnExportCsv = document.getElementById('btnExportCsv');
if (btnExportCsv) {
  btnExportCsv.addEventListener('click', () => {
    console.log('📥 Export CSV des logs demandé');

    // Récupérer toutes les lignes visibles
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    let csvContent = 'Date & Heure,Utilisateur,Rôle,Type d\'action,Description,Ressource,Adresse IP\n';

    rows.forEach(row => {
      if (row.style.display !== 'none') {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => {
          // Nettoyer le texte (enlever les badges, etc.)
          return `"${cell.textContent.trim().replace(/"/g, '""')}"`;
        });
        csvContent += rowData.join(',') + '\n';
      }
    });

    console.log('📊 CSV généré:', csvContent.length, 'caractères');

    alert('📥 Export CSV\n\nFonctionnalité en cours de développement\n\nEn production, un fichier CSV sera téléchargé avec tous les logs visibles après filtrage.\n\nNombre de lignes à exporter: ' + (csvContent.split('\n').length - 2));
  });
}

// Export PDF
const btnExportPdf = document.getElementById('btnExportPdf');
if (btnExportPdf) {
  btnExportPdf.addEventListener('click', () => {
    console.log('📄 Export PDF des logs demandé');
    alert('📄 Export PDF\n\nFonctionnalité en cours de développement\n\nUn rapport PDF d\'audit sera généré avec tous les logs visibles après filtrage.');
  });
}

// =========== PAGINATION ===========

const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');

let currentPage = 1;
const logsPerPage = 15;

if (btnPrevious) {
  btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      console.log('⬅️ Page précédente:', currentPage);
      // En production, charger les logs de la page précédente
      alert(`Navigation vers la page ${currentPage}\n\nFonctionnalité en cours de développement`);
    }
  });
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    currentPage++;
    console.log('➡️ Page suivante:', currentPage);
    // En production, charger les logs de la page suivante
    alert(`Navigation vers la page ${currentPage}\n\nFonctionnalité en cours de développement`);
  });
}

// =========== AUTO-REFRESH ===========

// Optionnel: Auto-refresh des logs toutes les 30 secondes
let autoRefreshInterval = null;
let autoRefreshEnabled = false;

function toggleAutoRefresh() {
  autoRefreshEnabled = !autoRefreshEnabled;

  if (autoRefreshEnabled) {
    console.log('🔄 Auto-refresh activé (30s)');
    autoRefreshInterval = setInterval(() => {
      console.log('🔄 Actualisation automatique des logs...');
      // En production, recharger les logs depuis le serveur
    }, 30000);
  } else {
    console.log('⏸️ Auto-refresh désactivé');
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
}

// Ajouter un bouton pour toggle l'auto-refresh si nécessaire
// Ce bouton n'est pas dans le HTML actuel, mais pourrait être ajouté

// =========== HIGHLIGHT DES ÉVÉNEMENTS CRITIQUES ===========

// Mettre en évidence les événements critiques (suppressions, erreurs, etc.)
function highlightCriticalEvents() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const typeAction = row.cells[3]?.textContent.toLowerCase() || '';
    const description = row.cells[4]?.textContent.toLowerCase() || '';

    // Événements à mettre en évidence
    if (
      typeAction.includes('suppression') ||
      description.includes('tentative') ||
      description.includes('échec') ||
      description.includes('erreur') ||
      description.includes('non autorisée')
    ) {
      // La ligne a déjà un style de fond rouge dans le HTML
      // On pourrait ajouter d'autres styles ici
      console.log('⚠️ Événement critique détecté:', description.substring(0, 50));
    }
  });
}

// Exécuter au chargement
highlightCriticalEvents();

console.log('✅ Gestionnaire de logs SuperAdmin initialisé');
