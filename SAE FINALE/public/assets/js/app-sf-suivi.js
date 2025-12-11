/* ================================================================
   SAE-Colis - Page Suivi Commandes SF
   Suivi complet de toutes les commandes
================================================================ */

ready(function() {
  console.log('Page Suivi Commandes - Chargement...');

  /* ========== DONNÉES SIMULATION ========== */
  const commandesData = [
    {
      id: 1, numero: '#BC-2025-0234', demandeur: 'Butelle Franck', departement: 'Informatique',
      fournisseur: 'LDLC', montantTTC: 2450.00, dateCreation: '2025-01-05',
      statut: 'en_attente_validation', statutLabel: 'En attente validation', statutClass: 'b-grey',
      piecesJointes: [
        { nom: 'devis-ldlc.pdf', type: 'pdf', taille: '180 KB' },
        { nom: 'justificatif.pdf', type: 'pdf', taille: '95 KB' }
      ],
      timeline: [
        { date: '2025-01-05', statut: 'Créée', user: 'Butelle Franck' }
      ]
    },
    {
      id: 2, numero: '#BC-2025-0230', demandeur: 'Durand Marie', departement: 'GEA',
      fournisseur: 'HP', montantTTC: 1650.00, dateCreation: '2025-01-08',
      statut: 'bc_envoye', statutLabel: 'BC envoyé', statutClass: 'b-green',
      piecesJointes: [
        { nom: 'bon-commande.pdf', type: 'pdf', taille: '245 KB' }
      ],
      timeline: [
        { date: '2025-01-08', statut: 'Créée', user: 'Durand Marie' },
        { date: '2025-01-08', statut: 'Validée', user: 'SF' },
        { date: '2025-01-09', statut: 'Signée', user: 'Directeur' },
        { date: '2025-01-10', statut: 'BC envoyé', user: 'SF' }
      ]
    },
    {
      id: 3, numero: '#BC-2025-0228', demandeur: 'Bernard Lucas', departement: 'TC',
      fournisseur: 'Amazon', montantTTC: 890.00, dateCreation: '2025-01-03',
      statut: 'retard', statutLabel: 'En retard', statutClass: 'b-red',
      timeline: [
        { date: '2025-01-03', statut: 'Créée', user: 'Bernard Lucas' },
        { date: '2025-01-03', statut: 'Validée', user: 'SF' },
        { date: '2025-01-04', statut: 'Signée', user: 'Directeur' },
        { date: '2025-01-04', statut: 'BC envoyé', user: 'SF' },
        { date: '2025-01-05', statut: 'Expédiée', user: 'Amazon' }
      ]
    },
    {
      id: 4, numero: '#BC-2025-0225', demandeur: 'Martin Sophie', departement: 'Informatique',
      fournisseur: 'Dell', montantTTC: 3200.00, dateCreation: '2024-12-28',
      statut: 'livree', statutLabel: 'Livrée', statutClass: 'b-green',
      timeline: [
        { date: '2024-12-28', statut: 'Créée', user: 'Martin Sophie' },
        { date: '2024-12-28', statut: 'Validée', user: 'SF' },
        { date: '2024-12-29', statut: 'Signée', user: 'Directeur' },
        { date: '2024-12-30', statut: 'BC envoyé', user: 'SF' },
        { date: '2025-01-03', statut: 'Expédiée', user: 'Dell' },
        { date: '2025-01-08', statut: 'Reçue IUT', user: 'CRIT' },
        { date: '2025-01-09', statut: 'Livrée', user: 'CRIT' }
      ]
    },
    {
      id: 5, numero: '#BC-2025-0223', demandeur: 'Leblanc Pierre', departement: 'GB',
      fournisseur: 'Apple', montantTTC: 4800.00, dateCreation: '2024-12-26',
      statut: 'a_payer', statutLabel: 'À payer', statutClass: 'b-blue',
      timeline: [
        { date: '2024-12-26', statut: 'Créée', user: 'Leblanc Pierre' },
        { date: '2024-12-27', statut: 'Validée', user: 'SF' },
        { date: '2024-12-28', statut: 'Signée', user: 'Directeur' },
        { date: '2024-12-29', statut: 'BC envoyé', user: 'SF' },
        { date: '2025-01-02', statut: 'Expédiée', user: 'Apple' },
        { date: '2025-01-06', statut: 'Reçue IUT', user: 'CRIT' },
        { date: '2025-01-07', statut: 'Livrée', user: 'CRIT' }
      ]
    },
    {
      id: 6, numero: '#BC-2025-0220', demandeur: 'Dupont Jean', departement: 'Administration',
      fournisseur: 'LDLC', montantTTC: 1250.00, dateCreation: '2024-12-22',
      statut: 'payee', statutLabel: 'Payée', statutClass: 'b-green',
      timeline: [
        { date: '2024-12-22', statut: 'Créée', user: 'Dupont Jean' },
        { date: '2024-12-22', statut: 'Validée', user: 'SF' },
        { date: '2024-12-23', statut: 'Signée', user: 'Directeur' },
        { date: '2024-12-24', statut: 'BC envoyé', user: 'SF' },
        { date: '2024-12-28', statut: 'Expédiée', user: 'LDLC' },
        { date: '2025-01-02', statut: 'Reçue IUT', user: 'CRIT' },
        { date: '2025-01-03', statut: 'Livrée', user: 'CRIT' },
        { date: '2025-01-10', statut: 'Payée', user: 'SF' }
      ]
    }
  ];

  let commandesFiltrees = [...commandesData];
  let commandeSelectionnee = null;

  /* ========== CHARGEMENT KPI ========== */
  function updateKPI() {
    const total = commandesFiltrees.length;
    const enCours = commandesFiltrees.filter(c =>
      ['en_attente_validation', 'en_attente_signature', 'bc_envoye', 'expediee', 'recue_iut'].includes(c.statut)
    ).length;
    const livrees = commandesFiltrees.filter(c => c.statut === 'livree' || c.statut === 'payee').length;
    const retards = commandesFiltrees.filter(c => c.statut === 'retard').length;
    const aPayer = commandesFiltrees.filter(c => c.statut === 'a_payer').length;

    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiEnCours').textContent = enCours;
    document.getElementById('kpiLivrees').textContent = livrees;
    document.getElementById('kpiRetards').textContent = retards;
    document.getElementById('kpiAPayer').textContent = aPayer;
  }

  /* ========== CHARGEMENT TABLEAU ========== */
  function loadTableau() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (commandesFiltrees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#999;">Aucune commande trouvée</td></tr>';
      return;
    }

    commandesFiltrees.forEach(cmd => {
      const tr = document.createElement('tr');
      const nbPJ = cmd.piecesJointes?.length || 0;

      tr.innerHTML = `
        <td><strong>${cmd.numero}</strong></td>
        <td>${cmd.demandeur}</td>
        <td>${cmd.departement}</td>
        <td>${cmd.fournisseur}</td>
        <td><strong>${formatEuro(cmd.montantTTC)}</strong></td>
        <td>${formatDate(cmd.dateCreation)}</td>
        <td><span class="badge ${cmd.statutClass}">${cmd.statutLabel}</span></td>
        <td style="text-align:center;">
          ${genererBadgePiecesJointes(nbPJ)}
        </td>
        <td style="text-align:right; padding-right:16px;">
          <button class="btn-ghost btn-sm" data-id="${cmd.id}">Détails</button>
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
    const filterStatut = document.getElementById('filterStatut').value;
    const filterDateDebut = document.getElementById('filterDateDebut').value;
    const filterDateFin = document.getElementById('filterDateFin').value;
    const filterDept = document.getElementById('filterDepartement').value.toLowerCase();

    commandesFiltrees = commandesData.filter(cmd => {
      // Filtre statut
      if (filterStatut && cmd.statut !== filterStatut) return false;

      // Filtre dates
      if (filterDateDebut && cmd.dateCreation < filterDateDebut) return false;
      if (filterDateFin && cmd.dateCreation > filterDateFin) return false;

      // Filtre département
      if (filterDept && cmd.departement.toLowerCase() !== filterDept) return false;

      return true;
    });

    loadTableau();
  }

  document.getElementById('filterStatut').addEventListener('change', appliquerFiltres);
  document.getElementById('filterDateDebut').addEventListener('change', appliquerFiltres);
  document.getElementById('filterDateFin').addEventListener('change', appliquerFiltres);
  document.getElementById('filterDepartement').addEventListener('change', appliquerFiltres);

  document.getElementById('btnResetFilters').addEventListener('click', () => {
    document.getElementById('filterStatut').value = '';
    document.getElementById('filterDateDebut').value = '';
    document.getElementById('filterDateFin').value = '';
    document.getElementById('filterDepartement').value = '';
    appliquerFiltres();
  });

  /* ========== EXPORT CSV ========== */
  document.getElementById('btnExport').addEventListener('click', () => {
    let csv = 'N° Commande;Demandeur;Département;Fournisseur;Montant TTC;Date création;Statut;PJ\n';
    commandesFiltrees.forEach(cmd => {
      const nbPJ = cmd.piecesJointes?.length || 0;
      csv += `${cmd.numero};${cmd.demandeur};${cmd.departement};${cmd.fournisseur};${cmd.montantTTC};${cmd.dateCreation};${cmd.statutLabel};${nbPJ}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('✅ Export CSV réussi', 'success');
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
    commandeSelectionnee = commandesData.find(c => c.id === id);
    if (!commandeSelectionnee) return;

    const modal = document.getElementById('modalDetails');
    const details = document.getElementById('modalCommandeDetails');

    // Timeline HTML
    let timelineHTML = commandeSelectionnee.timeline.map((item, index) => `
      <div class="timeline-item" style="display: flex; gap: 16px; margin-bottom: 16px;">
        <div style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
          ${index + 1}
        </div>
        <div style="flex: 1; padding-bottom: 16px; ${index < commandeSelectionnee.timeline.length - 1 ? 'border-left: 2px solid #e5e7eb; margin-left: 16px; padding-left: 16px;' : ''}">
          <div style="font-weight: 600; color: var(--navy);">${item.statut}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">${formatDate(item.date)} — ${item.user}</div>
        </div>
      </div>
    `).join('');

    details.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">N° Commande</div>
          <div style="font-weight: 600;">${commandeSelectionnee.numero}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Demandeur</div>
          <div style="font-weight: 600;">${commandeSelectionnee.demandeur}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Département</div>
          <div style="font-weight: 600;">${commandeSelectionnee.departement}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Fournisseur</div>
          <div style="font-weight: 600;">${commandeSelectionnee.fournisseur}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Montant TTC</div>
          <div style="font-weight: 600; color: var(--accent); font-size: 18px;">${formatEuro(commandeSelectionnee.montantTTC)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Statut actuel</div>
          <span class="badge ${commandeSelectionnee.statutClass}">${commandeSelectionnee.statutLabel}</span>
        </div>
      </div>
    `;

    document.getElementById('timeline').innerHTML = timelineHTML;

    modal.removeAttribute('hidden');
  }

  function fermerModal() {
    document.getElementById('modalDetails').setAttribute('hidden', '');
    commandeSelectionnee = null;
  }

  document.getElementById('btnCloseModal').addEventListener('click', fermerModal);
  document.getElementById('btnFermer').addEventListener('click', fermerModal);

  // Actions rapides
  document.getElementById('btnEnvoyerBCFournisseur').addEventListener('click', () => {
    if (!commandeSelectionnee) return;

    // Vérifier que la commande est bien signée
    if (commandeSelectionnee.statut !== 'signee' && commandeSelectionnee.statut !=='en_attente_signature') {
      alert('⚠️ Cette commande doit être signée avant d\'envoyer le BC au fournisseur.');
      return;
    }

    ouvrirModalEnvoiBC();
  });

  document.getElementById('btnRelancerFournisseur').addEventListener('click', () => {
    if (!commandeSelectionnee) return;

    // Vérifier que le BC a été envoyé
    if (commandeSelectionnee.statut !== 'bc_envoye' && commandeSelectionnee.statut !== 'expediee') {
      alert('⚠️ Le BC n\'a pas encore été envoyé au fournisseur.');
      return;
    }

    if (confirm(`🔔 Envoyer un email de relance au fournisseur ${commandeSelectionnee.fournisseur} pour la commande ${commandeSelectionnee.numero} ?\n\nUn email de rappel sera envoyé.`)) {
      // Simuler l'envoi de relance
      showToast('✅ Email de relance envoyé au fournisseur', 'success');

      // Ajouter l'événement dans la timeline
      commandeSelectionnee.timeline.push({
        date: new Date().toISOString().split('T')[0],
        statut: 'Relance envoyée',
        user: 'SF'
      });

      // Recharger le modal avec la nouvelle timeline
      ouvrirModal(commandeSelectionnee.id);
    }
  });

  document.getElementById('btnMarquerExpediee').addEventListener('click', () => {
    if (!commandeSelectionnee) return;
    alert('🚧 Fonctionnalité en développement\n\nMarquer comme expédiée pour ' + commandeSelectionnee.numero);
  });

  document.getElementById('btnDeclencherPaiement').addEventListener('click', () => {
    if (!commandeSelectionnee) return;
    if (commandeSelectionnee.statut !== 'a_payer' && commandeSelectionnee.statut !== 'livree') {
      alert('⚠️ Cette commande n\'est pas encore éligible au paiement.');
      return;
    }
    ouvrirModalPaiement();
  });

  /* ========== MODAL ENVOI BC ========== */
  function ouvrirModalEnvoiBC() {
    if (!commandeSelectionnee) return;

    const modal = document.getElementById('modalEnvoiBC');
    const details = document.getElementById('modalEnvoiDetails');

    // Récupérer les informations du fournisseur (simulation - en réalité viendrait de la BD)
    const fournisseurs = {
      'LDLC': 'commandes@ldlc.com',
      'Dell': 'orders@dell.fr',
      'HP': 'france.commandes@hp.com',
      'Amazon': 'business@amazon.fr',
      'Apple': 'business@apple.com'
    };

    const emailFournisseur = fournisseurs[commandeSelectionnee.fournisseur] || 'contact@fournisseur.fr';

    // Pré-remplir le message
    const messageTemplate = `Bonjour,

Vous trouverez ci-joint le bon de commande n°${commandeSelectionnee.numero} signé par notre Directeur.

Détails de la commande :
• Montant TTC : ${formatEuro(commandeSelectionnee.montantTTC)}
• Date de commande : ${formatDate(commandeSelectionnee.dateCreation)}
• Département demandeur : ${commandeSelectionnee.departement}

Merci de nous confirmer la bonne réception de ce bon de commande et de nous indiquer les délais de livraison.

Cordialement,
Service Financier
IUT de Villetaneuse
Université Sorbonne Paris Nord`;

    // Afficher les détails
    details.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px; color: #1E2A52;">📋 Commande ${commandeSelectionnee.numero}</div>
      <div style="color: #475569; font-size: 14px;">
        Fournisseur : <strong>${commandeSelectionnee.fournisseur}</strong><br>
        Montant TTC : <strong>${formatEuro(commandeSelectionnee.montantTTC)}</strong>
      </div>
    `;

    // Pré-remplir les champs
    document.getElementById('emailFournisseur').value = emailFournisseur;
    document.getElementById('messageEmail').value = messageTemplate;

    modal.removeAttribute('hidden');
  }

  function fermerModalEnvoiBC() {
    document.getElementById('modalEnvoiBC').setAttribute('hidden', '');
    document.getElementById('emailFournisseur').value = '';
    document.getElementById('objetEmail').value = 'Bon de commande signé - IUT Villetaneuse';
    document.getElementById('messageEmail').value = '';
  }

  function envoyerBCFournisseur() {
    if (!commandeSelectionnee) return;

    const emailFournisseur = document.getElementById('emailFournisseur').value;
    const objetEmail = document.getElementById('objetEmail').value;
    const messageEmail = document.getElementById('messageEmail').value;

    // Validation
    if (!emailFournisseur || !emailFournisseur.includes('@')) {
      alert('⚠️ Veuillez saisir une adresse email valide pour le fournisseur.');
      document.getElementById('emailFournisseur').focus();
      return;
    }

    if (!messageEmail.trim()) {
      alert('⚠️ Le message ne peut pas être vide.');
      document.getElementById('messageEmail').focus();
      return;
    }

    // Confirmation
    if (!confirm(`📧 Confirmer l'envoi du BC au fournisseur ?\n\nDestinataire : ${emailFournisseur}\nObjet : ${objetEmail}\n\nLe BC signé sera envoyé en pièce jointe.`)) {
      return;
    }

    // Simuler l'envoi d'email (en production, appel API backend)
    console.log('=== ENVOI EMAIL BC AU FOURNISSEUR ===');
    console.log('À :', emailFournisseur);
    console.log('Objet :', objetEmail);
    console.log('Message :', messageEmail);
    console.log('Pièce jointe : BC-' + commandeSelectionnee.numero + '-SIGNE.pdf');
    console.log('=====================================');

    // Mettre à jour le statut de la commande
    commandeSelectionnee.statut = 'bc_envoye';
    commandeSelectionnee.statutLabel = 'BC envoyé';
    commandeSelectionnee.statutClass = 'b-green';

    // Ajouter l'événement dans la timeline
    commandeSelectionnee.timeline.push({
      date: new Date().toISOString().split('T')[0],
      statut: 'BC envoyé au fournisseur',
      user: 'SF - Service Financier',
      email: emailFournisseur
    });

    // Ajouter les métadonnées d'envoi
    commandeSelectionnee.dateEnvoiBC = new Date().toISOString();
    commandeSelectionnee.emailEnvoi = {
      destinataire: emailFournisseur,
      objet: objetEmail,
      message: messageEmail,
      dateEnvoi: new Date().toISOString()
    };

    // Fermer les modals
    fermerModalEnvoiBC();
    fermerModal();

    // Message de succès
    showToast(`✅ BC envoyé à ${emailFournisseur} avec succès !`, 'success');

    // Recharger le tableau
    loadTableau();
  }

  // Événements modal envoi BC
  document.getElementById('btnCloseModalEnvoi').addEventListener('click', fermerModalEnvoiBC);
  document.getElementById('btnAnnulerEnvoi').addEventListener('click', fermerModalEnvoiBC);
  document.getElementById('btnConfirmerEnvoi').addEventListener('click', envoyerBCFournisseur);

  /* ========== MODAL PAIEMENT ========== */
  function ouvrirModalPaiement() {
    if (!commandeSelectionnee) return;

    const modal = document.getElementById('modalPaiement');
    const resume = document.getElementById('paiementResume');
    const infosFournisseur = document.getElementById('paiementInfosFournisseur');

    // Infos bancaires des fournisseurs (simulation - en réalité viendrait de la BD)
    const fournisseursInfos = {
      'LDLC': {
        nom: 'LDLC.com SAS',
        email: 'commandes@ldlc.com',
        telephone: '+33 4 27 46 24 00',
        adresse: '2 rue des Érables, 69760 Limonest, France',
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'BNPAFRPPXXX',
        siret: '123 456 789 00012'
      },
      'Dell': {
        nom: 'Dell France SAS',
        email: 'orders@dell.fr',
        telephone: '+33 1 55 94 71 00',
        adresse: '34 avenue de l\'Europe, 78140 Vélizy-Villacoublay, France',
        iban: 'FR76 9876 5432 1098 7654 3210 987',
        bic: 'SOGEFRPPXXX',
        siret: '987 654 321 00098'
      },
      'HP': {
        nom: 'HP France SAS',
        email: 'france.commandes@hp.com',
        telephone: '+33 1 49 78 45 00',
        adresse: '80 rue Camille Desmoulins, 92130 Issy-les-Moulineaux, France',
        iban: 'FR76 1111 2222 3333 4444 5555 666',
        bic: 'CEPAFRPP751',
        siret: '111 222 333 00044'
      },
      'Amazon': {
        nom: 'Amazon France Services SAS',
        email: 'business@amazon.fr',
        telephone: '+33 1 74 31 00 00',
        adresse: '67 boulevard du Général Leclerc, 92110 Clichy, France',
        iban: 'FR76 5555 6666 7777 8888 9999 000',
        bic: 'AGRIFRPPXXX',
        siret: '555 666 777 00088'
      },
      'Apple': {
        nom: 'Apple France SARL',
        email: 'business@apple.com',
        telephone: '+33 1 76 62 60 60',
        adresse: '19-21 boulevard Malesherbes, 75008 Paris, France',
        iban: 'FR76 7777 8888 9999 0000 1111 222',
        bic: 'CMCIFRPPXXX',
        siret: '777 888 999 00011'
      }
    };

    const fournisseurData = fournisseursInfos[commandeSelectionnee.fournisseur] || {
      nom: commandeSelectionnee.fournisseur,
      email: 'contact@fournisseur.fr',
      telephone: 'N/A',
      adresse: 'Adresse non renseignée',
      iban: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX',
      bic: 'XXXXXXXXXX',
      siret: 'XXX XXX XXX XXXXX'
    };

    // Résumé de la commande
    resume.innerHTML = `
      <div style="display: grid; gap: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span>N° Commande:</span>
          <strong>${commandeSelectionnee.numero}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Fournisseur:</span>
          <strong>${commandeSelectionnee.fournisseur}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Date commande:</span>
          <span>${formatDate(commandeSelectionnee.dateCreation)}</span>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #ddd;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; color: #1E2A52;">
          <strong>Montant à payer TTC:</strong>
          <strong>${formatEuro(commandeSelectionnee.montantTTC)}</strong>
        </div>
      </div>
    `;

    // Informations bancaires du fournisseur avec bouton copier
    infosFournisseur.innerHTML = `
      <div style="display: grid; gap: 12px;">
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Raison sociale</div>
          <div style="font-weight: 600; color: #1E2A52;">${fournisseurData.nom}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">SIRET</div>
          <div style="font-weight: 600; color: #1E2A52;">${fournisseurData.siret}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Adresse</div>
          <div style="font-weight: 600; color: #1E2A52;">${fournisseurData.adresse}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Email</div>
          <div style="font-weight: 600; color: #1E2A52;">${fournisseurData.email}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Téléphone</div>
          <div style="font-weight: 600; color: #1E2A52;">${fournisseurData.telephone}</div>
        </div>

        <div style="margin-top: 12px; padding: 16px; background: white; border-radius: 8px; border: 2px solid #10b981;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">💳 IBAN</div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <code id="ibanValue" style="flex: 1; font-size: 16px; font-weight: 700; color: #1E2A52; letter-spacing: 1px;">${fournisseurData.iban}</code>
            <button onclick="copierIBAN()" class="btn btn-sm" style="flex-shrink: 0;">📋 Copier</button>
          </div>
        </div>

        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">BIC</div>
          <code style="font-size: 14px; font-weight: 600; color: #1E2A52;">${fournisseurData.bic}</code>
        </div>
      </div>
    `;

    modal.removeAttribute('hidden');
  }

  function fermerModalPaiement() {
    document.getElementById('modalPaiement').setAttribute('hidden', '');
  }

  function marquerCommePaye() {
    if (!commandeSelectionnee) return;

    if (!confirm(`💰 Confirmer le paiement de ${formatEuro(commandeSelectionnee.montantTTC)} au fournisseur ${commandeSelectionnee.fournisseur} ?\n\nLa commande ${commandeSelectionnee.numero} sera marquée comme payée.`)) {
      return;
    }

    // Mettre à jour le statut
    commandeSelectionnee.statut = 'payee';
    commandeSelectionnee.statutLabel = 'Payée';
    commandeSelectionnee.statutClass = 'b-green';

    // Ajouter l'événement dans la timeline
    commandeSelectionnee.timeline.push({
      date: new Date().toISOString().split('T')[0],
      statut: 'Paiement effectué',
      user: 'SF - Service Financier'
    });

    // Ajouter les métadonnées de paiement
    commandeSelectionnee.datePaiement = new Date().toISOString();
    commandeSelectionnee.paiementPar = 'SF - Service Financier';

    // Fermer les modals
    fermerModalPaiement();
    fermerModal();

    // Message de succès
    showToast(`✅ Paiement de ${formatEuro(commandeSelectionnee.montantTTC)} enregistré avec succès !`, 'success');

    // Recharger le tableau
    loadTableau();
  }

  // Fonction globale pour copier l'IBAN (appelée depuis le HTML)
  window.copierIBAN = function() {
    const ibanElement = document.getElementById('ibanValue');
    if (!ibanElement) return;

    const iban = ibanElement.textContent;
    navigator.clipboard.writeText(iban).then(() => {
      showToast('📋 IBAN copié dans le presse-papiers', 'success');
    }).catch(err => {
      // Fallback pour les navigateurs anciens
      const textArea = document.createElement('textarea');
      textArea.value = iban;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('📋 IBAN copié dans le presse-papiers', 'success');
    });
  };

  // Événements modal paiement
  document.getElementById('btnCloseModalPaiement').addEventListener('click', fermerModalPaiement);
  document.getElementById('btnAnnulerPaiement').addEventListener('click', fermerModalPaiement);
  document.getElementById('btnMarquerPaye').addEventListener('click', marquerCommePaye);

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

  console.log('✅ Page Suivi Commandes chargée avec succès');
});
