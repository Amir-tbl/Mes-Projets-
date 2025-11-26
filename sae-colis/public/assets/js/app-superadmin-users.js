// =============================================
// app-superadmin-users.js
// Gestion des utilisateurs pour SuperAdmin
// =============================================

console.log('✅ app-superadmin-users.js chargé');

// =========== GESTION DES MODALS ===========

// Modal Créer/Modifier Utilisateur
const modalUtilisateur = document.getElementById('modalUtilisateur');
const btnCreerUtilisateur = document.getElementById('btnCreerUtilisateur');
const btnCloseModalUtilisateur = document.getElementById('btnCloseModalUtilisateur');
const btnAnnulerUtilisateur = document.getElementById('btnAnnulerUtilisateur');
const btnSauvegarderUtilisateur = document.getElementById('btnSauvegarderUtilisateur');
const formUtilisateur = document.getElementById('formUtilisateur');
const modalUtilisateurTitle = document.getElementById('modalUtilisateurTitle');

let currentUserIdEdit = null; // Pour savoir si on est en mode édition

// Ouvrir le modal pour créer un utilisateur
if (btnCreerUtilisateur) {
  btnCreerUtilisateur.addEventListener('click', () => {
    currentUserIdEdit = null;
    modalUtilisateurTitle.textContent = 'Créer un utilisateur';
    formUtilisateur.reset();
    modalUtilisateur.hidden = false;
  });
}

// Fermer le modal
function fermerModalUtilisateur() {
  modalUtilisateur.hidden = true;
  formUtilisateur.reset();
  currentUserIdEdit = null;
}

if (btnCloseModalUtilisateur) {
  btnCloseModalUtilisateur.addEventListener('click', fermerModalUtilisateur);
}

if (btnAnnulerUtilisateur) {
  btnAnnulerUtilisateur.addEventListener('click', fermerModalUtilisateur);
}

// Fermer en cliquant sur l'overlay
if (modalUtilisateur) {
  modalUtilisateur.querySelector('.modal-overlay').addEventListener('click', fermerModalUtilisateur);
}

// Sauvegarder l'utilisateur
if (btnSauvegarderUtilisateur) {
  btnSauvegarderUtilisateur.addEventListener('click', (e) => {
    e.preventDefault();

    if (!formUtilisateur.checkValidity()) {
      formUtilisateur.reportValidity();
      return;
    }

    const nom = document.getElementById('inputNom').value.trim();
    const prenom = document.getElementById('inputPrenom').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const role = document.getElementById('inputRole').value;
    const departement = document.getElementById('inputDepartement').value;
    const password = document.getElementById('inputPassword').value;
    const actif = document.getElementById('inputActif').checked;

    if (currentUserIdEdit) {
      // Mode édition
      console.log('✏️ Modification utilisateur:', {
        id: currentUserIdEdit,
        nom,
        prenom,
        email,
        role,
        departement,
        actif
      });
      alert(`✅ Utilisateur "${prenom} ${nom}" modifié avec succès !`);
    } else {
      // Mode création
      console.log('➕ Création utilisateur:', {
        nom,
        prenom,
        email,
        role,
        departement,
        password: '***',
        actif
      });
      alert(`✅ Utilisateur "${prenom} ${nom}" créé avec succès !\n\nUn email de bienvenue avec le mot de passe temporaire a été envoyé à ${email}.`);
    }

    fermerModalUtilisateur();
  });
}

// =========== ACTIONS UTILISATEURS ===========

// Voir les détails d'un utilisateur
window.voirUtilisateur = function(userId) {
  console.log('👁️ Voir utilisateur:', userId);

  // Simuler les données utilisateur
  const userData = {
    1: {
      nom: 'Butelle',
      prenom: 'Franck',
      email: 'franck.butelle@univ-paris13.fr',
      role: 'Agent',
      departement: 'Informatique',
      actif: true,
      derniereConnexion: '10/01/25',
      dateCreation: '01/09/20',
      nbCommandes: 156
    }
  };

  const user = userData[userId] || {
    nom: 'Utilisateur',
    prenom: 'Exemple',
    email: 'exemple@univ-paris13.fr',
    role: 'Agent',
    departement: 'Informatique',
    actif: true,
    derniereConnexion: '10/01/25',
    dateCreation: '01/09/20',
    nbCommandes: 0
  };

  const details = `
📋 DÉTAILS UTILISATEUR

Nom complet: ${user.prenom} ${user.nom}
Email: ${user.email}
Rôle: ${user.role}
Département: ${user.departement}
Statut: ${user.actif ? 'Actif' : 'Inactif'}

Date de création: ${user.dateCreation}
Dernière connexion: ${user.derniereConnexion}
Commandes créées: ${user.nbCommandes}
  `.trim();

  alert(details);
};

