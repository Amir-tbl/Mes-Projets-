/* ================================================================
   SAE-Colis - Wizard Step 3 (creer-envoi-step3.html)
   Récapitulatif : affichage des données + validation finale
================================================================ */

const euro = (n) => new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n ?? 0);

  function loadJSON(key){
    try{ const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? null; }
    catch(e){ return null; }
  }

  function formatDateFR(s){
    if(!s) return '';
    const d = new Date(s);
    if(Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat('fr-FR',{ dateStyle:'medium' }).format(d);
  }

  function fillText(id, txt){ const el = document.getElementById(id); if(el) el.textContent = txt || '—'; }

  function renderMeta(){
    const req = loadJSON('wizardRequest') || {};
    const sup = loadJSON('wizardSupplier') || {};

    fillText('recapDemandeur', req.demandeur || '—');
    fillText('recapDescription', req.description || '—');
    fillText('recapLivraisonDate', formatDateFR(req.livraisonDateEstimee) || '—');
    fillText('recapLivraisonLieu', req.livraisonLieuSouhaite || '—');

    fillText('recapFournisseurNom', sup.nom || '—');
    fillText('recapFournisseurDelai', (sup.delaiMoyenJours ? (sup.delaiMoyenJours + ' j') : '—'));
    fillText('recapFournisseurEmail', sup.email || '—');
    fillText('recapFournisseurTel', sup.telephone || '—');
  }

  function loadItems(){
    const arr = loadJSON('wizardItems');
    return Array.isArray(arr) ? arr : [];
  }

  function renderRows(items){
    const tbody = document.querySelector('#recapTable tbody');
    if(!tbody) return { ht:0, tva:0, ttc:0 };
    tbody.innerHTML = '';

    let ht = 0, tva = 0;

    items.forEach(it=>{
      const name = it?.name ?? '';
      const qty  = Number(it?.qty ?? 0);
      const pu   = Number(it?.pu  ?? 0);
      const taux = Number(it?.tva ?? 0);

      const lineHT  = qty * pu;
      const lineTVA = lineHT * (taux/100);
      const lineTTC = lineHT + lineTVA;

      ht  += lineHT;
      tva += lineTVA;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${(name+'').replace(/</g,'&lt;')}</td>
        <td>${Number.isFinite(qty)?qty:0}</td>
        <td>${euro(pu)}</td>
        <td>${Number.isFinite(taux)?taux:0}</td>
        <td>${euro(lineTTC)}</td>
      `;
      tbody.appendChild(tr);
    });

    return { ht, tva, ttc: ht + tva };
  }

  function updateTotals(tot){
    const htEl  = document.getElementById('subtotalHTView');
    const tvaEl = document.getElementById('totalTVAView');
    const ttcEl = document.getElementById('grandTotalView');
    if(htEl)  htEl.textContent  = euro(tot.ht);
    if(tvaEl) tvaEl.textContent = euro(tot.tva);
    if(ttcEl) ttcEl.textContent = euro(tot.ttc);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function renderPiecesJointes(){
    const pj = loadJSON('wizardPiecesJointes') || [];
    const section = document.getElementById('piecesJointesSection');
    const recap = document.getElementById('piecesJointesRecap');

    if (!section || !recap) return;

    if (!Array.isArray(pj) || pj.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    let html = '';
    pj.forEach(file => {
      const sizeFormatted = formatFileSize(file.size || 0);
      const fileIcon = (file.type || '').includes('pdf') ? '📄' : '🖼️';

      html += `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <span style="font-size: 20px;">${fileIcon}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 600; color: #1E2A52; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name || 'Fichier sans nom'}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${sizeFormatted}</div>
          </div>
        </div>
      `;
    });

    recap.innerHTML = html;
  }

  function initTerms(){
    const chk = document.getElementById('termsChk');
    const btn = document.getElementById('confirmBtn');
    if(!chk || !btn) return;
    const toggle = ()=>{ btn.disabled = !chk.checked; };
    chk.addEventListener('change', toggle);
    toggle();
  }

  function initConfirm(){
    const btn = document.getElementById('confirmBtn');
    if(!btn) return;
    btn.addEventListener('click', (e)=>{
      e.preventDefault();

      const req = loadJSON('wizardRequest') || {};
      const sup = loadJSON('wizardSupplier') || {};
      const items = loadItems();
      const pj = loadJSON('wizardPiecesJointes') || [];

      let ht = 0, tva = 0;
      items.forEach(it => {
        const lineHT = Number(it?.qty ?? 0) * Number(it?.pu ?? 0);
        const lineTVA = lineHT * (Number(it?.tva ?? 0) / 100);
        ht += lineHT;
        tva += lineTVA;
      });
      const ttc = ht + tva;

      const commandeData = {
        demandeur: {
          nom: 'Butelle Franck',
          email: 'franck.butelle@univ-paris13.fr',
          departement: 'Informatique',
          service: 'IUT Villetaneuse'
        },
        dateCommande: new Date().toISOString().split('T')[0],
        dateLivraisonSouhaitee: req.livraisonDateEstimee || '',
        urgence: false,
        description: req.description || '',

        fournisseur: {
          id: sup.id || 0,
          nom: sup.nom || '',
          email: sup.email || '',
          telephone: sup.telephone || '',
          delaiMoyen: sup.delaiMoyenJours || 0
        },

        articles: items.map(it => ({
          designation: it?.name ?? '',
          quantite: Number(it?.qty ?? 0),
          prixUnitaire: Number(it?.pu ?? 0),
          tva: Number(it?.tva ?? 0)
        })),

        piecesJointes: pj.map(file => ({
          nom: file.name || '',
          taille: file.size || 0,
          type: file.type || '',
          data: file.data || ''
        })),

        montantHT: ht,
        montantTVA: tva,
        montantTTC: ttc,

        livraison: {
          destinataire: req.demandeur || 'Butelle Franck',
          adresse: req.livraisonLieuSouhaite || '',
          codePostal: '93430',
          ville: 'Villetaneuse',
          telephone: '+33 1 49 40 40 40',
          instructions: ''
        }
      };

      // Enregistrer la commande
      const result = window.CommandesManager.creer(commandeData);

      if (result.success) {
        alert(`✅ Commande ${result.commande.numeroCommande} créée avec succès!\n\nLe Service Financier a été notifié et va traiter votre demande.`);

        // Nettoyer le localStorage
        localStorage.removeItem('wizardRequest');
        localStorage.removeItem('wizardSupplier');
        localStorage.removeItem('wizardItems');
        localStorage.removeItem('wizardPiecesJointes');
        localStorage.removeItem('sae_envoi_step2');

        // Redirection vers le tableau de bord
        window.location.href = 'index.html';
      } else {
        alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.');
      }
    });
  }

ready(function() {
  renderMeta();
  const totals = renderRows(loadItems());
  updateTotals(totals);
  renderPiecesJointes();
  initTerms();
  initConfirm();
});
