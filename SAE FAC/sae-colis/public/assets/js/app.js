// Burger + overlay + déplacement de la recherche en mobile
(function(){
  function ready(fn){
    if(document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    const sidebar = document.getElementById('sidebar');
    const burger  = document.getElementById('burger');
    const overlay = document.getElementById('overlay');

    const topSearch     = document.getElementById('topSearch');
    const navSearchSlot = document.getElementById('navSearchSlot');

    if(!sidebar || !burger){
      console.error('[app] #sidebar ou #burger manquant');
      return;
    }

    const mqMobile = window.matchMedia('(max-width: 768px)');

    function openMenu(){
      sidebar.classList.add('is-open');
      sidebar.setAttribute('aria-hidden','false');
      if(overlay){
        overlay.hidden = false; void overlay.offsetWidth; overlay.classList.add('show');
      }
      burger.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu(){
      sidebar.classList.remove('is-open');
      sidebar.setAttribute('aria-hidden','true');
      if(overlay){
        overlay.classList.remove('show');
        setTimeout(()=>{ overlay.hidden = true; }, 200);
      }
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }

    function toggleMenu(e){
      if(e) e.preventDefault();
      (sidebar.classList.contains('is-open') ? closeMenu : openMenu)();
    }

    // Déplacer la barre de recherche en mobile
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

    // Listeners
    burger.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && sidebar.classList.contains('is-open')) closeMenu(); });
    window.addEventListener('resize', ()=>{
      relocateSearch();
      if(!mqMobile.matches) closeMenu();
    });

    // Init
    relocateSearch();
  });
})();
