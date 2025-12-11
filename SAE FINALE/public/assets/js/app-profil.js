/* ================================================================
   SAE-Colis - Page Profil
   Simulation de données ENT Sorbonne Paris Nord
================================================================ */

ready(function() {
  console.log('Page Profil - Chargement...');

  /* ========== SIMULATION DONNÉES ENT ========== */
  const entData = {
    // Informations personnelles
    firstName: 'Franck',
    lastName: 'Butelle',
    fullName: 'Butelle Franck',
    studentId: '21234567',
    birthDate: '15 mars 1985',
    email: 'franck.butelle@univ-paris13.fr',
    phone: '+33 1 49 40 40 40',

    // Informations professionnelles
    role: 'Agent',
    department: 'Informatique',
    service: 'Gestion des colis',
    joinDate: '1 septembre 2020',

    // Adresse
    campus: 'Villetaneuse',
    building: 'Institut Galilée',
    office: 'B210',
    address: '99 Avenue Jean-Baptiste Clément<br>93430 Villetaneuse',

    // Statistiques
    stats: {
      total: 156,
      month: 23,
      pending: 4,
      avgTime: '2.3j'
    },

    // Paramètres
    settings: {
      notifEmail: true,
      notifPush: false,
      language: 'fr'
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

    // Statistiques
    document.getElementById('statTotal').textContent = entData.stats.total;
    document.getElementById('statMonth').textContent = entData.stats.month;
    document.getElementById('statPending').textContent = entData.stats.pending;
    document.getElementById('statAvgTime').textContent = entData.stats.avgTime;

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

    localStorage.setItem('userSettings', JSON.stringify(entData.settings));

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
