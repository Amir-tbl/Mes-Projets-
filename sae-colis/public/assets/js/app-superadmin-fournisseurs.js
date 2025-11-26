// =============================================
// app-superadmin-fournisseurs.js
// Gestion des fournisseurs pour SuperAdmin
// =============================================

console.log('✅ app-superadmin-fournisseurs.js chargé');

// =========== GESTION MODALS ===========

// Modal Créer/Modifier Fournisseur
const modalFournisseur = document.getElementById('modalFournisseur');
const btnCreerFournisseur = document.getElementById('btnCreerFournisseur');
const btnCloseModalFournisseur = document.getElementById('btnCloseModalFournisseur');
const btnAnnulerFournisseur = document.getElementById('btnAnnulerFournisseur');
const btnSauvegarderFournisseur = document.getElementById('btnSauvegarderFournisseur');
const formFournisseur = document.getElementById('formFournisseur');
const modalFournisseurTitle = document.getElementById('modalFournisseurTitle');

// Modal Détails Fournisseur
const modalDetailsFournisseur = document.getElementById('modalDetailsFournisseur');
const btnCloseModalDetailsFournisseur = document.getElementById('btnCloseModalDetailsFournisseur');
const btnFermerDetailsFournisseur = document.getElementById('btnFermerDetailsFournisseur');
const modalDetailsFournisseurContent = document.getElementById('modalDetailsFournisseurContent');

let currentFournisseurIdEdit = null;

// =========== MODAL CRÉER/MODIFIER ===========

// Ouvrir le modal pour créer un fournisseur
if (btnCreerFournisseur) {
  btnCreerFournisseur.addEventListener('click', () => {
    currentFournisseurIdEdit = null;
    modalFournisseurTitle.textContent = 'Créer un fournisseur';
    formFournisseur.reset();
    modalFournisseur.hidden = false;
  });
}

// Fermer le modal
function fermerModalFournisseur() {
  modalFournisseur.hidden = true;
  formFournisseur.reset();
  currentFournisseurIdEdit = null;
}

if (btnCloseModalFournisseur) {
  btnCloseModalFournisseur.addEventListener('click', fermerModalFournisseur);
}

if (btnAnnulerFournisseur) {
  btnAnnulerFournisseur.addEventListener('click', fermerModalFournisseur);
}

// Fermer en cliquant sur l'overlay
if (modalFournisseur) {
  const overlay = modalFournisseur.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', fermerModalFournisseur);
  }
}

// Sauvegarder le fournisseur
if (btnSauvegarderFournisseur) {
  btnSauvegarderFournisseur.addEventListener('click', (e) => {
    e.preventDefault();

    if (!formFournisseur.checkValidity()) {
      formFournisseur.reportValidity();
      return;
    }

    const nom = document.getElementById('inputNom').value.trim();
    const categorie = document.getElementById('inputCategorie').value;
    const contactEmail = document.getElementById('inputContactEmail').value.trim();
    const telephone = document.getElementById('inputTelephone').value.trim();
    const adresse = document.getElementById('inputAdresse').value.trim();
    const siret = document.getElementById('inputSiret').value.trim();
    const tva = document.getElementById('inputTVA').value.trim();
    const siteWeb = document.getElementById('inputSiteWeb').value.trim();
    const notes = document.getElementById('inputNotes').value.trim();
    const actif = document.getElementById('inputActif').checked;

    if (currentFournisseurIdEdit) {
      // Mode édition
      console.log('✏️ Modification fournisseur:', {
        id: currentFournisseurIdEdit,
        nom,
        categorie,
        contactEmail,
        telephone,
        actif
      });
      alert(`✅ Fournisseur "${nom}" modifié avec succès !`);
    } else {
      // Mode création
      console.log('➕ Création fournisseur:', {
        nom,
        categorie,
        contactEmail,
        telephone,
        adresse,
        siret,
        tva,
        siteWeb,
        notes,
        actif
      });
      alert(`✅ Fournisseur "${nom}" créé avec succès !\n\nIl est maintenant disponible dans la liste des fournisseurs.`);
    }

    fermerModalFournisseur();
  });
}

// =========== MODAL DÉTAILS ===========

function fermerModalDetailsFournisseur() {
  if (modalDetailsFournisseur) {
    modalDetailsFournisseur.hidden = true;
  }
}

