/* ================================================================
   SAE-Colis - Interface Agent
   Gestion des envois et affichage des détails
================================================================ */

const formatDateFR = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(date);
};

const formatMontant = (montant) => {
  if (!montant && montant !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
};

/* ========== DONNÉES DE SIMULATION ========== */
const COMMANDES_AGENT = {
  'BC-2025-1001': {
    numeroCommande: '#BC-2025-1001',
    demandeur: { nom: 'Butelle Franck', departement: 'Informatique', email: 'franck.butelle@univ-paris13.fr' },
    fournisseur: { nom: 'Dell France', contact: 'commercial@dell.fr', telephone: '01 55 94 70 00' },
    description: 'Équipement urgent pour la nouvelle salle de TP Python.',
    articles: [
      { designation: 'PC Dell OptiPlex 7090', quantite: 15, prixUnitaire: 850 },
      { designation: 'Écran Dell 24" Full HD', quantite: 15, prixUnitaire: 180 }
    ],
    piecesJointes: [
      { nom: 'devis-dell.pdf', type: 'pdf', taille: '245 KB', url: '/uploads/commandes/BC-2025-1001/devis-dell.pdf' },
      { nom: 'plan-salle-tp.jpg', type: 'image', taille: '1.2 MB', url: '/uploads/commandes/BC-2025-1001/plan-salle-tp.jpg' }
    ],
    bonCommande: {
      fichier: 'BC-2025-1001.pdf',
      url: '/uploads/bons-commande/BC-2025-1001.pdf',
      dateGeneration: '2025-01-11',
      dateSigne: '2025-01-12',
      signePar: 'Dr. Laurent Petit',
      signature: '/uploads/signatures/BC-2025-1001-signature.png'
    },
    montantHT: 15450,
    montantTTC: 18540,
    dateCommande: '2025-01-10',
    statut: 'expediee',
    statutLabel: 'En cours d\'expédition',
    numeroSuivi: 'CHRONOPOST-DL1001FR',
    livraison: {
      destinataire: 'Butelle Franck',
      adresse: 'IUT de Villetaneuse - Salle Info B201',
      instructions: 'Déposer au bureau du responsable informatique'
    }
  },
  'BC-2025-0998': {
    numeroCommande: '#BC-2025-0998',
    demandeur: { nom: 'Martin Sophie', departement: 'GEA', email: 'sophie.martin@univ-paris13.fr' },
    fournisseur: { nom: 'LDLC Pro', contact: 'pro@ldlc.com', telephone: '04 27 46 60 00' },
    description: 'Matériel informatique pour salle de cours.',
    articles: [
      { designation: 'Vidéoprojecteur EPSON EB-W51', quantite: 2, prixUnitaire: 550 },
      { designation: 'Câble HDMI 5m', quantite: 3, prixUnitaire: 15 },
      { designation: 'Adaptateur USB-C vers HDMI', quantite: 5, prixUnitaire: 25 }
    ],
    montantHT: 2042,
    montantTTC: 2450,
    dateCommande: '2025-01-08',
    statut: 'validee',
    statutLabel: 'En attente d\'expédition'
  },
  'BC-2025-0985': {
    numeroCommande: '#BC-2025-0985',
    demandeur: { nom: 'Dupont Jean', departement: 'TC', email: 'jean.dupont@univ-paris13.fr' },
    fournisseur: { nom: 'Amazon Business', contact: 'entreprise@amazon.fr' },
    description: 'Fournitures de bureau pour département TC.',
    articles: [
      { designation: 'Ramettes papier A4 80g (carton de 10)', quantite: 5, prixUnitaire: 35 },
      { designation: 'Stylos BIC Cristal (boîte de 50)', quantite: 10, prixUnitaire: 12 },
      { designation: 'Classeurs à levier (lot de 10)', quantite: 5, prixUnitaire: 25 }
    ],
    montantHT: 708,
    montantTTC: 850,
    dateCommande: '2025-01-05',
    dateLivraison: '2025-01-08',
    statut: 'livree',
    statutLabel: 'Livré',
    numeroSuivi: 'COLISSIMO-AB985123FR'
  },
  'BC-2025-0970': {
    numeroCommande: '#BC-2025-0970',
    demandeur: { nom: 'Rousseau Anne', departement: 'GEA', email: 'anne.rousseau@univ-paris13.fr' },
    fournisseur: { nom: 'HP France', contact: 'ventes@hp.fr', telephone: '01 49 77 40 00' },
    description: 'Imprimante laser pour département GEA.',
    articles: [
      { designation: 'Imprimante HP LaserJet Pro M404dn', quantite: 2, prixUnitaire: 350 },
      { designation: 'Toner HP 58A noir (pack de 2)', quantite: 3, prixUnitaire: 120 }
    ],
    montantHT: 2667,
    montantTTC: 3200,
    dateCommande: '2025-01-02',
    dateExpedition: '2025-01-04',
    statut: 'expediee',
    statutLabel: 'En retard',
    numeroSuivi: 'CHRONOPOST-HP970456FR',
    enRetard: true
  },
  'BC-2025-0955': {
    numeroCommande: '#BC-2025-0955',
    demandeur: { nom: 'Garcia Pablo', departement: 'Administration', email: 'pablo.garcia@univ-paris13.fr' },
    fournisseur: { nom: 'Bureau Vallée', contact: 'contact@bureau-vallee.fr' },
    description: 'Mobilier de bureau.',
    articles: [
      { designation: 'Chaise de bureau ergonomique', quantite: 4, prixUnitaire: 120 },
      { designation: 'Lampe de bureau LED', quantite: 3, prixUnitaire: 25 }
    ],
    montantHT: 517,
    montantTTC: 620,
    dateCommande: '2024-12-28',
    dateLivraison: '2025-01-02',
    statut: 'livree',
    statutLabel: 'Livré',
    numeroSuivi: 'COLISSIMO-BV955789FR'
  }
};

/* ========== AFFICHER DÉTAILS COMMANDE ========== */
window.afficherDetailsCommande = function(numeroBC) {
  const commande = COMMANDES_AGENT[numeroBC];
  if (!commande) {
    alert('Commande introuvable');
    return;
  }

  const modalDetailsContent = document.getElementById('modalDetailsContent');
  if (!modalDetailsContent) return;

  let tableauArticles = '';
  if (commande.articles && commande.articles.length > 0) {
    tableauArticles = `
      <div style="margin-top: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">Articles commandés</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Article</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Qté</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Prix unit.</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${commande.articles.map(art => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${art.designation}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f1f5f9;">${art.quantite}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">${formatMontant(art.prixUnitaire)}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${formatMontant(art.quantite * art.prixUnitaire)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  let piecesJointesHTML = '';
  if (commande.piecesJointes && commande.piecesJointes.length > 0) {
    piecesJointesHTML = `
      <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 12px 0; color: #1E2A52; font-size: 16px;">📎 Pièces jointes de la demande</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${commande.piecesJointes.map(pj => {
            const iconePJ = pj.type === 'pdf' ? '📄' : pj.type === 'image' ? '🖼️' : '📎';
            return `
              <a href="${pj.url}" target="_blank"
                 style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: white; border-radius: 6px; text-decoration: none; color: #1E2A52; border: 1px solid #e2e8f0; transition: all 0.2s ease;"
                 onmouseover="this.style.background='#f0f9ff'; this.style.borderColor='#3b82f6';"
                 onmouseout="this.style.background='white'; this.style.borderColor='#e2e8f0';">
                <span style="font-size: 24px;">${iconePJ}</span>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 14px;">${pj.nom}</div>
                  <div style="font-size: 12px; color: #64748b;">${pj.taille}</div>
                </div>
                <span style="color: #3b82f6; font-size: 12px;">↗ Ouvrir</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  let bonCommandeHTML = '';
  if (commande.bonCommande) {
    bonCommandeHTML = `
      <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border: 2px solid #86efac;">
        <h4 style="margin: 0 0 12px 0; color: #166534; font-size: 16px;">✅ Bon de commande signé</h4>
        <div style="display: grid; gap: 12px;">
          <a href="${commande.bonCommande.url}" target="_blank"
             style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: white; border-radius: 6px; text-decoration: none; color: #1E2A52; border: 1px solid #86efac; transition: all 0.2s ease;"
             onmouseover="this.style.background='#f0fdf4'; this.style.borderColor='#22c55e';"
             onmouseout="this.style.background='white'; this.style.borderColor='#86efac';">
            <span style="font-size: 28px;">📋</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px;">${commande.bonCommande.fichier}</div>
              <div style="font-size: 12px; color: #64748b;">Généré le ${formatDateFR(commande.bonCommande.dateGeneration)}</div>
            </div>
            <span style="color: #22c55e; font-size: 12px;">↗ Télécharger</span>
          </a>
          ${commande.bonCommande.dateSigne ? `
          <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 10px 12px; background: white; border-radius: 6px; border: 1px solid #86efac;">
            <div>
              <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 4px;">SIGNÉ PAR</div>
              <div style="font-weight: 600; color: #1E2A52;">${commande.bonCommande.signePar}</div>
              <div style="font-size: 12px; color: #64748b;">Le ${formatDateFR(commande.bonCommande.dateSigne)}</div>
            </div>
            ${commande.bonCommande.signature ? `
            <div style="display: flex; align-items: center;">
              <img src="${commande.bonCommande.signature}" alt="Signature" style="max-width: 120px; max-height: 60px; border: 1px solid #e2e8f0; border-radius: 4px; background: white; padding: 4px;">
            </div>
            ` : ''}
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  modalDetailsContent.innerHTML = `
    <div style="display: grid; gap: 20px;">
      <div style="padding: 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; color: white;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${commande.numeroCommande}</div>
        <div style="opacity: 0.9;">Statut : ${commande.statutLabel}</div>
        ${commande.enRetard ? '<div style="margin-top: 8px; padding: 8px; background: rgba(239, 68, 68, 0.2); border-radius: 4px;">⚠️ Cette commande est en retard</div>' : ''}
      </div>

      <div style="display: grid; gap: 12px;">
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DEMANDEUR</div>
          <div style="font-weight: 600; color: #1E2A52;">${commande.demandeur.nom}</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${commande.demandeur.departement}${commande.demandeur.email ? ' • ' + commande.demandeur.email : ''}</div>
        </div>

        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">FOURNISSEUR</div>
          <div style="font-weight: 600; color: #1E2A52;">${commande.fournisseur.nom}</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
            ${commande.fournisseur.contact ? commande.fournisseur.contact : ''}
            ${commande.fournisseur.telephone ? ' • ' + commande.fournisseur.telephone : ''}
          </div>
        </div>

        ${commande.description ? `
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DESCRIPTION</div>
          <div style="color: #1E2A52;">${commande.description}</div>
        </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">MONTANT HT</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatMontant(commande.montantHT)}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">MONTANT TTC</div>
            <div style="font-weight: 600; color: #1E2A52; font-size: 18px;">${formatMontant(commande.montantTTC)}</div>
          </div>
        </div>

        ${commande.numeroSuivi ? `
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">NUMÉRO DE SUIVI</div>
          <div style="font-weight: 600; color: #1E2A52; font-family: monospace;">${commande.numeroSuivi}</div>
        </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: ${commande.dateLivraison ? '1fr 1fr' : '1fr'}; gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE COMMANDE</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(commande.dateCommande)}</div>
          </div>
          ${commande.dateLivraison ? `
          <div style="padding: 12px; background: #f0fdf4; border-radius: 6px;">
            <div style="font-size: 12px; color: #16a34a; margin-bottom: 4px;">DATE LIVRAISON</div>
            <div style="font-weight: 600; color: #16a34a;">${formatDateFR(commande.dateLivraison)} ✓</div>
          </div>
          ` : ''}
        </div>

        ${commande.livraison ? `
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">ADRESSE DE LIVRAISON</div>
          <div style="font-weight: 600; color: #1E2A52;">${commande.livraison.destinataire || commande.demandeur.nom}</div>
          <div style="color: #64748b; margin-top: 4px;">${commande.livraison.adresse || ''}</div>
          ${commande.livraison.instructions ? `<div style="color: #64748b; margin-top: 4px; font-style: italic;">📝 ${commande.livraison.instructions}</div>` : ''}
        </div>
        ` : ''}
      </div>

      ${tableauArticles}
      ${piecesJointesHTML}
      ${bonCommandeHTML}
    </div>
  `;

  const modal = document.getElementById('modalDetails');
  const modalTitle = document.getElementById('modalDetailsTitle');
  if (modalTitle) modalTitle.textContent = `Détails ${commande.numeroCommande}`;
  if (modal) modal.hidden = false;
};

/* ========== FERMER MODAL DÉTAILS ========== */
function fermerModalDetails() {
  const modal = document.getElementById('modalDetails');
  if (modal) modal.hidden = true;
}

/* ========== INITIALISATION ========== */
ready(function() {
  const btnCloseModalDetails = document.getElementById('btnCloseModalDetails');
  const btnFermerDetails = document.getElementById('btnFermerDetails');
  const modalDetails = document.getElementById('modalDetails');

  if (btnCloseModalDetails) {
    btnCloseModalDetails.addEventListener('click', fermerModalDetails);
  }
  if (btnFermerDetails) {
    btnFermerDetails.addEventListener('click', fermerModalDetails);
  }
  if (modalDetails) {
    modalDetails.addEventListener('click', (e) => {
      if (e.target === modalDetails || e.target.classList.contains('modal-overlay')) {
        fermerModalDetails();
      }
    });
  }
});
