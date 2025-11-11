// Burger + overlay + recherche mobile + filtres + export CSV
(function(){
  function ready(fn){
    if(document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    /* -------------------- Burger + Overlay -------------------- */
    const sidebar = document.getElementById('sidebar');
    const burger  = document.getElementById('burger');
    const overlay = document.getElementById('overlay');

    const topSearch     = document.getElementById('topSearch');
    const navSearchSlot = document.getElementById('navSearchSlot');

    const mqMobile = window.matchMedia('(max-width: 768px)');

    function openMenu(){
      sidebar.classList.add('is-open');
      sidebar.setAttribute('aria-hidden','false');
      if(overlay){
        overlay.hidden = false; void overlay.offsetWidth; overlay.classList.add('show');
      }
      if(burger) burger.setAttribute('aria-expanded','true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu(){
      sidebar.classList.remove('is-open');
      sidebar.setAttribute('aria-hidden','true');
      if(overlay){ overlay.classList.remove('show'); setTimeout(()=>{ overlay.hidden = true; }, 200); }
      if(burger) burger.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
    function toggleMenu(e){
      if(e) e.preventDefault();
      (sidebar.classList.contains('is-open') ? closeMenu : openMenu)();
    }
    if(burger) burger.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && sidebar.classList.contains('is-open')) closeMenu(); });

    /* -------------------- Relocate Search -------------------- */
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
    window.addEventListener('resize', ()=>{
      if(!mqMobile.matches) closeMenu();
      relocateSearch();
    });
    relocateSearch();

    /* -------------------- Filtres Historique -------------------- */
    const table        = document.getElementById('historyTable');
    const tbody        = table ? table.querySelector('tbody') : null;
    const statusSelect = document.getElementById('status');
    const globalSearch = document.getElementById('globalSearch');
    const dateFrom     = document.getElementById('dateFrom');
    const dateTo       = document.getElementById('dateTo');
    const btnExportCsv = document.getElementById('exportCsv');

    function parseISO(row){
      const cell = row.querySelector('[data-col="date"]');
      if(!cell) return null;
      const iso = cell.getAttribute('data-iso');
      return iso ? new Date(iso+'T00:00:00') : null;
    }

    function matchesStatus(row, wanted){
      if(!wanted) return true;
      const st = row.querySelector('[data-col="statut"]');
      if(!st) return true;
      return st.textContent.trim().toLowerCase().includes(wanted.trim().toLowerCase());
    }

    function matchesText(row, text){
      if(!text) return true;
      const hay = row.textContent.toLowerCase();
      return hay.includes(text.trim().toLowerCase());
    }

    function withinDates(row, fromVal, toVal){
      const d = parseISO(row);
      if(!d) return true;
      let ok = true;
      if(fromVal){ ok = ok && d >= new Date(fromVal+'T00:00:00'); }
      if(toVal){   ok = ok && d <= new Date(toVal+'T23:59:59'); }
      return ok;
    }

    function applyFilters(){
      if(!tbody) return;
      const s  = statusSelect ? statusSelect.value : '';
      const t2 = globalSearch ? globalSearch.value : '';
      const fromVal = dateFrom ? dateFrom.value : '';
      const toVal   = dateTo ? dateTo.value : '';

      const text = t2.trim();

      [...tbody.rows].forEach(row=>{
        const ok =
          matchesStatus(row, s) &&
          matchesText(row, text) &&
          withinDates(row, fromVal, toVal);
        row.style.display = ok ? '' : 'none';
      });
    }

    // Live filtering
    if(globalSearch) globalSearch.addEventListener('input', applyFilters);
    if(statusSelect) statusSelect.addEventListener('change', applyFilters);
    if(dateFrom)     dateFrom.addEventListener('change', applyFilters);
    if(dateTo)       dateTo.addEventListener('change', applyFilters);

    /* -------------------- Export CSV (lignes visibles) -------------------- */
    function exportVisibleCSV(){
      if(!table || !tbody) return;
      const rows = [];
      const headers = [...table.querySelectorAll('thead th')].map(th=>th.innerText.replace(/\s+/g,' ').trim());
      // Exclure la dernière colonne "Action"
      const headerTrimmed = headers.slice(0, headers.length - 1);
      rows.push(headerTrimmed.join(','));

      [...tbody.rows].forEach(tr=>{
        if(tr.style.display === 'none') return;
        const cells = [...tr.cells].slice(0, tr.cells.length - 1).map(td=>{
          const txt = td.innerText.replace(/\s+/g,' ').trim();
          const safe = `"${txt.replace(/"/g,'""')}"`;
          return safe;
        });
        rows.push(cells.join(','));
      });

      const blob = new Blob([rows.join('\n')], {type:'text/csv;charset=utf-8;'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      const now = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      a.download = `historique-${now}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    if(btnExportCsv) btnExportCsv.addEventListener('click', exportVisibleCSV);

    // Init
    applyFilters();
  });
})();
