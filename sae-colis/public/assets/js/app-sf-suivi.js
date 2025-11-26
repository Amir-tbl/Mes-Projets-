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
  document.getElementById('btnMarquerBCEnvoye').addEventListener('click', () => {
    if (!commandeSelectionnee) return;
    alert('🚧 Fonctionnalité en développement\n\nMarquer le BC comme envoyé pour ' + commandeSelectionnee.numero);
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
    if (confirm(`Confirmer le déclenchement du paiement de ${formatEuro(commandeSelectionnee.montantTTC)} pour la commande ${commandeSelectionnee.numero} ?`)) {
      alert('✅ Paiement déclenché avec succès');
      fermerModal();
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

  console.log('✅ Page Suivi Commandes chargée avec succès');
});
