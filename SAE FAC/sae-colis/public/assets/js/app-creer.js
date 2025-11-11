// Burger + overlay + déplacement recherche + validation Étape 1 + brouillon
(function(){
  function ready(fn){
    if(document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    /* ------- Burger / Overlay / Recherche Mobile ------- */
    const sidebar = document.getElementById('sidebar');
    const burger  = document.getElementById('burger');
    const overlay = document.getElementById('overlay');
    const topSearch     = document.getElementById('topSearch');
    const navSearchSlot = document.getElementById('navSearchSlot');
    const mqMobile = window.matchMedia('(max-width: 768px)');

    function openMenu(){
      sidebar.classList.add('is-open');
      sidebar.setAttribute('aria-hidden','false');
      if(overlay){ overlay.hidden=false; void overlay.offsetWidth; overlay.classList.add('show'); }
      burger.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';
    }
    function closeMenu(){
      sidebar.classList.remove('is-open');
      sidebar.setAttribute('aria-hidden','true');
      if(overlay){ overlay.classList.remove('show'); setTimeout(()=>{ overlay.hidden=true; },200); }
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
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
      }else{
        const header = document.querySelector('.topbar');
        if(header && !header.contains(topSearch)){
          header.appendChild(topSearch);
        }
        navSearchSlot.setAttribute('aria-hidden','true');
      }
    }
    window.addEventListener('resize', ()=>{ relocateSearch(); if(!mqMobile.matches) closeMenu(); });
    relocateSearch();

    /* ------- Wizard Étape 1 : Validation & Draft ------- */
    const form = document.getElementById('formStep1');
    const btnDraft = document.getElementById('btnDraft');
    const btnCancel= document.getElementById('btnCancel');

    // Recharger un brouillon (si existant)
    try{
      const draft = JSON.parse(localStorage.getItem('sae_envoi_step1') || 'null');
      if(draft){
        for(const [k,v] of Object.entries(draft)){
          const el = document.getElementById(k);
          if(!el) continue;
          if(el.type === 'file') continue;
          if(el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'INPUT'){
            el.value = v;
          }
        }
      }
    }catch(e){ /* ignore */ }

    function serializeForm(){
      const data = {};
      ['demandeur','departement','titre','description','budget','dateSouhaitee','lieu'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) data[id] = el.value.trim();
      });
      return data;
    }

    function validateForm(){
      const requiredIds = ['departement','titre','description','budget','dateSouhaitee','lieu'];
      let valid = true;
      requiredIds.forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return;
        const ok = el.value && el.value.trim() !== '';
        el.classList.toggle('is-invalid', !ok);
        if(!ok) valid = false;
      });
      // budget ≥ 0
      const b = document.getElementById('budget');
      if(b && (Number.isNaN(+b.value) || +b.value < 0)){ b.classList.add('is-invalid'); valid = false; }
      return valid;
    }

    // Styles invalides minimalistes (via JS pour rester scoppé)
    const style = document.createElement('style');
    style.textContent = `
      .page-wizard .wizard-form .is-invalid{ border-color:#E5484D !important; box-shadow:0 0 0 2px rgba(229,72,77,.12) inset; }
    `;
    document.head.appendChild(style);

    if(btnDraft){
      btnDraft.addEventListener('click', ()=>{
        const payload = serializeForm();
        localStorage.setItem('sae_envoi_step1', JSON.stringify(payload));
        alert('Brouillon enregistré ✅');
      });
    }

    if(btnCancel){
      btnCancel.addEventListener('click', ()=>{
        if(confirm('Annuler la création et revenir au tableau de bord ?')){
          window.location.href = 'index.html';
        }
      });
    }

    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        if(!validateForm()){
          alert('Merci de compléter les champs requis.');
          return;
        }
        const payload = serializeForm();
        localStorage.setItem('sae_envoi_step1', JSON.stringify(payload));
        // 👉 ici vous enchaînerez vers l’étape 2 (fournisseur & articles)
        window.location.href = 'creer-envoi-step2.html';
        alert('Étape 1 validée ✅ — prochaine étape : Fournisseur & Articles');
      });
    }
  });
})();
