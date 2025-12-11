/* ================================================================
   SAE-Colis - Page Validation Commandes SF
   Validation et refus des commandes en attente
================================================================ */

ready(function() {
  console.log('Page Validation Commandes - Chargement...');

  /* ========== CHARGER LES COMMANDES RÉELLES ========== */
  function getCommandesAValider() {
    return window.CommandesManager.getByStatut('en_attente_validation');
  }

  /* ========== DONNÉES SIMULATION (BACKUP SI PAS DE VRAIES COMMANDES) ========== */
  // Calculer les dates pour avoir exactement les jours d'attente souhaités
  const aujourdhui = new Date();
  const dateIl7Jours = new Date(aujourdhui);
  dateIl7Jours.setDate(dateIl7Jours.getDate() - 7);
  const dateIl6Jours = new Date(aujourdhui);
  dateIl6Jours.setDate(dateIl6Jours.getDate() - 6);
  const dateIl4Jours = new Date(aujourdhui);
  dateIl4Jours.setDate(dateIl4Jours.getDate() - 4);
  const dateIl3Jours = new Date(aujourdhui);
  dateIl3Jours.setDate(dateIl3Jours.getDate() - 3);
  const dateIl2Jours = new Date(aujourdhui);
  dateIl2Jours.setDate(dateIl2Jours.getDate() - 2);

  const commandesAValiderSimulation = [
    // 🔴 URGENTE #1 - 7 jours d'attente
    {
      id: 1,
      numero: '#BC-2025-0234',
      demandeur: 'Butelle Franck',
      email: 'franck.butelle@univ-paris13.fr',
      departement: 'Informatique',
      fournisseur: 'LDLC',
      montantHT: 2041.67,
      montantTVA: 408.33,
      montantTTC: 2450.00,
      dateDemande: dateIl7Jours.toISOString().split('T')[0],
      joursAttente: 7,
      description: 'Équipement pour nouvelle salle de TP - Urgent pour début des cours',
      articles: [
        { designation: 'PC Portable Dell XPS 15', quantite: 1, prixUnit: 1800.00, tva: 20 },
        { designation: 'Souris sans fil Logitech', quantite: 2, prixUnit: 45.00, tva: 20 },
        { designation: 'Clavier mécanique', quantite: 1, prixUnit: 150.00, tva: 20 }
      ],
      piecesJointes: [
        { nom: 'devis-ldlc.pdf', type: 'pdf', taille: '180 KB', url: '/uploads/commandes/BC-2025-0234/devis-ldlc.pdf' },
        { nom: 'justificatif-besoin.pdf', type: 'pdf', taille: '95 KB', url: '/uploads/commandes/BC-2025-0234/justificatif-besoin.pdf' }
      ],
      urgent: true
    },
    // 🔴 URGENTE #2 - 6 jours d'attente
    {
      id: 2,
      numero: '#BC-2025-0235',
      demandeur: 'Martin Sophie',
      email: 'sophie.martin@univ-paris13.fr',
      departement: 'GEA',
      fournisseur: 'Dell',
      montantHT: 1575.00,
      montantTVA: 315.00,
      montantTTC: 1890.00,
      dateDemande: dateIl6Jours.toISOString().split('T')[0],
      joursAttente: 6,
      description: 'Remplacement écrans défectueux salle B204. Prioritaire pour TD de la semaine prochaine.',
      articles: [
        { designation: 'Écran Dell 27"', quantite: 3, prixUnit: 450.00, tva: 20 },
        { designation: 'Câble HDMI 2m', quantite: 3, prixUnit: 25.00, tva: 20 }
      ],
      urgent: true
    },
    // ✅ NORMALE #1 - 4 jours d'attente
    {
      id: 3,
      numero: '#BC-2025-0232',
      demandeur: 'Dupont Jean',
      email: 'jean.dupont@univ-paris13.fr',
      departement: 'TC',
      fournisseur: 'Amazon',
      montantHT: 708.33,
      montantTVA: 141.67,
      montantTTC: 850.00,
      dateDemande: dateIl4Jours.toISOString().split('T')[0],
      joursAttente: 4,
      description: 'Matériel pour visioconférences - Projet partenariat international',
      articles: [
        { designation: 'Webcam Logitech HD', quantite: 5, prixUnit: 80.00, tva: 20 },
        { designation: 'Casque USB', quantite: 5, prixUnit: 50.00, tva: 20 }
      ],
      piecesJointes: [
        { nom: 'specifications-visio.pdf', type: 'pdf', taille: '120 KB', url: '/uploads/commandes/BC-2025-0232/specifications-visio.pdf' }
      ],
      urgent: false
    },
    // ✅ NORMALE #2 - 3 jours d'attente
    {
      id: 4,
      numero: '#BC-2025-0236',
      demandeur: 'Leblanc Pierre',
      email: 'pierre.leblanc@univ-paris13.fr',
      departement: 'Informatique',
      fournisseur: 'HP',
      montantHT: 1250.00,
      montantTVA: 250.00,
      montantTTC: 1500.00,
      dateDemande: dateIl3Jours.toISOString().split('T')[0],
      joursAttente: 3,
      description: 'Imprimante pour secrétariat département Informatique',
      articles: [
        { designation: 'Imprimante HP LaserJet', quantite: 1, prixUnit: 1250.00, tva: 20 }
      ],
      urgent: false
    },
    // ✅ NORMALE #3 - 2 jours d'attente
    {
      id: 5,
      numero: '#BC-2025-0237',
      demandeur: 'Durand Marie',
      email: 'marie.durand@univ-paris13.fr',
      departement: 'GB',
      fournisseur: 'Apple',
      montantHT: 2666.67,
      montantTVA: 533.33,
      montantTTC: 3200.00,
      dateDemande: dateIl2Jours.toISOString().split('T')[0],
      joursAttente: 2,
      description: 'Tablettes pour projet pédagogique innovant GB - Expérimentation terrain',
      articles: [
        { designation: 'iPad Pro 12.9"', quantite: 2, prixUnit: 1200.00, tva: 20 },
        { designation: 'Apple Pencil', quantite: 2, prixUnit: 135.00, tva: 20 },
        { designation: 'Smart Keyboard', quantite: 2, prixUnit: 198.50, tva: 20 }
      ],
      urgent: false
    }
  ];

  // Charger les commandes réelles, sinon utiliser la simulation
  let commandesAValider = getCommandesAValider();
  if (commandesAValider.length === 0) {
    console.log('⚠️ Aucune commande réelle, utilisation de la simulation');
    commandesAValider = commandesAValiderSimulation;
  }

  let commandesFiltrees = [...commandesAValider];
  let commandeSelectionnee = null;

  /* ========== CHARGEMENT KPI ========== */
  function updateKPI() {
    const total = commandesFiltrees.length;
    const urgent = commandesFiltrees.filter(c => c.urgent).length;
    const montantTotal = commandesFiltrees.reduce((sum, c) => sum + c.montantTTC, 0);

    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiUrgent').textContent = urgent;
    document.getElementById('kpiMontantTotal').textContent = formatEuro(montantTotal);
  }

  /* ========== CHARGEMENT TABLEAU ========== */
  function loadTableau() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (commandesFiltrees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#999;">Aucune commande à valider</td></tr>';
      return;
    }

    commandesFiltrees.forEach(cmd => {
      const tr = document.createElement('tr');

      // Calculer jours d'attente
      const dateCreation = new Date(cmd.dateCreation || cmd.dateDemande || cmd.dateCommande);
      const aujourdhui = new Date();
      const joursAttente = Math.ceil((aujourdhui - dateCreation) / (1000 * 60 * 60 * 24));
      const urgent = joursAttente > 5 || cmd.urgence;

      if (urgent) {
        tr.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
      }

      // Adapter au format des vraies commandes
      const numero = cmd.numeroCommande || cmd.numero;
      const demandeur = cmd.demandeur?.nom || cmd.demandeur;
      const departement = cmd.demandeur?.departement || cmd.departement;
      const fournisseur = cmd.fournisseur?.nom || cmd.fournisseur;
      const montantTTC = cmd.montantTTC;
      const dateAffichage = cmd.dateCreation || cmd.dateDemande || cmd.dateCommande;

      const nbPJ = cmd.piecesJointes?.length || 0;

      tr.innerHTML = `
        <td><strong>${numero}</strong></td>
        <td>${demandeur}</td>
        <td>${departement}</td>
        <td>${fournisseur}</td>
        <td><strong>${formatEuro(montantTTC)}</strong></td>
        <td>${formatDate(dateAffichage)}</td>
        <td>
          <span style="color: ${urgent ? '#EF4444' : '#666'}; font-weight: ${urgent ? '600' : '400'};">
            ${joursAttente}j ${urgent ? '⚠️' : ''}
          </span>
        </td>
        <td style="text-align:center;">
          ${genererBadgePiecesJointes(nbPJ)}
        </td>
        <td style="text-align:right; padding-right:16px;">
          <button class="btn-ghost btn-sm" data-id="${cmd.id}">Consulter</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Événements
    tbody.querySelectorAll('.btn-sm').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        ouvrirModal(id);
      });
    });

    updateKPI();
  }

  /* ========== FILTRES ========== */
  function appliquerFiltres() {
    const filterDept = document.getElementById('filterDepartement').value.toLowerCase();
    const filterMontant = document.getElementById('filterMontant').value;
    const filterFourn = document.getElementById('filterFournisseur').value;

    commandesFiltrees = commandesAValider.filter(cmd => {
      // Filtre département
      if (filterDept && cmd.departement.toLowerCase() !== filterDept) return false;

      // Filtre montant
      if (filterMontant) {
        if (filterMontant === '0-500' && cmd.montantTTC > 500) return false;
        if (filterMontant === '500-1000' && (cmd.montantTTC < 500 || cmd.montantTTC > 1000)) return false;
        if (filterMontant === '1000-2500' && (cmd.montantTTC < 1000 || cmd.montantTTC > 2500)) return false;
        if (filterMontant === '2500+' && cmd.montantTTC < 2500) return false;
      }

      // Filtre fournisseur
      if (filterFourn && cmd.fournisseur !== filterFourn) return false;

      return true;
    });

    loadTableau();
  }

  document.getElementById('filterDepartement').addEventListener('change', appliquerFiltres);
  document.getElementById('filterMontant').addEventListener('change', appliquerFiltres);
  document.getElementById('filterFournisseur').addEventListener('change', appliquerFiltres);

  document.getElementById('btnResetFilters').addEventListener('click', () => {
    document.getElementById('filterDepartement').value = '';
    document.getElementById('filterMontant').value = '';
    document.getElementById('filterFournisseur').value = '';
    appliquerFiltres();
  });

  /* ========== RECHERCHE ========== */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const rows = document.querySelectorAll('#tableBody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  /* ========== MODAL ========== */
  function ouvrirModal(id) {
    commandeSelectionnee = commandesAValider.find(c => c.id === id);
    if (!commandeSelectionnee) return;

    const modal = document.getElementById('modalValidation');
    const details = document.getElementById('modalCommandeDetails');

    // Adapter au format (simulation ou vraie commande)
    const numero = commandeSelectionnee.numeroCommande || commandeSelectionnee.numero;
    const demandeur = commandeSelectionnee.demandeur?.nom || commandeSelectionnee.demandeur;
    const email = commandeSelectionnee.demandeur?.email || commandeSelectionnee.email;
    const departement = commandeSelectionnee.demandeur?.departement || commandeSelectionnee.departement;
    const fournisseur = commandeSelectionnee.fournisseur?.nom || commandeSelectionnee.fournisseur;
    const dateAffichage = commandeSelectionnee.dateCreation || commandeSelectionnee.dateDemande || commandeSelectionnee.dateCommande;

    // Calculer jours d'attente
    const dateCreation = new Date(dateAffichage);
    const aujourdhui = new Date();
    const joursAttente = Math.ceil((aujourdhui - dateCreation) / (1000 * 60 * 60 * 24));
    const urgent = joursAttente > 5 || commandeSelectionnee.urgence;

    // Construire les détails des articles
    let articlesHTML = commandeSelectionnee.articles.map(art => {
      const designation = art.designation;
      const quantite = art.quantite;
      const prixUnit = art.prixUnitaire || art.prixUnit;
      const tva = art.tva;
      const totalTTC = art.totalTTC || (quantite * prixUnit * (1 + tva / 100));

      return `
      <tr>
        <td>${designation}</td>
        <td style="text-align:center;">${quantite}</td>
        <td style="text-align:right;">${formatEuro(prixUnit)}</td>
        <td style="text-align:center;">${tva}%</td>
        <td style="text-align:right;"><strong>${formatEuro(totalTTC)}</strong></td>
      </tr>
    `}).join('');

    // Section description (si présente)
    const descriptionHTML = commandeSelectionnee.description ? `
      <div style="margin-top: 16px; padding: 16px; background: #fffbea; border-left: 4px solid #fbbf24; border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #1E2A52;">📝 Description de la commande</div>
        <div style="color: #666; white-space: pre-wrap;">${commandeSelectionnee.description}</div>
      </div>
    ` : '';

    details.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">N° Commande</div>
          <div style="font-weight: 600;">${numero}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Demandeur</div>
          <div style="font-weight: 600;">${demandeur}</div>
          <div style="font-size: 12px; color: #666;">${email}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Département</div>
          <div style="font-weight: 600;">${departement}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Fournisseur</div>
          <div style="font-weight: 600;">${fournisseur}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Date demande</div>
          <div style="font-weight: 600;">${formatDate(dateAffichage)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Attente</div>
          <div style="font-weight: 600; color: ${urgent ? '#EF4444' : '#333'};">${joursAttente} jours</div>
        </div>
      </div>

      ${descriptionHTML}

      <h4 style="margin: 20px 0 12px 0;">Articles commandés</h4>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f1f3f5;">
            <tr>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Désignation</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qté</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Prix unit. HT</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">TVA</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${articlesHTML}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 600;">
        <div>
          <div>Montant HT: <span style="color: #1E2A52;">${formatEuro(commandeSelectionnee.montantHT)}</span></div>
          <div style="margin-top: 4px;">TVA: <span style="color: #1E2A52;">${formatEuro(commandeSelectionnee.montantTVA)}</span></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; color: #1E2A52;">Total TTC: ${formatEuro(commandeSelectionnee.montantTTC)}</div>
        </div>
      </div>
    `;

    modal.removeAttribute('hidden');
  }

  function fermerModal() {
    document.getElementById('modalValidation').setAttribute('hidden', '');
    document.getElementById('commentaire').value = '';
    document.getElementById('bonCommande').value = '';
    document.getElementById('bonCommandeError').style.display = 'none';
    document.getElementById('bonCommandeInfo').style.display = 'none';
    commandeSelectionnee = null;
  }

  document.getElementById('btnCloseModal').addEventListener('click', fermerModal);
  document.getElementById('btnAnnuler').addEventListener('click', fermerModal);

  /* ========== GESTION DU BON DE COMMANDE ========== */
  const bonCommandeInput = document.getElementById('bonCommande');
  const bonCommandeError = document.getElementById('bonCommandeError');
  const bonCommandeInfo = document.getElementById('bonCommandeInfo');
  const bonCommandeNom = document.getElementById('bonCommandeNom');

  bonCommandeInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      const fichier = this.files[0];
      bonCommandeNom.textContent = fichier.name;
      bonCommandeInfo.style.display = 'block';
      bonCommandeError.style.display = 'none';
      // Retirer la bordure rouge si le fichier est sélectionné
      this.style.border = '2px dashed #ddd';
    } else {
      bonCommandeInfo.style.display = 'none';
    }
  });

  document.getElementById('btnValider').addEventListener('click', () => {
    if (!commandeSelectionnee) return;

    // VÉRIFICATION OBLIGATOIRE : Bon de commande doit être joint
    const bonCommandeInput = document.getElementById('bonCommande');
    if (!bonCommandeInput.files || bonCommandeInput.files.length === 0) {
      document.getElementById('bonCommandeError').style.display = 'block';
      bonCommandeInput.style.border = '2px solid #EF4444';
      bonCommandeInput.focus();
      return;
    }

    const fichierBonCommande = bonCommandeInput.files[0];
    const commentaire = document.getElementById('commentaire').value;
    const numero = commandeSelectionnee.numeroCommande || commandeSelectionnee.numero;

    if (confirm(`Confirmer la validation de la commande ${numero} ?\n\nBon de commande joint : ${fichierBonCommande.name}\n\nLe statut passera à "En attente de signature" et le Directeur sera notifié.`)) {
      // Ajouter le bon de commande aux pièces jointes
      if (!commandeSelectionnee.piecesJointes) {
        commandeSelectionnee.piecesJointes = [];
      }
      commandeSelectionnee.piecesJointes.push({
        nom: fichierBonCommande.name,
        type: fichierBonCommande.type || 'application/pdf',
        taille: (fichierBonCommande.size / 1024).toFixed(2) + ' KB',
        url: '/uploads/bons-commande/' + Date.now() + '-' + fichierBonCommande.name,
        dateAjout: new Date().toISOString(),
        ajoutePar: 'SF Marie Dubois' // TODO: utilisateur réel
      });

      // Utiliser CommandesManager pour mettre à jour le statut
      const result = window.CommandesManager.updateStatut(
        commandeSelectionnee.id,
        'validee',
        {
          utilisateur: 'SF Marie Dubois', // TODO: utilisateur réel
          commentaire: commentaire || 'Commande validée par le SF',
          bonCommande: fichierBonCommande.name
        }
      );

      if (result.success) {
        // Recharger les commandes
        commandesAValider = getCommandesAValider();
        if (commandesAValider.length === 0) {
          commandesAValider = commandesAValiderSimulation;
        }

        fermerModal();
        appliquerFiltres();

        showToast('✅ Commande validée avec succès', 'success');
      } else {
        alert('❌ Erreur lors de la validation');
      }
    }
  });

  document.getElementById('btnRefuser').addEventListener('click', () => {
    if (!commandeSelectionnee) return;

    const commentaire = document.getElementById('commentaire').value;
    if (!commentaire.trim()) {
      alert('⚠️ Un motif de refus est obligatoire.');
      return;
    }

    const numero = commandeSelectionnee.numeroCommande || commandeSelectionnee.numero;

    if (confirm(`Confirmer le refus de la commande ${numero} ?\n\nCette action est irréversible.`)) {
      // Utiliser CommandesManager pour mettre à jour le statut
      const result = window.CommandesManager.updateStatut(
        commandeSelectionnee.id,
        'refusee',
        {
          utilisateur: 'SF Marie Dubois', // TODO: utilisateur réel
          commentaire: commentaire
        }
      );

      if (result.success) {
        // Recharger les commandes
        commandesAValider = getCommandesAValider();
        if (commandesAValider.length === 0) {
          commandesAValider = commandesAValiderSimulation;
        }

        fermerModal();
        appliquerFiltres();

        showToast('❌ Commande refusée', 'error');
      } else {
        alert('❌ Erreur lors du refus');
      }
    }
  });

  /* ========== HELPERS ========== */
  function formatEuro(montant) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${type === 'success' ? '#2BAE66' : '#EF4444'};
      color: white; padding: 16px 24px; border-radius: 8px;
      font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,.3);
      z-index: 9999; animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ========== CHARGEMENT INITIAL ========== */
  loadTableau();

  console.log('✅ Page Validation Commandes chargée avec succès');
});
