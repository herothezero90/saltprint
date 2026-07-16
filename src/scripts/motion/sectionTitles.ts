const stampTitles = Array.from(
  document.querySelectorAll<HTMLElement>('[data-stamp-title]'),
);

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

if (stampTitles.length > 0 && !reduceMotion) {
  document.documentElement.classList.add('stamp-motion-ready');

  const stampTitle = async (title: HTMLElement) => {
    const image = title.querySelector<HTMLImageElement>('img');

    if (image && !image.complete) {
      await image.decode().catch(() => undefined);
    }

    requestAnimationFrame(() => {
      title.classList.add('is-stamped');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        observer.unobserve(entry.target);
        void stampTitle(entry.target as HTMLElement);
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  stampTitles.forEach((title) => observer.observe(title));
}
