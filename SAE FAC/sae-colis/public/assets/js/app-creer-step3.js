// Step3 : charge meta (demandeur, livraison, fournisseur) + articles, calcule totaux
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  const euro = (n)=> new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n ?? 0);

  function loadJSON(key){
    try{ const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? null; }
    catch(e){ return null; }
  }

  function formatDateFR(s){
    if(!s) return '';
    const d = new Date(s);
    if(Number.isNaN(d.getTime())) return s; // si ce n'est pas ISO, on affiche tel quel
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
      alert('Envoi confirmé ✅');
      // TODO: POST serveur / redirection de confirmation
    });
  }

  ready(function(){
    renderMeta();
    const totals = renderRows(loadItems());
    updateTotals(totals);
    initTerms();
    initConfirm();
  });
})();
