/* ==========================================================================
   Nikesh M. Kumar — site behavior

   Everything here is optional polish. If you deleted this file entirely the
   site would still work; it would just lose the nav highlighting, the theme
   toggle, and the fade-in.

   To turn a feature on or off, change true/false in CONFIG below.
   You do not need to touch anything past CONFIG.
   ========================================================================== */

const CONFIG = {
  // Highlight the current section in the sidebar nav as you scroll.
  navHighlight: true,

  // Fade sections in as they enter the viewport. Set false for an instant page.
  scrollReveal: true,

  // Show the Dark/Light button. Remembers the choice between visits.
  themeToggle: true,

  // Collapse the publication list to this many entries, with a
  // "Show all publications" button. Set to 0 to always show every paper.
  publicationsShown: 0,

  // Show the small "copy" button next to your email address.
  copyEmailButton: true,
};


/* --------------------------------------------------------------------------
   Smooth scrolling for the sidebar navigation
   -------------------------------------------------------------------------- */

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
    document.querySelector('.site-nav').classList.remove('open');
    const toggle = document.querySelector('.nav-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
});


/* --------------------------------------------------------------------------
   Mobile menu button
   -------------------------------------------------------------------------- */

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}


/* --------------------------------------------------------------------------
   Highlight the section you are currently reading

   Uses IntersectionObserver rather than a scroll listener, which is both
   cheaper and more accurate for sections of uneven height.
   -------------------------------------------------------------------------- */

if (CONFIG.navHighlight) {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.site-nav a');

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  };

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    // Trigger when a section crosses the upper third of the screen.
    { rootMargin: '-20% 0px -70% 0px' }
  );

  sections.forEach((section) => spy.observe(section));
}


/* --------------------------------------------------------------------------
   Fade sections in on scroll
   -------------------------------------------------------------------------- */

if (CONFIG.scrollReveal) {
  const revealTargets = document.querySelectorAll('.section');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const revealer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 }
  );

  revealTargets.forEach((el) => revealer.observe(el));
}


/* --------------------------------------------------------------------------
   Dark / light theme

   Order of preference: a choice you made before, then your operating
   system setting, then light.
   -------------------------------------------------------------------------- */

const themeButton = document.querySelector('.theme-toggle');

if (CONFIG.themeToggle && themeButton) {
  const label = themeButton.querySelector('.theme-label');

  const readStored = () => {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      return null; // Private browsing can block storage. Not a problem.
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  };

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(readStored() || (prefersDark ? 'dark' : 'light'));

  themeButton.addEventListener('click', () => {
    const next =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      /* Storage unavailable; the theme still switches for this visit. */
    }
  });
} else if (themeButton) {
  themeButton.hidden = true;
}


/* --------------------------------------------------------------------------
   Collapse the publication list

   Only runs if CONFIG.publicationsShown is above zero and you actually
   have more papers than that.
   -------------------------------------------------------------------------- */

const expandButton = document.querySelector('.pub-expand');
const publications = document.querySelectorAll('.pub');
const limit = CONFIG.publicationsShown;

if (expandButton && limit > 0 && publications.length > limit) {
  let expanded = false;

  const render = () => {
    publications.forEach((pub, index) => {
      pub.hidden = !expanded && index >= limit;
    });
    expandButton.textContent = expanded
      ? 'Show fewer publications'
      : `Show all ${publications.length} publications`;
  };

  expandButton.hidden = false;
  render();

  expandButton.addEventListener('click', () => {
    expanded = !expanded;
    render();
  });
}


/* --------------------------------------------------------------------------
   Copy email to clipboard
   -------------------------------------------------------------------------- */

document.querySelectorAll('.copy-btn').forEach((button) => {
  if (!CONFIG.copyEmailButton) {
    button.hidden = true;
    return;
  }

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const original = button.textContent;
      button.textContent = 'copied';
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    } catch (error) {
      // Clipboard blocked (usually means the page is not on https).
      // The email is still a normal mailto link, so nothing is lost.
    }
  });
});


/* --------------------------------------------------------------------------
   Footer year, so you never have to update it
   -------------------------------------------------------------------------- */

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