// Modifier un utilisateur
window.modifierUtilisateur = function(userId) {
  console.log('✏️ Modifier utilisateur:', userId);

  currentUserIdEdit = userId;
  modalUtilisateurTitle.textContent = 'Modifier l\'utilisateur';

  // Simuler le chargement des données (à remplacer par un appel API)
  const userData = {
    1: {
      nom: 'Butelle',
      prenom: 'Franck',
      email: 'franck.butelle@univ-paris13.fr',
      role: 'agent',
      departement: 'Informatique',
      actif: true
    }
  };

  const user = userData[userId] || {
    nom: 'Exemple',
    prenom: 'Utilisateur',
    email: 'exemple@univ-paris13.fr',
    role: 'agent',
    departement: 'Informatique',
    actif: true
  };

  // Remplir le formulaire
  document.getElementById('inputNom').value = user.nom;
  document.getElementById('inputPrenom').value = user.prenom;
  document.getElementById('inputEmail').value = user.email;
  document.getElementById('inputRole').value = user.role;
  document.getElementById('inputDepartement').value = user.departement;
  document.getElementById('inputActif').checked = user.actif;

  // Cacher le champ mot de passe en mode édition
  const passwordField = document.getElementById('inputPassword');
  if (passwordField) {
    passwordField.removeAttribute('required');
    passwordField.closest('div').style.display = 'none';
  }

  modalUtilisateur.hidden = false;
};

// Activer/Désactiver un utilisateur
window.toggleUtilisateur = function(userId) {
  console.log('🔒 Toggle utilisateur:', userId);

  const confirmation = confirm('Voulez-vous vraiment changer le statut de cet utilisateur ?\n\nLes utilisateurs inactifs ne pourront plus se connecter.');

  if (confirmation) {
    alert('✅ Statut de l\'utilisateur modifié avec succès !');
    // Ici, rafraîchir le tableau ou mettre à jour la ligne
    console.log('Statut changé pour l\'utilisateur', userId);
  }
};

// =========== FILTRES ===========

const filterRole = document.getElementById('filterRole');
const filterDepartement = document.getElementById('filterDepartement');
const filterStatut = document.getElementById('filterStatut');
const btnResetFilters = document.getElementById('btnResetFilters');
const searchInput = document.getElementById('searchInput');

// Appliquer les filtres
function appliquerFiltres() {
  const roleValue = filterRole ? filterRole.value : '';
  const departementValue = filterDepartement ? filterDepartement.value : '';
  const statutValue = filterStatut ? filterStatut.value : '';
  const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

  console.log('🔍 Filtres appliqués:', {
    role: roleValue,
    departement: departementValue,
    statut: statutValue,
    recherche: searchValue
  });

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const nom = row.cells[0]?.textContent.toLowerCase() || '';
    const email = row.cells[1]?.textContent.toLowerCase() || '';
    const role = row.cells[2]?.textContent.toLowerCase() || '';
    const departement = row.cells[3]?.textContent.toLowerCase() || '';
    const statut = row.cells[4]?.textContent.toLowerCase() || '';

    let visible = true;

    // Filtre par rôle
    if (roleValue && !role.includes(roleValue.toLowerCase())) {
      visible = false;
    }

    // Filtre par département
    if (departementValue && !departement.includes(departementValue.toLowerCase())) {
      visible = false;
    }

    // Filtre par statut
    if (statutValue === 'actif' && !statut.includes('actif')) {
      visible = false;
    } else if (statutValue === 'inactif' && !statut.includes('inactif')) {
      visible = false;
    }

    // Filtre par recherche
    if (searchValue && !nom.includes(searchValue) && !email.includes(searchValue)) {
      visible = false;
    }

    row.style.display = visible ? '' : 'none';
  });
}

// Écouter les changements de filtres
if (filterRole) filterRole.addEventListener('change', appliquerFiltres);
if (filterDepartement) filterDepartement.addEventListener('change', appliquerFiltres);
if (filterStatut) filterStatut.addEventListener('change', appliquerFiltres);
if (searchInput) searchInput.addEventListener('input', appliquerFiltres);

// Réinitialiser les filtres
if (btnResetFilters) {
  btnResetFilters.addEventListener('click', () => {
    if (filterRole) filterRole.value = '';
    if (filterDepartement) filterDepartement.value = '';
    if (filterStatut) filterStatut.value = '';
    if (searchInput) searchInput.value = '';
    appliquerFiltres();
  });
}

console.log('✅ Gestionnaire d\'utilisateurs SuperAdmin initialisé');
