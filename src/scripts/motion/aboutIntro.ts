import { animate } from 'animejs/animation';
import { onScroll } from 'animejs/events';
import { splitText } from 'animejs/text';
import { set, stagger } from 'animejs/utils';

const aboutIntro = document.querySelector<HTMLElement>('[data-about-intro]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (aboutIntro && !reduceMotion) {
  await document.fonts.ready;

  let hasRevealed = false;
  let activeReveal: ReturnType<typeof animate> | null = null;

  const introSplit = splitText(aboutIntro, {
    lines: {
      wrap: 'clip',
      class: 'about-intro-line',
    },
    words: false,
  });

  introSplit.addEffect((splitter) => {
    const lines = splitter.lines as HTMLElement[];

    if (hasRevealed) {
      set(lines, {
        opacity: 1,
        y: 0,
        scaleY: 1,
        willChange: 'auto',
      });
    } else {
      set(lines, {
        opacity: 0,
        y: '0.82em',
        scaleY: 0.88,
        transformOrigin: '50% 100%',
        willChange: 'transform, opacity',
      });
    }

    return () => {
      activeReveal?.revert();
      activeReveal = null;
    };
  });

  const revealIntro = () => {
    if (hasRevealed) return;

    hasRevealed = true;
    const lines = introSplit.lines as HTMLElement[];

    activeReveal = animate(lines, {
      opacity: [0, 1],
      y: ['0.82em', 0],
      scaleY: [0.88, 1],
      duration: 720,
      delay: stagger([0, 480]),
      ease: 'out(3)',
      onComplete: () => {
        set(lines, { willChange: 'auto' });
        activeReveal = null;
      },
    });
  };

  onScroll({
    target: aboutIntro,
    enter: '84% start',
    repeat: false,
    onEnter: revealIntro,
  });
}
