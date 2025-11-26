/* ================================================================
   SAE-Colis - Gestionnaire Centralisé des Fournisseurs
   Système partagé entre Agent et Service Financier
   Simule une base de données via localStorage
================================================================ */

const FournisseursManager = (function() {
  'use strict';

  const STORAGE_KEY = 'sae_colis_fournisseurs';
  const STORAGE_KEY_COMMANDES = 'sae_colis_commandes_history';

  /* ========== FOURNISSEURS PAR DÉFAUT ========== */
  const DEFAULT_FOURNISSEURS = [
    {
      id: 1,
      nom: 'Amazon',
      email: 'pro@amazon.fr',
      tel: '+33 1 77 77 77 77',
      adresse: 'Paris, France',
      delaiMoyen: 3,
      statut: 'actif',
      notes: 'Fournisseur principal pour matériel informatique et bureautique',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined' // predefined ou custom
    },
    {
      id: 2,
      nom: 'LDLC',
      email: 'pro@ldlc.com',
      tel: '+33 4 72 74 12 34',
      adresse: 'Lyon, France',
      delaiMoyen: 5,
      statut: 'actif',
      notes: 'Spécialiste informatique, bon rapport qualité/prix',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined'
    },
    {
      id: 3,
      nom: 'Dell',
      email: 'france@dell.com',
      tel: '+33 1 55 94 71 00',
      adresse: 'Montpellier, France',
      delaiMoyen: 7,
      statut: 'actif',
      notes: 'PC et serveurs professionnels',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined'
    },
    {
      id: 4,
      nom: 'HP',
      email: 'commandes@hp.fr',
      tel: '+33 1 49 06 69 00',
      adresse: 'Les Ulis, France',
      delaiMoyen: 6,
      statut: 'actif',
      notes: 'Imprimantes et accessoires',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined'
    },
    {
      id: 5,
      nom: 'Apple',
      email: 'education@apple.fr',
      tel: '+33 8 05 54 00 00',
      adresse: 'Paris, France',
      delaiMoyen: 10,
      statut: 'actif',
      notes: 'Matériel Apple premium',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined'
    },
    {
      id: 6,
      nom: 'Darty',
      email: 'pro@darty.fr',
      tel: '+33 9 78 35 35 35',
      adresse: 'France',
      delaiMoyen: 4,
      statut: 'actif',
      notes: 'Électroménager et petit équipement',
      dateAjout: '2024-01-15',
      ajoutePar: 'System',
      type: 'predefined'
    }
  ];

  /* ========== INITIALISATION ========== */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Première initialisation
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FOURNISSEURS));
      console.log('✅ Fournisseurs initialisés');
    }
  }

  /* ========== RÉCUPÉRER TOUS LES FOURNISSEURS ========== */
  function getAll() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FOURNISSEURS;
  }

  /* ========== RÉCUPÉRER FOURNISSEURS ACTIFS ========== */
  function getActifs() {
    return getAll().filter(f => f.statut === 'actif');
  }

  /* ========== RÉCUPÉRER UN FOURNISSEUR PAR ID ========== */
  function getById(id) {
    const fournisseurs = getAll();
    return fournisseurs.find(f => f.id === parseInt(id));
  }

  /* ========== RÉCUPÉRER UN FOURNISSEUR PAR NOM ========== */
  function getByNom(nom) {
    const fournisseurs = getAll();
    return fournisseurs.find(f => f.nom.toLowerCase() === nom.toLowerCase());
  }

  /* ========== AJOUTER UN FOURNISSEUR ========== */
  function ajouter(fournisseurData) {
    const fournisseurs = getAll();

    // Vérifier si le fournisseur existe déjà
    const existe = fournisseurs.some(f =>
      f.nom.toLowerCase() === fournisseurData.nom.toLowerCase()
    );

    if (existe) {
      console.warn('⚠️ Ce fournisseur existe déjà');
      return { success: false, message: 'Ce fournisseur existe déjà' };
    }

    // Créer le nouveau fournisseur
    const newFournisseur = {
      id: Date.now(),
      nom: fournisseurData.nom,
      email: fournisseurData.email,
      tel: fournisseurData.tel || '',
      adresse: fournisseurData.adresse || '',
      delaiMoyen: parseInt(fournisseurData.delaiMoyen) || 0,
      statut: 'actif',
      notes: fournisseurData.notes || `Ajouté depuis l'interface Agent`,
      dateAjout: new Date().toISOString().split('T')[0],
      ajoutePar: fournisseurData.ajoutePar || 'Agent',
      type: 'custom'
    };

    fournisseurs.push(newFournisseur);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fournisseurs));

    console.log('✅ Fournisseur ajouté:', newFournisseur.nom);
    return { success: true, fournisseur: newFournisseur };
  }

  /* ========== MODIFIER UN FOURNISSEUR ========== */
  function modifier(id, fournisseurData) {
    const fournisseurs = getAll();
    const index = fournisseurs.findIndex(f => f.id === parseInt(id));

    if (index === -1) {
      return { success: false, message: 'Fournisseur introuvable' };
    }

    // Mettre à jour
    fournisseurs[index] = {
      ...fournisseurs[index],
      ...fournisseurData,
      id: parseInt(id) // Conserver l'ID
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fournisseurs));

    console.log('✅ Fournisseur modifié:', fournisseurs[index].nom);
    return { success: true, fournisseur: fournisseurs[index] };
  }

  /* ========== SUPPRIMER UN FOURNISSEUR ========== */
  function supprimer(id) {
    let fournisseurs = getAll();
    const fournisseur = fournisseurs.find(f => f.id === parseInt(id));

    if (!fournisseur) {
      return { success: false, message: 'Fournisseur introuvable' };
    }

    // Ne pas supprimer, juste désactiver
    const index = fournisseurs.findIndex(f => f.id === parseInt(id));
    fournisseurs[index].statut = 'inactif';

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fournisseurs));

    console.log('✅ Fournisseur désactivé:', fournisseur.nom);
    return { success: true };
  }

  /* ========== ENREGISTRER UNE COMMANDE ========== */
  function enregistrerCommande(commandeData) {
    const commandes = getCommandesHistory();

    const nouvelleCommande = {
      id: Date.now(),
      fournisseurId: commandeData.fournisseurId,
      fournisseurNom: commandeData.fournisseurNom,
      numeroCommande: commandeData.numeroCommande,
      montantTTC: parseFloat(commandeData.montantTTC),
      dateCommande: commandeData.dateCommande || new Date().toISOString().split('T')[0],
      dateLivraison: commandeData.dateLivraison || null,
      delaiReel: commandeData.delaiReel || null,
      statut: commandeData.statut || 'en_attente'
    };

    commandes.push(nouvelleCommande);
    localStorage.setItem(STORAGE_KEY_COMMANDES, JSON.stringify(commandes));

    // Mettre à jour les statistiques du fournisseur
    _updateFournisseurStats(commandeData.fournisseurId || commandeData.fournisseurNom);

    return { success: true, commande: nouvelleCommande };
  }

  /* ========== RÉCUPÉRER L'HISTORIQUE DES COMMANDES ========== */
  function getCommandesHistory() {
    const stored = localStorage.getItem(STORAGE_KEY_COMMANDES);
    return stored ? JSON.parse(stored) : [];
  }

  /* ========== RÉCUPÉRER LES COMMANDES D'UN FOURNISSEUR ========== */
  function getCommandesByFournisseur(fournisseurId) {
    const commandes = getCommandesHistory();
    return commandes.filter(c => c.fournisseurId === parseInt(fournisseurId));
  }

  /* ========== METTRE À JOUR LES STATS D'UN FOURNISSEUR ========== */
  function _updateFournisseurStats(fournisseurIdOrNom) {
    const fournisseurs = getAll();
    let fournisseur;

    if (typeof fournisseurIdOrNom === 'number') {
      fournisseur = fournisseurs.find(f => f.id === fournisseurIdOrNom);
    } else {
      fournisseur = fournisseurs.find(f => f.nom.toLowerCase() === fournisseurIdOrNom.toLowerCase());
    }

    if (!fournisseur) return;

    const commandes = getCommandesHistory().filter(c =>
      c.fournisseurId === fournisseur.id || c.fournisseurNom.toLowerCase() === fournisseur.nom.toLowerCase()
    );

    // Calculer le nombre de commandes
    const nbCommandes = commandes.length;

    // Calculer le montant total
    const montantTotal = commandes.reduce((sum, c) => sum + c.montantTTC, 0);

    // Calculer le délai moyen (commandes livrées uniquement)
    const commandesLivrees = commandes.filter(c => c.delaiReel !== null);
    const delaiMoyen = commandesLivrees.length > 0
      ? Math.round(commandesLivrees.reduce((sum, c) => sum + c.delaiReel, 0) / commandesLivrees.length)
      : fournisseur.delaiMoyen;

    // Calculer le taux de livraison
    const commandesTerminees = commandes.filter(c => c.statut === 'livree' || c.statut === 'payee').length;
    const tauxLivraison = nbCommandes > 0 ? Math.round((commandesTerminees / nbCommandes) * 100) : 100;

    // Mettre à jour le fournisseur
    const index = fournisseurs.findIndex(f => f.id === fournisseur.id);
    if (index !== -1) {
      fournisseurs[index] = {
        ...fournisseurs[index],
        nbCommandes,
        montantTotal,
        delaiMoyen,
        tauxLivraison
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(fournisseurs));
      console.log('✅ Stats fournisseur mises à jour:', fournisseur.nom);
    }
  }

  /* ========== CALCULER LES STATISTIQUES D'UN FOURNISSEUR ========== */
  function getStatsFournisseur(fournisseurId) {
    const commandes = getCommandesByFournisseur(fournisseurId);

    const nbCommandes = commandes.length;
    const montantTotal = commandes.reduce((sum, c) => sum + c.montantTTC, 0);

    const commandesLivrees = commandes.filter(c => c.delaiReel !== null);
    const delaiMoyen = commandesLivrees.length > 0
      ? (commandesLivrees.reduce((sum, c) => sum + c.delaiReel, 0) / commandesLivrees.length).toFixed(1)
      : 0;

    const commandesTerminees = commandes.filter(c => c.statut === 'livree' || c.statut === 'payee').length;
    const tauxLivraison = nbCommandes > 0 ? Math.round((commandesTerminees / nbCommandes) * 100) : 0;

    return {
      nbCommandes,
      montantTotal,
      delaiMoyen,
      tauxLivraison,
      dernieresCommandes: commandes.slice(-5).reverse()
    };
  }

  /* ========== RÉINITIALISER (pour dev/debug) ========== */
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_COMMANDES);
    init();
    console.log('🔄 Fournisseurs réinitialisés');
  }

  // Initialiser au chargement
  init();

  // API publique
  return {
    getAll,
    getActifs,
    getById,
    getByNom,
    ajouter,
    modifier,
    supprimer,
    enregistrerCommande,
    getCommandesHistory,
    getCommandesByFournisseur,
    getStatsFournisseur,
    reset
  };
})();

// Rendre disponible globalement
window.FournisseursManager = FournisseursManager;

console.log('✅ FournisseursManager chargé');
