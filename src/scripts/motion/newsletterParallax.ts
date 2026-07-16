import { animate } from 'animejs/animation';
import { onScroll } from 'animejs/events';

const newsletterSections = Array.from(
  document.querySelectorAll<HTMLElement>('[data-newsletter-parallax]'),
);

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

if (!reduceMotion) {
  newsletterSections.forEach((section) => {
    const mapLayer = section.querySelector<HTMLElement>(
      '[data-newsletter-map-layer]',
    );

    if (!mapLayer) return;

    animate(mapLayer, {
      y: ['-4%', '4%'],
      duration: 1000,
      ease: 'inOut(2)',
      autoplay: onScroll({
        target: section,
        enter: 'bottom top',
        leave: 'top bottom',
        sync: 0.35,
        repeat: true,
      }),
    });
  });
}
