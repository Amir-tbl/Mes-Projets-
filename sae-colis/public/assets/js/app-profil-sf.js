/* ================================================================
   SAE-Colis - Page Profil Service Financier
   Simulation de données ENT Sorbonne Paris Nord
================================================================ */

ready(function() {
  console.log('Page Profil SF - Chargement...');

  /* ========== SIMULATION DONNÉES ENT ========== */
  const entData = {
    // Informations personnelles
    firstName: 'Marie',
    lastName: 'Dubois',
    fullName: 'Dubois Marie',
    studentId: '19876543',
    birthDate: '12 juin 1988',
    email: 'marie.dubois@univ-paris13.fr',
    phone: '+33 1 49 40 45 67',

    // Informations professionnelles
    role: 'Service Financier',
    department: 'Administration',
    service: 'Gestion financière',
    joinDate: '1 septembre 2018',

    // Adresse
    campus: 'Villetaneuse',
    building: 'Bâtiment A',
    office: 'A105',
    address: '99 Avenue Jean-Baptiste Clément<br>93430 Villetaneuse',

    // Statistiques SF
    stats: {
      total: 456,        // Commandes traitées
      month: 67,         // Ce mois
      pending: 12,       // En attente validation
      avgTime: '1.8j'    // Délai moyen traitement
    },

    // Paramètres
    settings: {
      notifEmail: true,
      notifPush: true
    }
  };

  /* ========== REMPLISSAGE AUTOMATIQUE DU PROFIL ========== */
  function loadProfileData() {
    // Avatar initials
    const initials = entData.firstName.charAt(0) + entData.lastName.charAt(0);
    document.getElementById('avatarInitials').textContent = initials;

    // Header profile
    document.getElementById('profileName').textContent = entData.fullName;
    document.getElementById('profileRole').textContent = `${entData.role} — Service ${entData.department}`;
    document.getElementById('profileEmail').textContent = entData.email;

    // Informations personnelles
    document.getElementById('fullName').textContent = entData.fullName;
    document.getElementById('studentId').textContent = entData.studentId;
    document.getElementById('birthDate').textContent = entData.birthDate;
    document.getElementById('phone').textContent = entData.phone;

    // Informations professionnelles
    document.getElementById('role').textContent = entData.role;
    document.getElementById('department').textContent = entData.department;
    document.getElementById('service').textContent = entData.service;
    document.getElementById('joinDate').textContent = entData.joinDate;

    // Adresse
    document.getElementById('campus').textContent = entData.campus;
    document.getElementById('building').textContent = entData.building;
    document.getElementById('office').textContent = entData.office;
    document.getElementById('address').innerHTML = entData.address;

    // Statistiques (adaptées au SF)
    document.getElementById('statTotal').textContent = entData.stats.total;
    document.getElementById('statMonth').textContent = entData.stats.month;
    document.getElementById('statPending').textContent = entData.stats.pending;
    document.getElementById('statAvgTime').textContent = entData.stats.avgTime;

    // Mettre à jour les labels des statistiques pour le SF
    const statLabels = document.querySelectorAll('.stats-grid .stat-label');
    if (statLabels.length >= 4) {
      statLabels[0].textContent = 'Commandes traitées';
      statLabels[1].textContent = 'Ce mois-ci';
      statLabels[2].textContent = 'En attente validation';
      statLabels[3].textContent = 'Délai moyen';
    }

    // Paramètres
    document.getElementById('notifEmail').checked = entData.settings.notifEmail;
    document.getElementById('notifPush').checked = entData.settings.notifPush;
  }

  /* ========== GESTION DES ACTIONS ========== */

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        alert('Déconnexion...');
      }
    });
  }

  /* ========== SAUVEGARDE DES PARAMÈTRES ========== */
  function saveSettings() {
    entData.settings.notifEmail = document.getElementById('notifEmail').checked;
    entData.settings.notifPush = document.getElementById('notifPush').checked;

    localStorage.setItem('userSettingsSF', JSON.stringify(entData.settings));

    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #2BAE66; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 9999;
    `;
    msg.textContent = '✅ Paramètres sauvegardés';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  }

  document.getElementById('notifEmail').addEventListener('change', saveSettings);
  document.getElementById('notifPush').addEventListener('change', saveSettings);

  /* ========== CHARGEMENT INITIAL ========== */
  loadProfileData();
});