if (btnCloseModalDetailsFournisseur) {
  btnCloseModalDetailsFournisseur.addEventListener('click', fermerModalDetailsFournisseur);
}

if (btnFermerDetailsFournisseur) {
  btnFermerDetailsFournisseur.addEventListener('click', fermerModalDetailsFournisseur);
}

// Fermer en cliquant sur l'overlay
if (modalDetailsFournisseur) {
  const overlayDetails = modalDetailsFournisseur.querySelector('.modal-overlay');
  if (overlayDetails) {
    overlayDetails.addEventListener('click', fermerModalDetailsFournisseur);
  }
}

// =========== ACTIONS FOURNISSEURS ===========

// Voir les détails d'un fournisseur
window.voirFournisseur = function(fournisseurId) {
  console.log('👁️ Voir fournisseur:', fournisseurId);

  // Données de simulation
  const fournisseursData = {
    1: {
      nom: 'Dell France',
      categorie: 'Informatique',
      contactEmail: 'commercial@dell.fr',
      telephone: '01 55 94 70 00',
      adresse: '1 Avenue de la République, 93100 Montreuil',
      siret: '123 456 789 00012',
      tva: 'FR12345678901',
      siteWeb: 'https://www.dell.fr',
      notes: 'Fournisseur principal pour le matériel informatique. Conditions: 30 jours net.',
      actif: true,
      nbCommandes: 34,
      montantTotal: '345 680 €'
    }
  };

  const fournisseur = fournisseursData[fournisseurId] || {
    nom: 'Fournisseur Exemple',
    categorie: 'Informatique',
    contactEmail: 'contact@exemple.fr',
    telephone: '01 XX XX XX XX',
    adresse: 'Adresse non renseignée',
    siret: 'Non renseigné',
    tva: 'Non renseigné',
    siteWeb: 'Non renseigné',
    notes: 'Aucune note',
    actif: true,
    nbCommandes: 0,
    montantTotal: '0 €'
  };

  if (modalDetailsFournisseurContent) {
    modalDetailsFournisseurContent.innerHTML = `
      <div style="display: grid; gap: 24px;">
        <!-- En-tête -->
        <div style="padding: 16px; background: linear-gradient(135deg, #dc2626 0%, #e11d48 100%); border-radius: 8px; color: white;">
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${fournisseur.nom}</div>
          <div style="opacity: 0.9;">Catégorie: ${fournisseur.categorie}</div>
          <div style="margin-top: 8px;">
            <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-size: 14px;">
              ${fournisseur.actif ? '✅ Actif' : '🔒 Inactif'}
            </span>
          </div>
        </div>

        <!-- Informations de contact -->
        <div>
          <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📞 Contact</h4>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: grid; gap: 12px;">
            <div>
              <strong>Email:</strong><br>
              <a href="mailto:${fournisseur.contactEmail}" style="color: #3b82f6;">${fournisseur.contactEmail}</a>
            </div>
            <div>
              <strong>Téléphone:</strong><br>
              ${fournisseur.telephone}
            </div>
            <div>
              <strong>Site web:</strong><br>
              ${fournisseur.siteWeb !== 'Non renseigné' ? `<a href="${fournisseur.siteWeb}" target="_blank" style="color: #3b82f6;">${fournisseur.siteWeb}</a>` : fournisseur.siteWeb}
            </div>
          </div>
        </div>

        <!-- Informations légales -->
        <div>
          <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📋 Informations légales</h4>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: grid; gap: 12px;">
            <div>
              <strong>Adresse:</strong><br>
              ${fournisseur.adresse}
            </div>
            <div>
              <strong>SIRET:</strong> ${fournisseur.siret}
            </div>
            <div>
              <strong>N° TVA Intracommunautaire:</strong> ${fournisseur.tva}
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div>
          <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📊 Statistiques</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #1E2A52;">${fournisseur.nbCommandes}</div>
              <div style="font-size: 12px; color: #64748b;">Commandes</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: #1E2A52;">${fournisseur.montantTotal}</div>
              <div style="font-size: 12px; color: #64748b;">Montant total</div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        ${fournisseur.notes && fournisseur.notes !== 'Aucune note' ? `
        <div>
          <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📝 Notes</h4>
          <div style="background: #fffbeb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            ${fournisseur.notes}
          </div>
        </div>
        ` : ''}
      </div>
    `;

    modalDetailsFournisseur.hidden = false;
  }
};

