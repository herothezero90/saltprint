const hero = document.querySelector<HTMLElement>('[data-hero-motion]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const heroMap = window.matchMedia('(min-width: 64rem)').matches
  ? `${base}/images/hero-map.webp`
  : `${base}/images/hero-map-mobile.webp`;
const heroLogo = hero?.querySelector<HTMLImageElement>('[data-hero-stamp] img');

const preloadImage = async (src: string) => {
  const image = new Image();
  image.fetchPriority = 'high';
  image.src = src;
  await image.decode().catch(() => undefined);
};

const criticalAssetsReady = hero
  ? Promise.all([
      document.fonts.load('1em "Special Elite"').catch(() => undefined),
      heroLogo?.decode().catch(() => undefined),
      preloadImage(heroMap),
      preloadImage(`${base}/images/hero-paper.webp`),
      preloadImage(`${base}/images/open-call-logo.webp`),
    ])
  : Promise.resolve();

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
    await criticalAssetsReady;
    heroStamp.classList.add('is-stamped');
    openCallStamp.classList.add('is-stamped');
  }
}
