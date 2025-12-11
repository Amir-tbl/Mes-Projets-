/* ================================================================
   SAE-Colis - Dashboard Service Financier
   Gestion de la validation et suivi des commandes
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

/* ========== DONNÉES DE SIMULATION COMMANDES SF ========== */
const COMMANDES_SF = {
  'BC-2025-0234': {
    numeroCommande: '#BC-2025-0234',
    demandeur: { nom: 'Butelle Franck', departement: 'Informatique', email: 'franck.butelle@univ-paris13.fr' },
    fournisseur: { nom: 'LDLC Pro', contact: 'pro@ldlc.com', telephone: '04 27 46 60 00' },
    description: 'Équipement informatique pour salle de TP.',
    articles: [
      { designation: 'Ordinateur portable Dell Latitude 5540', quantite: 10, prixUnitaire: 890 },
      { designation: 'Souris sans fil Logitech', quantite: 10, prixUnitaire: 25 },
      { designation: 'Tapis de souris', quantite: 10, prixUnitaire: 8 }
    ],
    piecesJointes: [
      { nom: 'devis-ldlc.pdf', type: 'pdf', taille: '180 KB', url: '/uploads/commandes/BC-2025-0234/devis-ldlc.pdf' },
      { nom: 'justificatif-besoin.pdf', type: 'pdf', taille: '95 KB', url: '/uploads/commandes/BC-2025-0234/justificatif-besoin.pdf' }
    ],
    montantHT: 2042,
    montantTTC: 2450,
    dateCommande: '2025-01-10',
    statut: 'en_attente_validation',
    statutLabel: 'À valider',
    urgence: false
  },
  'BC-2025-0235': {
    numeroCommande: '#BC-2025-0235',
    demandeur: { nom: 'Martin Sophie', departement: 'GEA', email: 'sophie.martin@univ-paris13.fr' },
    fournisseur: { nom: 'Dell France', contact: 'commercial@dell.fr', telephone: '01 55 94 70 00' },
    description: 'Ordinateurs pour département GEA.',
    articles: [
      { designation: 'PC Dell OptiPlex 7090', quantite: 8, prixUnitaire: 720 },
      { designation: 'Écran Dell 24"', quantite: 8, prixUnitaire: 180 }
    ],
    montantHT: 1575,
    montantTTC: 1890,
    dateCommande: '2025-01-10',
    statut: 'en_attente_validation',
    statutLabel: 'À valider',
    urgence: true
  },
  'BC-2025-0233': {
    numeroCommande: '#BC-2025-0233',
    demandeur: { nom: 'Leblanc Pierre', departement: 'TC', email: 'pierre.leblanc@univ-paris13.fr' },
    fournisseur: { nom: 'Apple Education', contact: 'education@apple.fr' },
    description: 'MacBook pour département TC.',
    articles: [
      { designation: 'MacBook Air M2 13"', quantite: 5, prixUnitaire: 1200 },
      { designation: 'USB-C vers HDMI', quantite: 5, prixUnitaire: 35 }
    ],
    montantHT: 2667,
    montantTTC: 3200,
    dateCommande: '2025-01-09',
    dateValidation: '2025-01-10',
    statut: 'validee',
    statutLabel: 'À signer',
    urgence: false
  },
  'BC-2025-0230': {
    numeroCommande: '#BC-2025-0230',
    demandeur: { nom: 'Durand Marie', departement: 'Administration', email: 'marie.durand@univ-paris13.fr' },
    fournisseur: { nom: 'HP France', contact: 'ventes@hp.fr' },
    description: 'Imprimante laser.',
    articles: [
      { designation: 'HP LaserJet Pro M404dn', quantite: 3, prixUnitaire: 350 },
      { designation: 'Toner HP 58A noir', quantite: 6, prixUnitaire: 60 }
    ],
    piecesJointes: [
      { nom: 'devis-hp.pdf', type: 'pdf', taille: '220 KB', url: '/uploads/commandes/BC-2025-0230/devis-hp.pdf' }
    ],
    bonCommande: {
      fichier: 'BC-2025-0230.pdf',
      url: '/uploads/bons-commande/BC-2025-0230.pdf',
      dateGeneration: '2025-01-09',
      dateSigne: '2025-01-10',
      signePar: 'Dr. Laurent Petit',
      signature: '/uploads/signatures/BC-2025-0230-signature.png'
    },
    montantHT: 1375,
    montantTTC: 1650,
    dateCommande: '2025-01-08',
    dateValidation: '2025-01-09',
    dateSignature: '2025-01-10',
    dateBCEnvoi: '2025-01-10',
    statut: 'bc_envoye',
    statutLabel: 'BC envoyé',
    urgence: false
  },
  'BC-2025-0228': {
    numeroCommande: '#BC-2025-0228',
    demandeur: { nom: 'Bernard Lucas', departement: 'GB', email: 'lucas.bernard@univ-paris13.fr' },
    fournisseur: { nom: 'Amazon Business', contact: 'entreprise@amazon.fr' },
    description: 'Matériel de laboratoire.',
    articles: [
      { designation: 'Microscope optique', quantite: 2, prixUnitaire: 380 },
      { designation: 'Lames porte-objets (boîte 100)', quantite: 5, prixUnitaire: 15 }
    ],
    montantHT: 742,
    montantTTC: 890,
    dateCommande: '2025-01-07',
    dateExpedition: '2025-01-05',
    dateLivraisonPrevue: '2025-01-10',
    statut: 'expediee',
    statutLabel: 'Retard',
    enRetard: true
  }
};