// Modifier un fournisseur
window.modifierFournisseur = function(fournisseurId) {
  console.log('✏️ Modifier fournisseur:', fournisseurId);

  currentFournisseurIdEdit = fournisseurId;
  modalFournisseurTitle.textContent = 'Modifier le fournisseur';

  // Simuler le chargement des données
  const fournisseursData = {
    1: {
      nom: 'Dell France',
      categorie: 'informatique',
      contactEmail: 'commercial@dell.fr',
      telephone: '01 55 94 70 00',
      adresse: '1 Avenue de la République, 93100 Montreuil',
      siret: '123 456 789 00012',
      tva: 'FR12345678901',
      siteWeb: 'https://www.dell.fr',
      notes: 'Fournisseur principal pour le matériel informatique.',
      actif: true
    }
  };

  const fournisseur = fournisseursData[fournisseurId] || {
    nom: 'Exemple',
    categorie: 'informatique',
    contactEmail: 'contact@exemple.fr',
    telephone: '01 XX XX XX XX',
    adresse: '',
    siret: '',
    tva: '',
    siteWeb: '',
    notes: '',
    actif: true
  };

  // Remplir le formulaire
  document.getElementById('inputNom').value = fournisseur.nom;
  document.getElementById('inputCategorie').value = fournisseur.categorie;
  document.getElementById('inputContactEmail').value = fournisseur.contactEmail;
  document.getElementById('inputTelephone').value = fournisseur.telephone;
  document.getElementById('inputAdresse').value = fournisseur.adresse;
  document.getElementById('inputSiret').value = fournisseur.siret;
  document.getElementById('inputTVA').value = fournisseur.tva;
  document.getElementById('inputSiteWeb').value = fournisseur.siteWeb;
  document.getElementById('inputNotes').value = fournisseur.notes;
  document.getElementById('inputActif').checked = fournisseur.actif;

  modalFournisseur.hidden = false;
};

// Activer/Désactiver un fournisseur
window.toggleFournisseur = function(fournisseurId) {
  console.log('🔒 Toggle fournisseur:', fournisseurId);

  const confirmation = confirm('Voulez-vous vraiment changer le statut de ce fournisseur ?\n\nLes fournisseurs inactifs ne seront plus disponibles pour de nouvelles commandes.');

  if (confirmation) {
    alert('✅ Statut du fournisseur modifié avec succès !');
    console.log('Statut changé pour le fournisseur', fournisseurId);
  }
};

// =========== FILTRES ===========

const filterCategorie = document.getElementById('filterCategorie');
const filterStatut = document.getElementById('filterStatut');
const btnResetFilters = document.getElementById('btnResetFilters');
const searchInput = document.getElementById('searchInput');

// Appliquer les filtres
function appliquerFiltres() {
  const categorieValue = filterCategorie ? filterCategorie.value.toLowerCase() : '';
  const statutValue = filterStatut ? filterStatut.value : '';
  const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

  console.log('🔍 Filtres appliqués:', {
    categorie: categorieValue,
    statut: statutValue,
    recherche: searchValue
  });

  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const nom = row.cells[0]?.textContent.toLowerCase() || '';
    const categorie = row.cells[1]?.textContent.toLowerCase() || '';
    const email = row.cells[2]?.textContent.toLowerCase() || '';
    const statut = row.cells[5]?.textContent.toLowerCase() || '';

    let visible = true;

    // Filtre par catégorie
    if (categorieValue && !categorie.includes(categorieValue)) {
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

// Écouter les changements
if (filterCategorie) filterCategorie.addEventListener('change', appliquerFiltres);
if (filterStatut) filterStatut.addEventListener('change', appliquerFiltres);
if (searchInput) searchInput.addEventListener('input', appliquerFiltres);

// Réinitialiser les filtres
if (btnResetFilters) {
  btnResetFilters.addEventListener('click', () => {
    if (filterCategorie) filterCategorie.value = '';
    if (filterStatut) filterStatut.value = '';
    if (searchInput) searchInput.value = '';
    appliquerFiltres();
  });
}

console.log('✅ Gestionnaire de fournisseurs SuperAdmin initialisé');
