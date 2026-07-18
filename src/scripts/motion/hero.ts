export {};

const hero = document.querySelector<HTMLElement>('[data-hero-motion]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const mobileNav = hero?.querySelector<HTMLDetailsElement>('[data-mobile-nav]');

if (mobileNav) {
  const closeMobileNav = () => {
    mobileNav.open = false;
  };

  mobileNav.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('click', (event) => {
    if (mobileNav.open && !mobileNav.contains(event.target as Node)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.open) {
      closeMobileNav();
      mobileNav.querySelector<HTMLElement>('summary')?.focus();
    }
  });

  window.matchMedia('(min-width: 48rem)').addEventListener('change', (event) => {
    if (event.matches) closeMobileNav();
  });
}

if (hero && !reduceMotion) {
  const heroStamp = hero.querySelector<HTMLElement>('[data-hero-stamp]');
  const openCallStamp = hero.querySelector<HTMLElement>(
    '[data-open-call-copy]',
  );

  if (heroStamp && openCallStamp) {
    document.documentElement.classList.add('hero-motion-ready');
    requestAnimationFrame(() => {
      heroStamp.classList.add('is-stamped');
      openCallStamp.classList.add('is-stamped');
    });
  }
}
