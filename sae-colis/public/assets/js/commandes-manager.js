/* ================================================================
   SAE-Colis - Gestionnaire Centralisé des Commandes
   Système partagé entre Agent et Service Financier
   Gère les commandes complètes avec articles, description, etc.
================================================================ */

const CommandesManager = (function() {
  'use strict';

  const STORAGE_KEY = 'sae_colis_commandes';

  /* ========== INITIALISATION ========== */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      console.log('✅ Système de commandes initialisé');
    }
  }

  /* ========== RÉCUPÉRER TOUTES LES COMMANDES ========== */
  function getAll() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /* ========== RÉCUPÉRER UNE COMMANDE PAR ID ========== */
  function getById(id) {
    const commandes = getAll();
    return commandes.find(c => c.id === parseInt(id));
  }

  /* ========== RÉCUPÉRER UNE COMMANDE PAR NUMÉRO ========== */
  function getByNumero(numero) {
    const commandes = getAll();
    return commandes.find(c => c.numeroCommande === numero);
  }

  /* ========== CRÉER UNE NOUVELLE COMMANDE ========== */
  function creer(commandeData) {
    const commandes = getAll();

    // Générer un numéro de commande unique
    const year = new Date().getFullYear();
    const numero = `#BC-${year}-${String(Date.now()).slice(-4)}`;

    const nouvelleCommande = {
      id: Date.now(),
      numeroCommande: numero,

      // Informations demandeur (Agent)
      demandeur: {
        nom: commandeData.demandeur.nom,
        email: commandeData.demandeur.email,
        departement: commandeData.demandeur.departement,
        service: commandeData.demandeur.service
      },

      // Informations générales (Step 1)
      dateCreation: new Date().toISOString().split('T')[0],
      dateCommande: commandeData.dateCommande || new Date().toISOString().split('T')[0],
      dateLivraisonSouhaitee: commandeData.dateLivraisonSouhaitee,
      urgence: commandeData.urgence || false,
      description: commandeData.description || '',

      // Fournisseur (Step 2)
      fournisseur: {
        id: commandeData.fournisseur.id,
        nom: commandeData.fournisseur.nom,
        email: commandeData.fournisseur.email,
        telephone: commandeData.fournisseur.telephone,
        delaiMoyen: commandeData.fournisseur.delaiMoyen
      },

      // Articles (Step 2)
      articles: commandeData.articles.map(art => ({
        designation: art.designation,
        quantite: parseInt(art.quantite),
        prixUnitaire: parseFloat(art.prixUnitaire),
        tva: parseFloat(art.tva),
        totalHT: parseFloat(art.quantite) * parseFloat(art.prixUnitaire),
        totalTVA: (parseFloat(art.quantite) * parseFloat(art.prixUnitaire)) * (parseFloat(art.tva) / 100),
        totalTTC: (parseFloat(art.quantite) * parseFloat(art.prixUnitaire)) * (1 + parseFloat(art.tva) / 100)
      })),

      // Totaux
      montantHT: parseFloat(commandeData.montantHT),
      montantTVA: parseFloat(commandeData.montantTVA),
      montantTTC: parseFloat(commandeData.montantTTC),

      // Livraison (Step 3)
      livraison: {
        destinataire: commandeData.livraison.destinataire,
        adresse: commandeData.livraison.adresse,
        codePostal: commandeData.livraison.codePostal,
        ville: commandeData.livraison.ville,
        telephone: commandeData.livraison.telephone,
        instructions: commandeData.livraison.instructions || ''
      },

      // Statut et workflow
      statut: 'en_attente_validation',
      statutLabel: 'En attente validation',

      // Historique des changements de statut
      historique: [
        {
          date: new Date().toISOString(),
          statut: 'en_attente_validation',
          statutLabel: 'Créée - En attente validation',
          utilisateur: commandeData.demandeur.nom,
          commentaire: 'Commande créée'
        }
      ],

      // Métadonnées
      creePar: commandeData.demandeur.nom,
      dateCreationISO: new Date().toISOString(),
      derniereModification: new Date().toISOString()
    };

    commandes.push(nouvelleCommande);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commandes));

    // Enregistrer aussi dans l'historique des commandes du fournisseur
    if (window.FournisseursManager) {
      window.FournisseursManager.enregistrerCommande({
        fournisseurId: commandeData.fournisseur.id,
        fournisseurNom: commandeData.fournisseur.nom,
        numeroCommande: numero,
        montantTTC: parseFloat(commandeData.montantTTC),
        dateCommande: nouvelleCommande.dateCommande,
        statut: 'en_attente_validation'
      });
    }

    console.log('✅ Commande créée:', numero);
    return { success: true, commande: nouvelleCommande };
  }

  /* ========== METTRE À JOUR LE STATUT ========== */
  function updateStatut(commandeId, nouveauStatut, options = {}) {
    const commandes = getAll();
    const index = commandes.findIndex(c => c.id === parseInt(commandeId));

    if (index === -1) {
      return { success: false, message: 'Commande introuvable' };
    }

    const labelMap = {
      'en_attente_validation': 'En attente validation',
      'validee': 'Validée',
      'en_attente_signature': 'En attente signature',
      'signee': 'Signée',
      'bc_envoye': 'BC envoyé',
      'expediee': 'Expédiée',
      'recue_iut': 'Reçue IUT',
      'livree': 'Livrée',
      'a_payer': 'À payer',
      'payee': 'Payée',
      'refusee': 'Refusée',
      'annulee': 'Annulée',
      'retard': 'En retard'
    };

    commandes[index].statut = nouveauStatut;
    commandes[index].statutLabel = labelMap[nouveauStatut] || nouveauStatut;
    commandes[index].derniereModification = new Date().toISOString();

    // Ajouter à l'historique
    commandes[index].historique.push({
      date: new Date().toISOString(),
      statut: nouveauStatut,
      statutLabel: labelMap[nouveauStatut] || nouveauStatut,
      utilisateur: options.utilisateur || 'Système',
      commentaire: options.commentaire || ''
    });

    // Si validée, passer à en_attente_signature
    if (nouveauStatut === 'validee') {
      commandes[index].dateValidation = new Date().toISOString().split('T')[0];
      commandes[index].validePar = options.utilisateur || 'SF';
    }

    // Si refusée
    if (nouveauStatut === 'refusee') {
      commandes[index].dateRefus = new Date().toISOString().split('T')[0];
      commandes[index].motifRefus = options.commentaire || '';
      commandes[index].refusePar = options.utilisateur || 'SF';
    }

    // Si BC envoyé
    if (nouveauStatut === 'bc_envoye') {
      commandes[index].dateBCEnvoye = new Date().toISOString().split('T')[0];
    }

    // Si expédiée
    if (nouveauStatut === 'expediee') {
      commandes[index].dateExpedition = new Date().toISOString().split('T')[0];
      commandes[index].numeroSuivi = options.numeroSuivi || '';
    }

    // Si livrée
    if (nouveauStatut === 'livree') {
      commandes[index].dateLivraison = new Date().toISOString().split('T')[0];

      // Calculer le délai réel
      const dateCmd = new Date(commandes[index].dateCommande);
      const dateLiv = new Date(commandes[index].dateLivraison);
      const delaiReel = Math.ceil((dateLiv - dateCmd) / (1000 * 60 * 60 * 24));
      commandes[index].delaiReel = delaiReel;

      // Mettre à jour l'historique du fournisseur
      if (window.FournisseursManager) {
        const cmdHistory = window.FournisseursManager.getCommandesHistory();
        const cmdIndex = cmdHistory.findIndex(c => c.numeroCommande === commandes[index].numeroCommande);
        if (cmdIndex !== -1) {
          cmdHistory[cmdIndex].dateLivraison = commandes[index].dateLivraison;
          cmdHistory[cmdIndex].delaiReel = delaiReel;
          cmdHistory[cmdIndex].statut = 'livree';
          localStorage.setItem('sae_colis_commandes_history', JSON.stringify(cmdHistory));
        }
      }
    }

    // Si payée
    if (nouveauStatut === 'payee') {
      commandes[index].datePaiement = new Date().toISOString().split('T')[0];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(commandes));

    console.log('✅ Statut mis à jour:', commandes[index].numeroCommande, '->', nouveauStatut);
    return { success: true, commande: commandes[index] };
  }

  /* ========== AJOUTER UN COMMENTAIRE ========== */
  function ajouterCommentaire(commandeId, commentaire, utilisateur) {
    const commandes = getAll();
    const index = commandes.findIndex(c => c.id === parseInt(commandeId));

    if (index === -1) {
      return { success: false, message: 'Commande introuvable' };
    }

    if (!commandes[index].commentaires) {
      commandes[index].commentaires = [];
    }

    commandes[index].commentaires.push({
      date: new Date().toISOString(),
      utilisateur: utilisateur,
      texte: commentaire
    });

    commandes[index].derniereModification = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commandes));

    return { success: true };
  }

  /* ========== FILTRER PAR STATUT ========== */
  function getByStatut(statut) {
    const commandes = getAll();
    return commandes.filter(c => c.statut === statut);
  }

  /* ========== FILTRER PAR DEMANDEUR ========== */
  function getByDemandeur(nomDemandeur) {
    const commandes = getAll();
    return commandes.filter(c => c.demandeur.nom === nomDemandeur);
  }

  /* ========== FILTRER PAR DÉPARTEMENT ========== */
  function getByDepartement(departement) {
    const commandes = getAll();
    return commandes.filter(c => c.demandeur.departement === departement);
  }

  /* ========== FILTRER PAR FOURNISSEUR ========== */
  function getByFournisseur(fournisseurId) {
    const commandes = getAll();
    return commandes.filter(c => c.fournisseur.id === parseInt(fournisseurId));
  }

  /* ========== FILTRER PAR PÉRIODE ========== */
  function getByPeriode(dateDebut, dateFin) {
    const commandes = getAll();
    return commandes.filter(c => {
      const dateCmd = c.dateCommande;
      return dateCmd >= dateDebut && dateCmd <= dateFin;
    });
  }

  /* ========== STATISTIQUES ========== */
  function getStats() {
    const commandes = getAll();
    return {
      total: commandes.length,
      enAttente: commandes.filter(c => c.statut === 'en_attente_validation').length,
      validees: commandes.filter(c => c.statut === 'validee' || c.statut === 'en_attente_signature').length,
      enCours: commandes.filter(c => ['bc_envoye', 'expediee', 'recue_iut'].includes(c.statut)).length,
      livrees: commandes.filter(c => c.statut === 'livree').length,
      payees: commandes.filter(c => c.statut === 'payee').length,
      refusees: commandes.filter(c => c.statut === 'refusee').length,
      retards: commandes.filter(c => c.statut === 'retard').length,
      montantTotal: commandes.reduce((sum, c) => sum + (c.montantTTC || 0), 0)
    };
  }

  /* ========== RÉINITIALISER (pour dev/debug) ========== */
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    init();
    console.log('🔄 Commandes réinitialisées');
  }

  /* ========== DONNÉES DE SIMULATION POUR DIRECTEUR ========== */
  function initSimulationDirecteur() {
    const commandes = getAll();

    // Ne créer les simulations que si aucune commande n'existe
    if (commandes.length > 0) return;

    const aujourdhui = new Date();

    // Créer quelques commandes en attente de signature
    const bcEnAttenteSignature = [
      {
        id: Date.now() + 1,
        numeroCommande: '#BC-2025-1001',
        demandeur: {
          nom: 'Butelle Franck',
          email: 'franck.butelle@univ-paris13.fr',
          departement: 'Informatique',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: true,
        description: 'Équipement urgent pour la nouvelle salle de TP Python. Début des cours dans 3 semaines.',
        fournisseur: {
          id: 1,
          nom: 'LDLC',
          email: 'pro@ldlc.com',
          telephone: '04 27 46 20 00',
          delaiMoyen: 7
        },
        articles: [
          {
            designation: 'PC Dell OptiPlex 7090',
            quantite: 15,
            prixUnitaire: 850,
            tva: 20,
            totalHT: 12750,
            totalTVA: 2550,
            totalTTC: 15300
          },
          {
            designation: 'Écran Dell 24" Full HD',
            quantite: 15,
            prixUnitaire: 180,
            tva: 20,
            totalHT: 2700,
            totalTVA: 540,
            totalTTC: 3240
          }
        ],
        montantHT: 15450,
        montantTVA: 3090,
        montantTTC: 18540,
        livraison: {
          destinataire: 'Butelle Franck',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Livraison salle B201'
        },
        statut: 'en_attente_signature',
        statutLabel: 'En attente signature',
        dateValidation: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Butelle Franck',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Budget validé, BC à faire signer'
          },
          {
            date: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: 'En attente de signature du Directeur'
          }
        ],
        creePar: 'Butelle Franck',
        dateCreationISO: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 2,
        numeroCommande: '#BC-2025-1002',
        demandeur: {
          nom: 'Martin Sophie',
          email: 'sophie.martin@univ-paris13.fr',
          departement: 'GEA',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Matériel bureautique pour la salle des professeurs GEA.',
        fournisseur: {
          id: 2,
          nom: 'Amazon Business',
          email: 'business@amazon.fr',
          telephone: '0800 91 50 51',
          delaiMoyen: 5
        },
        articles: [
          {
            designation: 'Imprimante HP LaserJet Pro',
            quantite: 2,
            prixUnitaire: 320,
            tva: 20,
            totalHT: 640,
            totalTVA: 128,
            totalTTC: 768
          },
          {
            designation: 'Ramette papier A4 (lot de 10)',
            quantite: 5,
            prixUnitaire: 45,
            tva: 20,
            totalHT: 225,
            totalTVA: 45,
            totalTTC: 270
          }
        ],
        montantHT: 865,
        montantTVA: 173,
        montantTTC: 1038,
        livraison: {
          destinataire: 'Martin Sophie',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: ''
        },
        statut: 'en_attente_signature',
        statutLabel: 'En attente signature',
        dateValidation: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Martin Sophie',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: ''
          }
        ],
        creePar: 'Martin Sophie',
        dateCreationISO: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 3,
        numeroCommande: '#BC-2025-1003',
        demandeur: {
          nom: 'Dupont Jean',
          email: 'jean.dupont@univ-paris13.fr',
          departement: 'TC',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Vidéoprojecteur pour les présentations étudiantes.',
        fournisseur: {
          id: 3,
          nom: 'Dell',
          email: 'pro@dell.fr',
          telephone: '01 55 94 71 00',
          delaiMoyen: 10
        },
        articles: [
          {
            designation: 'Vidéoprojecteur Epson EB-2250U',
            quantite: 1,
            prixUnitaire: 1250,
            tva: 20,
            totalHT: 1250,
            totalTVA: 250,
            totalTTC: 1500
          },
          {
            designation: 'Câble HDMI 10m',
            quantite: 2,
            prixUnitaire: 25,
            tva: 20,
            totalHT: 50,
            totalTVA: 10,
            totalTTC: 60
          }
        ],
        montantHT: 1300,
        montantTVA: 260,
        montantTTC: 1560,
        livraison: {
          destinataire: 'Dupont Jean',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: ''
        },
        statut: 'en_attente_signature',
        statutLabel: 'En attente signature',
        dateValidation: aujourdhui.toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Dupont Jean',
            commentaire: 'Commande créée'
          },
          {
            date: aujourdhui.toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée ce matin'
          },
          {
            date: aujourdhui.toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: ''
          }
        ],
        creePar: 'Dupont Jean',
        dateCreationISO: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: aujourdhui.toISOString()
      }
    ];

    // Créer quelques commandes déjà signées (pour l'historique)
    const bcSignes = [
      {
        id: Date.now() + 10,
        numeroCommande: '#BC-2025-0987',
        demandeur: {
          nom: 'Leblanc Pierre',
          email: 'pierre.leblanc@univ-paris13.fr',
          departement: 'Informatique',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Licences logicielles pour les étudiants INFO3.',
        fournisseur: {
          id: 5,
          nom: 'Microsoft',
          email: 'education@microsoft.com',
          telephone: '01 85 73 25 00',
          delaiMoyen: 3
        },
        articles: [
          {
            designation: 'Licence Visual Studio Pro (lot de 30)',
            quantite: 1,
            prixUnitaire: 2500,
            tva: 20,
            totalHT: 2500,
            totalTVA: 500,
            totalTTC: 3000
          }
        ],
        montantHT: 2500,
        montantTVA: 500,
        montantTTC: 3000,
        livraison: {
          destinataire: 'Leblanc Pierre',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Livraison numérique'
        },
        statut: 'bc_envoye',
        statutLabel: 'BC envoyé',
        dateValidation: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signataire: {
          nom: 'Dr. Laurent Petit',
          fonction: 'Directeur IUT Villetaneuse',
          date: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Leblanc Pierre',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Budget OK'
          },
          {
            date: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: ''
          },
          {
            date: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé par le Directeur'
          },
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          }
        ],
        creePar: 'Leblanc Pierre',
        dateCreationISO: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 11,
        numeroCommande: '#BC-2025-0945',
        demandeur: {
          nom: 'Durand Marie',
          email: 'marie.durand@univ-paris13.fr',
          departement: 'GB',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Matériel de laboratoire pour les TP de biologie.',
        fournisseur: {
          id: 6,
          nom: 'VWR',
          email: 'commandes@vwr.com',
          telephone: '01 47 56 00 00',
          delaiMoyen: 7
        },
        articles: [
          {
            designation: 'Microscope optique Olympus',
            quantite: 5,
            prixUnitaire: 650,
            tva: 20,
            totalHT: 3250,
            totalTVA: 650,
            totalTTC: 3900
          },
          {
            designation: 'Lames et lamelles (lot)',
            quantite: 10,
            prixUnitaire: 35,
            tva: 20,
            totalHT: 350,
            totalTVA: 70,
            totalTTC: 420
          }
        ],
        montantHT: 3600,
        montantTVA: 720,
        montantTTC: 4320,
        livraison: {
          destinataire: 'Durand Marie',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Livraison laboratoire L305'
        },
        statut: 'livree',
        statutLabel: 'Livrée',
        dateValidation: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraison: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delaiReel: 12,
        numeroSuivi: 'COLISSIMO-XZ789456123',
        signataire: {
          nom: 'Dr. Laurent Petit',
          fonction: 'Directeur IUT Villetaneuse',
          date: new Date(aujourdhui.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString()
        },
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Durand Marie',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: ''
          },
          {
            date: new Date(aujourdhui.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: ''
          },
          {
            date: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur VWR',
            commentaire: 'Colis expédié'
          },
          {
            date: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'livree',
            statutLabel: 'Livrée',
            utilisateur: 'Agent CRIT',
            commentaire: 'Colis réceptionné et remis au demandeur'
          }
        ],
        creePar: 'Durand Marie',
        dateCreationISO: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 12,
        numeroCommande: '#BC-2025-0920',
        demandeur: {
          nom: 'Bernard Claire',
          email: 'claire.bernard@univ-paris13.fr',
          departement: 'Administration',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Fournitures administratives pour le service.',
        fournisseur: {
          id: 2,
          nom: 'Amazon Business',
          email: 'business@amazon.fr',
          telephone: '0800 91 50 51',
          delaiMoyen: 5
        },
        articles: [
          {
            designation: 'Classeurs A4 (lot de 50)',
            quantite: 2,
            prixUnitaire: 65,
            tva: 20,
            totalHT: 130,
            totalTVA: 26,
            totalTTC: 156
          },
          {
            designation: 'Stylos (lot de 100)',
            quantite: 5,
            prixUnitaire: 15,
            tva: 20,
            totalHT: 75,
            totalTVA: 15,
            totalTTC: 90
          }
        ],
        montantHT: 205,
        montantTVA: 41,
        montantTTC: 246,
        livraison: {
          destinataire: 'Bernard Claire',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: ''
        },
        statut: 'signee',
        statutLabel: 'Signée',
        dateValidation: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: aujourdhui.toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        signataire: {
          nom: 'Dr. Laurent Petit',
          fonction: 'Directeur IUT Villetaneuse',
          date: aujourdhui.toISOString()
        },
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Bernard Claire',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_signature',
            statutLabel: 'En attente signature',
            utilisateur: 'Système',
            commentaire: ''
          },
          {
            date: aujourdhui.toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé ce matin'
          }
        ],
        creePar: 'Bernard Claire',
        dateCreationISO: new Date(aujourdhui.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: aujourdhui.toISOString()
      }
    ];

    // Créer des colis pour le Service Postal CRIT

    // 1. Colis expédiés (en attente de réception par CRIT)
    const colisExpedies = [
      {
        id: Date.now() + 20,
        numeroCommande: '#BC-2025-0888',
        demandeur: {
          nom: 'Rousseau Anne',
          email: 'anne.rousseau@univ-paris13.fr',
          departement: 'GEA',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Calculatrices pour les examens de comptabilité.',
        fournisseur: {
          id: 2,
          nom: 'Amazon Business',
          email: 'business@amazon.fr',
          telephone: '0800 91 50 51',
          delaiMoyen: 5
        },
        articles: [
          {
            designation: 'Calculatrice Casio FX-92+ (lot de 30)',
            quantite: 1,
            prixUnitaire: 450,
            tva: 20,
            totalHT: 450,
            totalTVA: 90,
            totalTTC: 540
          }
        ],
        montantHT: 450,
        montantTVA: 90,
        montantTTC: 540,
        livraison: {
          destinataire: 'Rousseau Anne',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Livraison bureau GEA 305'
        },
        statut: 'expediee',
        statutLabel: 'Expédiée',
        dateValidation: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        numeroSuivi: 'COLISSIMO-AB123456789FR',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Rousseau Anne',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          },
          {
            date: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur Amazon',
            commentaire: 'Colis expédié par Colissimo'
          }
        ],
        creePar: 'Rousseau Anne',
        dateCreationISO: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 21,
        numeroCommande: '#BC-2025-0890',
        demandeur: {
          nom: 'Garcia Pablo',
          email: 'pablo.garcia@univ-paris13.fr',
          departement: 'TC',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: aujourdhui.toISOString().split('T')[0],
        urgence: false,
        description: 'Matériel audiovisuel pour les TP de communication.',
        fournisseur: {
          id: 1,
          nom: 'LDLC',
          email: 'pro@ldlc.com',
          telephone: '04 27 46 20 00',
          delaiMoyen: 7
        },
        articles: [
          {
            designation: 'Caméra Sony HDR-CX405',
            quantite: 3,
            prixUnitaire: 280,
            tva: 20,
            totalHT: 840,
            totalTVA: 168,
            totalTTC: 1008
          },
          {
            designation: 'Trépied Manfrotto Compact',
            quantite: 3,
            prixUnitaire: 65,
            tva: 20,
            totalHT: 195,
            totalTVA: 39,
            totalTTC: 234
          }
        ],
        montantHT: 1035,
        montantTVA: 207,
        montantTTC: 1242,
        livraison: {
          destinataire: 'Garcia Pablo',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Local matériel TC - Bâtiment B'
        },
        statut: 'expediee',
        statutLabel: 'Expédiée',
        dateValidation: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: aujourdhui.toISOString().split('T')[0],
        numeroSuivi: 'CHRONOPOST-XY987654321FR',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Garcia Pablo',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          },
          {
            date: aujourdhui.toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur LDLC',
            commentaire: 'Colis expédié ce matin'
          }
        ],
        creePar: 'Garcia Pablo',
        dateCreationISO: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: aujourdhui.toISOString()
      }
    ];

    // 2. Colis reçus à l'IUT (en attente de distribution)
    const colisRecusIUT = [
      {
        id: Date.now() + 25,
        numeroCommande: '#BC-2025-0875',
        demandeur: {
          nom: 'Petit Claire',
          email: 'claire.petit@univ-paris13.fr',
          departement: 'Informatique',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Souris et claviers pour la salle info A202.',
        fournisseur: {
          id: 1,
          nom: 'LDLC',
          email: 'pro@ldlc.com',
          telephone: '04 27 46 20 00',
          delaiMoyen: 7
        },
        articles: [
          {
            designation: 'Clavier Logitech K120',
            quantite: 20,
            prixUnitaire: 12,
            tva: 20,
            totalHT: 240,
            totalTVA: 48,
            totalTTC: 288
          },
          {
            designation: 'Souris Logitech M90',
            quantite: 20,
            prixUnitaire: 8,
            tva: 20,
            totalHT: 160,
            totalTVA: 32,
            totalTTC: 192
          }
        ],
        montantHT: 400,
        montantTVA: 80,
        montantTTC: 480,
        livraison: {
          destinataire: 'Petit Claire',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Salle info A202'
        },
        statut: 'recue_iut',
        statutLabel: 'Reçue IUT',
        dateValidation: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateReceptionIUT: new Date(aujourdhui.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        numeroSuivi: 'COLISSIMO-CD456789123FR',
        receptionneePar: 'CRIT Service Postal',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Petit Claire',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          },
          {
            date: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur LDLC',
            commentaire: 'Colis expédié'
          },
          {
            date: new Date(aujourdhui.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'recue_iut',
            statutLabel: 'Reçue IUT',
            utilisateur: 'CRIT Service Postal',
            commentaire: 'Colis réceptionné - En attente de distribution'
          }
        ],
        creePar: 'Petit Claire',
        dateCreationISO: new Date(aujourdhui.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 26,
        numeroCommande: '#BC-2025-0880',
        demandeur: {
          nom: 'Moreau Lucie',
          email: 'lucie.moreau@univ-paris13.fr',
          departement: 'GB',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Consommables pour les TP de biologie.',
        fournisseur: {
          id: 6,
          nom: 'VWR',
          email: 'commandes@vwr.com',
          telephone: '01 47 56 00 00',
          delaiMoyen: 7
        },
        articles: [
          {
            designation: 'Pipettes graduées (lot de 100)',
            quantite: 2,
            prixUnitaire: 85,
            tva: 20,
            totalHT: 170,
            totalTVA: 34,
            totalTTC: 204
          },
          {
            designation: 'Tubes à essai (lot de 500)',
            quantite: 1,
            prixUnitaire: 120,
            tva: 20,
            totalHT: 120,
            totalTVA: 24,
            totalTTC: 144
          }
        ],
        montantHT: 290,
        montantTVA: 58,
        montantTTC: 348,
        livraison: {
          destinataire: 'Moreau Lucie',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Laboratoire L305'
        },
        statut: 'recue_iut',
        statutLabel: 'Reçue IUT',
        dateValidation: new Date(aujourdhui.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateReceptionIUT: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        numeroSuivi: 'DPD-FR123456789',
        receptionneePar: 'CRIT Service Postal',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Moreau Lucie',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          },
          {
            date: new Date(aujourdhui.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur VWR',
            commentaire: 'Colis expédié'
          },
          {
            date: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'recue_iut',
            statutLabel: 'Reçue IUT',
            utilisateur: 'CRIT Service Postal',
            commentaire: 'Colis réceptionné hier'
          }
        ],
        creePar: 'Moreau Lucie',
        dateCreationISO: new Date(aujourdhui.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Date.now() + 27,
        numeroCommande: '#BC-2025-0870',
        demandeur: {
          nom: 'Faure Thomas',
          email: 'thomas.faure@univ-paris13.fr',
          departement: 'Administration',
          service: 'IUT Villetaneuse'
        },
        dateCreation: new Date(aujourdhui.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateCommande: new Date(aujourdhui.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateLivraisonSouhaitee: new Date(aujourdhui.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgence: false,
        description: 'Fournitures de bureau pour l\'administration.',
        fournisseur: {
          id: 2,
          nom: 'Amazon Business',
          email: 'business@amazon.fr',
          telephone: '0800 91 50 51',
          delaiMoyen: 5
        },
        articles: [
          {
            designation: 'Ramette papier A4 (carton de 5)',
            quantite: 10,
            prixUnitaire: 22,
            tva: 20,
            totalHT: 220,
            totalTVA: 44,
            totalTTC: 264
          }
        ],
        montantHT: 220,
        montantTVA: 44,
        montantTTC: 264,
        livraison: {
          destinataire: 'Faure Thomas',
          adresse: 'IUT de Villetaneuse - 99 avenue Jean-Baptiste Clément',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: 'Local fournitures administration'
        },
        statut: 'recue_iut',
        statutLabel: 'Reçue IUT',
        dateValidation: new Date(aujourdhui.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validePar: 'SF Marie Dubois',
        dateSignature: new Date(aujourdhui.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        signePar: 'Dr. Laurent Petit',
        dateBCEnvoye: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateExpedition: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateReceptionIUT: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        numeroSuivi: 'COLISSIMO-EF789123456FR',
        receptionneePar: 'CRIT Service Postal',
        historique: [
          {
            date: new Date(aujourdhui.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'en_attente_validation',
            statutLabel: 'Créée - En attente validation',
            utilisateur: 'Faure Thomas',
            commentaire: 'Commande créée'
          },
          {
            date: new Date(aujourdhui.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'validee',
            statutLabel: 'Validée',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'Validée'
          },
          {
            date: new Date(aujourdhui.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'signee',
            statutLabel: 'Signée',
            utilisateur: 'Directeur Laurent Petit',
            commentaire: 'BC signé'
          },
          {
            date: new Date(aujourdhui.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'bc_envoye',
            statutLabel: 'BC envoyé',
            utilisateur: 'SF Marie Dubois',
            commentaire: 'BC envoyé au fournisseur'
          },
          {
            date: new Date(aujourdhui.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'expediee',
            statutLabel: 'Expédiée',
            utilisateur: 'Fournisseur Amazon',
            commentaire: 'Colis expédié'
          },
          {
            date: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'recue_iut',
            statutLabel: 'Reçue IUT',
            utilisateur: 'CRIT Service Postal',
            commentaire: 'Colis réceptionné - EN RETARD (attente 6 jours)'
          }
        ],
        creePar: 'Faure Thomas',
        dateCreationISO: new Date(aujourdhui.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        derniereModification: new Date(aujourdhui.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Enregistrer toutes les commandes de simulation
    const toutesCommandes = [...bcEnAttenteSignature, ...bcSignes, ...colisExpedies, ...colisRecusIUT];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toutesCommandes));

    console.log('✅ Données de simulation créées:', toutesCommandes.length, 'commandes');
  }

  // Initialiser au chargement
  init();
  initSimulationDirecteur();

  // API publique
  return {
    getAll,
    getById,
    getByNumero,
    creer,
    updateStatut,
    ajouterCommentaire,
    getByStatut,
    getByDemandeur,
    getByDepartement,
    getByFournisseur,
    getByPeriode,
    getStats,
    reset
  };
})();

// Rendre disponible globalement
window.CommandesManager = CommandesManager;

console.log('✅ CommandesManager chargé');
