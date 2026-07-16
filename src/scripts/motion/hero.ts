import { createTimeline } from 'animejs/timeline';
import { splitText } from 'animejs/text';
import { set } from 'animejs/utils';

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
  const logoGroup = hero.querySelector<HTMLElement>('[data-logo-group]');
  const logoImage = logoGroup?.querySelector<HTMLImageElement>('img');
  const kicker = hero.querySelector<HTMLElement>('[data-hero-kicker]');
  const paperCard = hero.querySelector<HTMLElement>('[data-paper-card]');
  const paperFinal = hero.querySelector<HTMLElement>('[data-paper-final]');
  const foldStage = hero.querySelector<HTMLElement>('[data-paper-fold-stage]');
  const folds = Array.from(
    hero.querySelectorAll<HTMLElement>('[data-paper-fold]'),
  );
  const foldShades = Array.from(
    hero.querySelectorAll<HTMLElement>('[data-fold-shade]'),
  );

  if (
    logoGroup &&
    kicker &&
    paperCard &&
    paperFinal &&
    foldStage &&
    folds.length === 3 &&
    foldShades.length === 3
  ) {
    const kickerSplit = splitText(kicker, {
      chars: true,
      includeSpaces: true,
    });
    const kickerCharacters = kickerSplit.chars as HTMLElement[];
    const typewriterCaret = document.createElement('span');

    typewriterCaret.className = 'hero-typewriter-caret';
    typewriterCaret.setAttribute('aria-hidden', 'true');
    kicker.append(typewriterCaret);

    set(kickerCharacters, { visibility: 'hidden' });
    set(typewriterCaret, { opacity: 0 });
    set(paperFinal, { opacity: 0 });
    set(foldStage, { opacity: 0, visibility: 'visible' });

    const foldedAngles = [-86, 174, -174];
    const shadeOpacity = [0.28, 0.58, 0.42];

    folds.forEach((fold, index) => {
      set(fold, { rotateX: foldedAngles[index] });
      set(foldShades[index], { opacity: shadeOpacity[index] });
    });

    const paperImage = new Image();
    paperImage.src = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/images/saltprint-folded-paper-texture.webp`;

    await Promise.all([
      document.fonts.ready,
      logoImage?.decode().catch(() => undefined),
      paperImage.decode().catch(() => undefined),
    ]);

    // Source dimensions and measured crease centers in the paper texture.
    const paperTexture = {
      width: 3549,
      height: 2728,
      foldY: [899, 1833],
    } as const;

    const setPaperFoldGeometry = () => {
      const paperWidth = paperFinal.clientWidth;
      const paperHeight = paperFinal.clientHeight;

      if (!paperWidth || !paperHeight) return;

      const imageScale = Math.max(
        paperWidth / paperTexture.width,
        paperHeight / paperTexture.height,
      );
      const renderedImageHeight = paperTexture.height * imageScale;
      const imageOffsetY = (paperHeight - renderedImageHeight) / 2;
      const [firstFoldY, secondFoldY] = paperTexture.foldY.map(
        (foldY) => (imageOffsetY + foldY * imageScale) / paperHeight,
      );

      const panelHeights = [
        firstFoldY,
        secondFoldY - firstFoldY,
        1 - secondFoldY,
      ];

      if (panelHeights.some((height) => height <= 0)) return;

      const percent = (value: number) => `${value * 100}%`;

      paperCard.style.setProperty(
        '--paper-fold-panel-1',
        percent(panelHeights[0]),
      );
      paperCard.style.setProperty(
        '--paper-fold-panel-2-relative',
        percent(panelHeights[1] / panelHeights[0]),
      );
      paperCard.style.setProperty(
        '--paper-fold-panel-3-relative',
        percent(panelHeights[2] / panelHeights[1]),
      );

      paperCard.style.setProperty(
        '--paper-fold-art-1-height',
        percent(1 / panelHeights[0]),
      );
      paperCard.style.setProperty(
        '--paper-fold-art-2-top',
        percent(-firstFoldY / panelHeights[1]),
      );
      paperCard.style.setProperty(
        '--paper-fold-art-2-height',
        percent(1 / panelHeights[1]),
      );
      paperCard.style.setProperty(
        '--paper-fold-art-3-top',
        percent(-secondFoldY / panelHeights[2]),
      );
      paperCard.style.setProperty(
        '--paper-fold-art-3-height',
        percent(1 / panelHeights[2]),
      );
    };

    setPaperFoldGeometry();

    const paperResizeObserver = new ResizeObserver(setPaperFoldGeometry);
    paperResizeObserver.observe(paperFinal);

    set(foldStage, { opacity: 1 });

    const finishPaperUnfold = () => {
      set(paperFinal, { opacity: 1 });
      set(foldStage, { opacity: 0, visibility: 'hidden' });
    };

    const positionTypewriterCaret = (visibleCharacters: number) => {
      const character =
        kickerCharacters[
          visibleCharacters === 0 ? 0 : visibleCharacters - 1
        ];

      if (!character) return;

      const kickerBounds = kicker.getBoundingClientRect();
      const characterBounds = character.getBoundingClientRect();
      const x =
        visibleCharacters === 0
          ? characterBounds.left - kickerBounds.left
          : characterBounds.right - kickerBounds.left;

      set(typewriterCaret, {
        x,
        y: characterBounds.top - kickerBounds.top,
        height: characterBounds.height,
      });
    };

    const timeline = createTimeline({
      defaults: { ease: 'out(3)' },
      onComplete: () => {
        finishPaperUnfold();
        paperResizeObserver.disconnect();

        if (window.matchMedia('(max-width: 39.999rem)').matches) {
          // Keep the split layout on mobile: reverting rebalances the first line
          // and creates a visible jump after the final typed character.
          set(kickerCharacters, { visibility: 'visible' });
          typewriterCaret.remove();
        } else {
          kickerSplit.revert();
        }
      },
    });

    const foldTimings = [
      { start: 120, duration: 900 },
      { start: 280, duration: 850 },
      { start: 440, duration: 780 },
    ];

    foldTimings.forEach(({ start, duration }, index) => {
      timeline
        .add(
          folds[index],
          { rotateX: 0, duration, ease: 'inOut(3)' },
          start,
        )
        .add(
          foldShades[index],
          { opacity: 0, duration: duration * 0.82, ease: 'out(2)' },
          start + duration * 0.18,
        );
    });

    const paperUnfoldEnd = Math.max(
      ...foldTimings.map(({ start, duration }) => start + duration),
    );

    const typewriterStart = paperUnfoldEnd + 120;
    let nextCharacterAt = typewriterStart;

    timeline
      .call(finishPaperUnfold, paperUnfoldEnd)
      .call(() => {
        positionTypewriterCaret(0);
        set(typewriterCaret, { opacity: 1 });
        typewriterCaret.classList.add('is-typing');
      }, typewriterStart);

    kickerCharacters.forEach((character, index) => {
      timeline.call(() => {
        set(character, { visibility: 'visible' });
        positionTypewriterCaret(index + 1);
      }, nextCharacterAt);

      const typedValue = character.textContent ?? '';
      nextCharacterAt += typedValue.includes('\u00a0') ? 105 : 55;
    });

    timeline.call(() => {
      typewriterCaret.classList.remove('is-typing');
      set(typewriterCaret, { opacity: 0 });
    }, nextCharacterAt + 350);
  }
}
