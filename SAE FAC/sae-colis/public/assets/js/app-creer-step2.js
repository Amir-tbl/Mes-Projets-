// Étape 2 : Fournisseur & Articles (burger, recherche, supplier other, lignes dynamiques, totaux, draft)
(function(){
  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function(){
    /* ---------- Burger / Overlay / Recherche mobile ---------- */
    const sidebar = document.getElementById('sidebar');
    const burger  = document.getElementById('burger');
    const overlay = document.getElementById('overlay');
    const topSearch     = document.getElementById('topSearch');
    const navSearchSlot = document.getElementById('navSearchSlot');
    const mqMobile = window.matchMedia('(max-width: 768px)');

    function openMenu(){
      sidebar.classList.add('is-open'); sidebar.setAttribute('aria-hidden','false');
      if(overlay){ overlay.hidden=false; void overlay.offsetWidth; overlay.classList.add('show'); }
      burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden';
    }
    function closeMenu(){
      sidebar.classList.remove('is-open'); sidebar.setAttribute('aria-hidden','true');
      if(overlay){ overlay.classList.remove('show'); setTimeout(()=>overlay.hidden=true,200); }
      burger.setAttribute('aria-expanded','false'); document.body.style.overflow='';
    }
    function toggleMenu(e){ if(e) e.preventDefault(); (sidebar.classList.contains('is-open')?closeMenu:openMenu)(); }
    if(burger) burger.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && sidebar.classList.contains('is-open')) closeMenu(); });

    function relocateSearch(){
      if(!topSearch || !navSearchSlot) return;
      if(mqMobile.matches){
        if(!navSearchSlot.contains(topSearch)){
          navSearchSlot.appendChild(topSearch);
          navSearchSlot.setAttribute('aria-hidden','false');
        }
      } else {
        const header = document.querySelector('.topbar');
        if(header && !header.contains(topSearch)) header.appendChild(topSearch);
        navSearchSlot.setAttribute('aria-hidden','true');
      }
    }
    window.addEventListener('resize', ()=>{ relocateSearch(); if(!mqMobile.matches) closeMenu(); });
    relocateSearch();

    /* ---------- Utilitaires ---------- */
    const fmt = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function valNum(el, fallback=0){
      if(!el) return fallback;
      const v = String(el.value || '').replace(',', '.');
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }

    /* ---------- Fournisseur : gestion "Autre" ---------- */
    const supplier = document.getElementById('supplier');
    const otherBlocks = document.querySelectorAll('.supplier-other');
    function updateSupplierOther(){
      const isOther = supplier && supplier.value === '_other';
      otherBlocks.forEach(b=> b.hidden = !isOther);
    }
    if(supplier){
      supplier.addEventListener('change', updateSupplierOther);
      updateSupplierOther();
    }

    /* ---------- Articles dynamiques ---------- */
    const body = document.getElementById('articlesBody');
    const btnAddRow = document.getElementById('btnAddRow');
    const btnClear  = document.getElementById('btnClearRows');

    const elSubtotal = document.getElementById('subtotalHT');
    const elTVA      = document.getElementById('totalTVA');
    const elGrand    = document.getElementById('grandTotal');

    function rowTemplate(item={}){
      const id = 'r'+Math.random().toString(36).slice(2,8);
      const tr = document.createElement('tr');
      tr.dataset.rowid = id;
      tr.innerHTML = `
        <td>
          <div class="cell-input">
            <input type="text" class="cell-designation" placeholder="Désignation" value="${item.designation||''}">
          </div>
        </td>
        <td>
          <div class="cell-input">
            <input type="number" class="cell-qty" min="0" step="1" inputmode="numeric" value="${item.qty ?? 1}">
          </div>
        </td>
        <td>
          <div class="cell-input">
            <input type="number" class="cell-unit" min="0" step="0.01" inputmode="decimal" value="${item.unit ?? 0}">
          </div>
        </td>
        <td>
          <div class="cell-input">
            <input type="number" class="cell-tva" min="0" step="0.01" inputmode="decimal" value="${item.tva ?? 20}">
          </div>
        </td>
        <td class="cell-total" data-total="0">0,00 €</td>
        <td class="row-actions" style="text-align:right; padding-right:16px;">
          <button type="button" class="btn-danger" title="Supprimer la ligne">Supprimer</button>
        </td>
      `;
      // events
      tr.querySelector('.cell-qty').addEventListener('input', recalcAll);
      tr.querySelector('.cell-unit').addEventListener('input', recalcAll);
      tr.querySelector('.cell-tva').addEventListener('input', recalcAll);
      tr.querySelector('.cell-designation').addEventListener('input', saveDraft);
      tr.querySelector('.btn-danger').addEventListener('click', ()=>{ tr.remove(); recalcAll(); saveDraft(); });
      return tr;
    }

    function addRow(item){ body.appendChild(rowTemplate(item)); recalcAll(); }
    function clearRows(){ body.innerHTML=''; recalcAll(); saveDraft(); }

    if(btnAddRow) btnAddRow.addEventListener('click', ()=> addRow({qty:1, unit:0, tva:20}));
    if(btnClear)  btnClear.addEventListener('click', clearRows);

    function recalcAll(){
      let subtotal = 0, tvaTotal = 0;
      [...body.querySelectorAll('tr')].forEach(tr=>{
        const qty  = valNum(tr.querySelector('.cell-qty'), 0);
        const unit = valNum(tr.querySelector('.cell-unit'), 0);
        const tva  = valNum(tr.querySelector('.cell-tva'), 20);
        const lineHT = Math.max(0, qty) * Math.max(0, unit);
        const lineTVA = lineHT * Math.max(0, tva) / 100;
        subtotal += lineHT;
        tvaTotal += lineTVA;
        const tdTotal = tr.querySelector('.cell-total');
        if(tdTotal){
          tdTotal.dataset.total = (lineHT+lineTVA).toFixed(2);
          tdTotal.textContent = fmt.format(lineHT+lineTVA) + ' €';
        }
      });
      if(elSubtotal) elSubtotal.textContent = fmt.format(subtotal) + ' €';
      if(elTVA)      elTVA.textContent      = fmt.format(tvaTotal) + ' €';
      if(elGrand)    elGrand.textContent    = fmt.format(subtotal + tvaTotal) + ' €';
    }

    /* ---------- Draft (localStorage) ---------- */
    const form = document.getElementById('formStep2');
    const btnDraft = document.getElementById('btnDraft');

    function serializeArticles(){
      return [...body.querySelectorAll('tr')].map(tr=>({
        designation: tr.querySelector('.cell-designation')?.value?.trim() || '',
        qty:  valNum(tr.querySelector('.cell-qty'), 0),
        unit: valNum(tr.querySelector('.cell-unit'), 0),
        tva:  valNum(tr.querySelector('.cell-tva'), 20),
      })).filter(it => it.designation || it.qty>0 || it.unit>0);
    }
    function serializeSupplier(){
      const sup = supplier?.value || '';
      const payload = {
        supplier: sup,
        supplierDelay: document.getElementById('supplierDelay')?.value || '',
        supplierName: document.getElementById('supplierName')?.value || '',
        supplierEmail: document.getElementById('supplierEmail')?.value || '',
        supplierPhone: document.getElementById('supplierPhone')?.value || '',
      };
      return payload;
    }
    function saveDraft(){
      const data = {
        supplier: serializeSupplier(),
        articles: serializeArticles(),
      };
      localStorage.setItem('sae_envoi_step2', JSON.stringify(data));
    }

    // charger brouillon si présent
    try{
      const draft = JSON.parse(localStorage.getItem('sae_envoi_step2') || 'null');
      if(draft){
        // supplier
        if(draft.supplier){
          if(supplier){ supplier.value = draft.supplier.supplier || ''; updateSupplierOther(); }
          const sDelay = document.getElementById('supplierDelay'); if(sDelay) sDelay.value = draft.supplier.supplierDelay || '';
          const sName  = document.getElementById('supplierName');  if(sName)  sName.value  = draft.supplier.supplierName || '';
          const sMail  = document.getElementById('supplierEmail'); if(sMail)  sMail.value  = draft.supplier.supplierEmail || '';
          const sPhone = document.getElementById('supplierPhone'); if(sPhone) sPhone.value = draft.supplier.supplierPhone || '';
        }
        // articles
        if(Array.isArray(draft.articles) && draft.articles.length){
          draft.articles.forEach(addRow);
        }else{
          addRow({qty:1, unit:0, tva:20});
        }
      }else{
        addRow({qty:1, unit:0, tva:20});
      }
    }catch(e){
      addRow({qty:1, unit:0, tva:20});
    }
    recalcAll();

    // écoute sauvegarde
    if(btnDraft) btnDraft.addEventListener('click', ()=>{ saveDraft(); alert('Brouillon enregistré ✅'); });

    // validation de l’étape
    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        // règles minimales : fournisseur choisi (ou “Autre” + nom), au moins 1 article valable
        let ok = true;
        if(!supplier || !supplier.value){
          supplier.classList.add('is-invalid'); ok = false;
        }else{
          supplier.classList.remove('is-invalid');
          if(supplier.value === '_other'){
            const sName = document.getElementById('supplierName');
            if(!sName || !sName.value.trim()){ sName?.classList.add('is-invalid'); ok = false; }
            else sName.classList.remove('is-invalid');
          }
        }
        const arts = serializeArticles();
        if(!arts.length){ ok = false; alert("Ajoutez au moins un article."); return; }

        // décor classe invalid pour quantités/prix négatifs
        [...body.querySelectorAll('tr')].forEach(tr=>{
          const q = tr.querySelector('.cell-qty');
          const u = tr.querySelector('.cell-unit');
          const vq = valNum(q,0), vu = valNum(u,0);
          q.classList.toggle('is-invalid', vq<0);
          u.classList.toggle('is-invalid', vu<0);
          if(vq<0 || vu<0) ok = false;
        });

        if(!ok){
          const style = document.getElementById('wizardInvalidCSS') || document.createElement('style');
          style.id = 'wizardInvalidCSS';
          style.textContent = `.page-wizard .is-invalid{ border-color:#E5484D !important; box-shadow:0 0 0 2px rgba(229,72,77,.12) inset; }`;
          document.head.appendChild(style);
          alert("Merci de compléter les champs requis.");
          return;
        }

        // OK → sauvegarde et passer à l’étape 3
        saveDraft();
        // Remplace par l'URL de l'étape 3 quand prête :
        alert('Étape 2 validée ✅ — prochaine étape : Livraison & Validation');
        window.location.href = 'creer-envoi-step3.html';
      });
    }

    /* --------- Bonus: rendu molette => scroll horizontal du tableau --------- */
    (function(){
      const wrap = document.querySelector('.articlesWrap');
      if(!wrap) return;
      wrap.addEventListener('wheel', (e)=>{
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
          wrap.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive:false });
      // drag horizontal pointer events
      let isDown=false, startX=0, startLeft=0;
      wrap.addEventListener('pointerdown', (e)=>{ isDown=true; wrap.setPointerCapture(e.pointerId); startX=e.clientX; startLeft=wrap.scrollLeft; });
      wrap.addEventListener('pointermove', (e)=>{ if(!isDown) return; wrap.scrollLeft = startLeft - (e.clientX - startX); });
      wrap.addEventListener('pointerup', ()=> isDown=false);
      wrap.addEventListener('pointercancel', ()=> isDown=false);
    })();
  });
})();
