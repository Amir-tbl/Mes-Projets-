/* ================================================================
   SAE-Colis - Common JavaScript
   Code partagé entre toutes les pages
================================================================ */

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/* ========== BURGER MENU ========== */
function initBurgerMenu() {
  const sidebar = document.getElementById('sidebar');
  const burger = document.getElementById('burger');
  const overlay = document.getElementById('overlay');

  if (!sidebar || !burger) {
    console.warn('[common.js] Sidebar ou burger manquant');
    return;
  }

  function openMenu() {
    sidebar.classList.add('is-open');
    sidebar.setAttribute('aria-hidden', 'false');

    if (overlay) {
      overlay.hidden = false;
      void overlay.offsetWidth; // Force reflow pour transition
      overlay.classList.add('show');
    }

    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    sidebar.classList.remove('is-open');
    sidebar.setAttribute('aria-hidden', 'true');

    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => { overlay.hidden = true; }, 300);
    }

    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu(e) {
    if (e) e.preventDefault();
    sidebar.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  burger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ========== RELOCATION RECHERCHE (MOBILE) ========== */
function initSearchRelocation() {
  const topSearch = document.getElementById('topSearch');
  const navSearchSlot = document.getElementById('navSearchSlot');

  if (!topSearch || !navSearchSlot) {
    console.warn('[common.js] Elements de recherche manquants');
    return;
  }

  const mqMobile = window.matchMedia('(max-width: 768px)');

  function relocateSearch() {
    if (mqMobile.matches) {
      if (!navSearchSlot.contains(topSearch)) {
        navSearchSlot.appendChild(topSearch);
        navSearchSlot.setAttribute('aria-hidden', 'false');
      }
    } else {
      const header = document.querySelector('.topbar');
      if (header && !header.contains(topSearch)) {
        header.appendChild(topSearch);
      }
      navSearchSlot.setAttribute('aria-hidden', 'true');
    }
  }

  window.addEventListener('resize', () => {
    relocateSearch();

    if (!mqMobile.matches) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
        sidebar.setAttribute('aria-hidden', 'true');

        const overlay = document.getElementById('overlay');
        if (overlay) {
          overlay.classList.remove('show');
          setTimeout(() => { overlay.hidden = true; }, 300);
        }

        const burger = document.getElementById('burger');
        if (burger) burger.setAttribute('aria-expanded', 'false');

        document.body.style.overflow = '';
      }
    }
  });

  relocateSearch();
}

/* ========== BADGE PIÈCES JOINTES ========== */
function genererBadgePiecesJointes(count) {
  if (!count || count === 0) {
    return `
      <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #f3f4f6; color: #9ca3af; border-radius: 12px; font-size: 12px; font-weight: 600;">
        📎 0
      </span>
    `;
  }

  return `
    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 12px; font-weight: 600;">
      📎 ${count}
    </span>
  `;
}

window.genererBadgePiecesJointes = genererBadgePiecesJointes;

/* ========== INITIALISATION ========== */
ready(function() {
  initBurgerMenu();
  initSearchRelocation();
});
