/* ================================================================
   SAE-Colis - Analytics Superadmin
   Statistiques et graphiques du système
================================================================ */

ready(function() {
  console.log('📊 Analytics - Chargement...');

  /* ========== DONNÉES SIMULÉES ========== */
  const analyticsData = {
    periodes: {
      '7d': {
        totalCommandes: 67,
        montantTotal: 124500,
        tauxValidation: 96,
        delaiMoyen: 3.8,
        utilisateursActifs: 42,
        fournisseursActifs: 12,
        tendance: '+15%',
      },
      '30d': {
        totalCommandes: 245,
        montantTotal: 428450,
        tauxValidation: 94,
        delaiMoyen: 4.2,
        utilisateursActifs: 48,
        fournisseursActifs: 15,
        tendance: '+12%',
      },
      '90d': {
        totalCommandes: 687,
        montantTotal: 1245300,
        tauxValidation: 92,
        delaiMoyen: 4.5,
        utilisateursActifs: 51,
        fournisseursActifs: 18,
        tendance: '+8%',
      },
      'year': {
        totalCommandes: 2456,
        montantTotal: 4852000,
        tauxValidation: 91,
        delaiMoyen: 4.8,
        utilisateursActifs: 54,
        fournisseursActifs: 22,
        tendance: '+5%',
      },
      'all': {
        totalCommandes: 3892,
        montantTotal: 7234500,
        tauxValidation: 90,
        delaiMoyen: 5.1,
        utilisateursActifs: 58,
        fournisseursActifs: 25,
        tendance: 'N/A',
      }
    }
  };

  /* ========== FORMATAGE ========== */
  const formatEuro = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);

  const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(n);

  /* ========== MISE À JOUR DES KPIs ========== */
  function updateKPIs(periode = '30d') {
    const data = analyticsData.periodes[periode];

    document.getElementById('kpiTotalCommandes').textContent = formatNumber(data.totalCommandes);
    document.getElementById('kpiMontantTotal').textContent = formatEuro(data.montantTotal);
    document.getElementById('kpiTauxValidation').textContent = `${data.tauxValidation}%`;
    document.getElementById('kpiDelaiMoyen').textContent = `${data.delaiMoyen} j`;
    document.getElementById('kpiUtilisateursActifs').textContent = formatNumber(data.utilisateursActifs);
    document.getElementById('kpiFournisseursActifs').textContent = formatNumber(data.fournisseursActifs);
  }

  /* ========== GESTION DE LA PÉRIODE ========== */
  const periodSelector = document.getElementById('periodSelector');
  if (periodSelector) {
    periodSelector.addEventListener('change', function() {
      const periode = this.value;
      updateKPIs(periode);

      // Animation de changement
      const kpis = document.querySelectorAll('.kpi .value');
      kpis.forEach(kpi => {
        kpi.style.transform = 'scale(1.1)';
        kpi.style.color = '#3b82f6';
        setTimeout(() => {
          kpi.style.transform = 'scale(1)';
          kpi.style.color = '';
        }, 200);
      });

      showToast(`📊 Période mise à jour : ${this.options[this.selectedIndex].text}`, 'info');
    });
  }

  /* ========== RECHERCHE ========== */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      console.log('🔍 Recherche:', query);
      // Implémentation future: recherche dans les statistiques
    });
  }

  /* ========== TOAST NOTIFICATIONS ========== */
  function showToast(message, type = 'info') {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ========== EXPORT DES DONNÉES ========== */
  function exporterStatistiques() {
    const periode = periodSelector.value;
    const data = analyticsData.periodes[periode];

    const csvContent = `Statistiques SAE-Colis - ${periode}\n\n` +
      `Total commandes,${data.totalCommandes}\n` +
      `Montant total,${data.montantTotal}\n` +
      `Taux validation,${data.tauxValidation}%\n` +
      `Délai moyen signature,${data.delaiMoyen} jours\n` +
      `Utilisateurs actifs,${data.utilisateursActifs}\n` +
      `Fournisseurs actifs,${data.fournisseursActifs}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${periode}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('✅ Export réussi', 'success');
  }

  // Ajouter un bouton d'export (optionnel)
  window.exporterStatistiques = exporterStatistiques;

  /* ========== ANIMATIONS AU CHARGEMENT ========== */
  const animateOnLoad = () => {
    const kpis = document.querySelectorAll('.kpi');
    kpis.forEach((kpi, index) => {
      setTimeout(() => {
        kpi.style.opacity = '0';
        kpi.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
          kpi.style.transition = 'all 0.4s ease';
          kpi.style.opacity = '1';
          kpi.style.transform = 'translateY(0)';
        });
      }, index * 50);
    });
  };

  /* ========== INITIALISATION ========== */
  updateKPIs('30d');
  animateOnLoad();

  console.log('✅ Analytics chargé avec succès');
});

/* ========== STYLES D'ANIMATION (ajoutés dynamiquement) ========== */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .kpi {
    transition: all 0.3s ease;
  }

  .kpi:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);