/* ========== AFFICHER DÉTAILS COMMANDE ========== */
window.afficherDetailsCommande = function(numeroBC) {
  const commande = COMMANDES_SF[numeroBC];
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
                 onmouseover="this.style.background='#f0f9ff'; this.style.borderColor='#10b981';"
                 onmouseout="this.style.background='white'; this.style.borderColor='#e2e8f0';">
                <span style="font-size: 24px;">${iconePJ}</span>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 14px;">${pj.nom}</div>
                  <div style="font-size: 12px; color: #64748b;">${pj.taille}</div>
                </div>
                <span style="color: #10b981; font-size: 12px;">↗ Ouvrir</span>
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
      <div style="padding: 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; color: white;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${commande.numeroCommande}</div>
        <div style="opacity: 0.9;">Statut : ${commande.statutLabel}</div>
        ${commande.urgence ? '<div style="margin-top: 8px; padding: 8px; background: rgba(249, 115, 22, 0.2); border-radius: 4px;">⚡ COMMANDE URGENTE</div>' : ''}
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">DATE COMMANDE</div>
            <div style="font-weight: 600; color: #1E2A52;">${formatDateFR(commande.dateCommande)}</div>
          </div>
          ${commande.dateValidation ? `
          <div style="padding: 12px; background: #f0fdf4; border-radius: 6px;">
            <div style="font-size: 12px; color: #16a34a; margin-bottom: 4px;">DATE VALIDATION</div>
            <div style="font-weight: 600; color: #16a34a;">${formatDateFR(commande.dateValidation)} ✓</div>
          </div>
          ` : ''}
          ${commande.dateSignature ? `
          <div style="padding: 12px; background: #f0fdf4; border-radius: 6px;">
            <div style="font-size: 12px; color: #16a34a; margin-bottom: 4px;">DATE SIGNATURE</div>
            <div style="font-weight: 600; color: #16a34a;">${formatDateFR(commande.dateSignature)} ✓</div>
          </div>
          ` : ''}
        </div>
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

ready(function() {
  console.log('Dashboard Service Financier - Chargement...');

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

  /* ========== SIMULATION DONNÉES SF ========== */
  const sfData = {
    kpis: {
      aValider: 12,
      aSigner: 8,
      bonsEnvoyes: 15,
      livrees: 23,
      retards: 3,
      aPayer: 7
    },
    stats: {
      montantTotal: '45 680 €',
      nbCommandes: 67,
      delaiMoyen: '4,2 j',
      tauxValidation: '94%'
    },
    commandesRecentes: [
      {
        numero: '#BC-2025-0234',
        demandeur: 'Butelle Franck',
        fournisseur: 'LDLC',
        montant: '2 450,00 €',
        date: '10 jan 2025',
        statut: 'a_valider',
        statutLabel: 'À valider',
        statutClass: 'b-grey'
      },
      {
        numero: '#BC-2025-0235',
        demandeur: 'Martin Sophie',
        fournisseur: 'Dell',
        montant: '1 890,00 €',
        date: '10 jan 2025',
        statut: 'a_valider',
        statutLabel: 'À valider',
        statutClass: 'b-grey'
      },
      {
        numero: '#BC-2025-0233',
        demandeur: 'Leblanc Pierre',
        fournisseur: 'Apple',
        montant: '3 200,00 €',
        date: '09 jan 2025',
        statut: 'a_signer',
        statutLabel: 'À signer',
        statutClass: 'b-blue'
      },
      {
        numero: '#BC-2025-0230',
        demandeur: 'Durand Marie',
        fournisseur: 'HP',
        montant: '1 650,00 €',
        date: '08 jan 2025',
        statut: 'bc_envoye',
        statutLabel: 'BC envoyé',
        statutClass: 'b-green'
      },
      {
        numero: '#BC-2025-0228',
        demandeur: 'Bernard Lucas',
        fournisseur: 'Amazon',
        montant: '890,00 €',
        date: '07 jan 2025',
        statut: 'retard',
        statutLabel: 'Retard',
        statutClass: 'b-red'
      }
    ],
    commandesUrgentes: [
      {
        numero: '#BC-2025-0234',
        demandeur: 'Butelle Franck',
        montant: '2 450,00 €',
        fournisseur: 'LDLC'
      },
      {
        numero: '#BC-2025-0235',
        demandeur: 'Martin Sophie',
        montant: '1 890,00 €',
        fournisseur: 'Dell'
      },
      {
        numero: '#BC-2025-0232',
        demandeur: 'Dupont Jean',
        montant: '850,00 €',
        fournisseur: 'Amazon'
      }
    ]
  };

  function loadKPIs() {
    document.getElementById('kpiAValider').textContent = sfData.kpis.aValider;
    document.getElementById('kpiASigner').textContent = sfData.kpis.aSigner;
    document.getElementById('kpiBonsEnvoyes').textContent = sfData.kpis.bonsEnvoyes;
    document.getElementById('kpiLivrees').textContent = sfData.kpis.livrees;
    document.getElementById('kpiRetards').textContent = sfData.kpis.retards;
    document.getElementById('kpiAPayer').textContent = sfData.kpis.aPayer;

    console.log('✅ KPIs chargés');
  }

  function loadStats() {
    document.getElementById('statMontantTotal').textContent = sfData.stats.montantTotal;
    document.getElementById('statNbCommandes').textContent = sfData.stats.nbCommandes;
    document.getElementById('statDelaiMoyen').textContent = sfData.stats.delaiMoyen;
    document.getElementById('statTauxValidation').textContent = sfData.stats.tauxValidation;

    console.log('✅ Statistiques chargées');
  }

  function loadTableau() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    console.log('✅ Tableau déjà présent dans le HTML');
  }

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

  loadKPIs();
  loadStats();
  loadTableau();

  console.log('✅ Dashboard Service Financier chargé avec succès');
});
