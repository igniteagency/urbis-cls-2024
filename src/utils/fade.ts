const SLIDE_Y_VALUE = 50;

const FADE_ATTR = 'data-fade';
const FADE_ATTR_STILL_VALUE = 'still';
const FADE_DELAY_ATTR = 'data-fade-delay-ms';
const FADE_STAGGER_ATTR = 'data-fade-stagger';
const FADE_STAGGER_DELAY_ATTR = 'data-fade-stagger-delay-ms';

const FADE_DEFAULT_STAGGER_DELAY_MS = 150;

/**
 * Adds fade up animation (fade and slide up) to elements that have the `data-fade-up` attribute.
 *
 * Default animation applies to the element itself.
 * Add `data-fade=""` to apply fade-up (fade and slide up) on the element.
 * Add `data-fade="still"` to apply fade on the element.
 * Add `data-fade-delay-ms="100"` to add delay to the animation in 100 milliseconds. Set the delay value as required. No delay by default.
 * Add `data-fade-stagger=""` to apply staggered fade on all its direct children.
 * Add `data-fade-stagger-delay-ms="100"` to control the time between stagger. Defaults to 300ms
 */
export function fadeUp() {
  const fadeUpElList = document.querySelectorAll(`[${FADE_ATTR}]`);
  fadeUpElList.forEach((el) => {
    const isStagger = null !== el.getAttribute(FADE_STAGGER_ATTR) ? true : false;
    const isStill = FADE_ATTR_STILL_VALUE === el.getAttribute(FADE_ATTR) ? true : false;
    const delayValue = el.getAttribute(FADE_DELAY_ATTR);
    const delay = delayValue ? Number(delayValue) / 1000 : false;

    if (!isStagger) {
      fadeUpAnimation(el, undefined, false, isStill, delay);
    } else {
      const animatingEl = Array.from(el.children);
      fadeUpAnimation(animatingEl, el, true, isStill, delay);
    }
  });
}

function fadeUpAnimation(
  el: gsap.TweenTarget,
  parentEl: HTMLElement | undefined = undefined,
  stagger = false,
  still = false,
  delay: false | number = false
) {
  const staggerDelayValue =
    (Number(parentEl?.getAttribute(FADE_STAGGER_DELAY_ATTR)) || FADE_DEFAULT_STAGGER_DELAY_MS) /
    1000;

  window.gsap.set(el, {
    y: still ? 0 : SLIDE_Y_VALUE,
    autoAlpha: 0,
  });

  window.gsap.to(el, {
    y: 0,
    autoAlpha: 1,
    duration: 1,
    ease: 'power2.out',
    stagger: stagger ? staggerDelayValue : 0,
    delay: delay || 0,
    scrollTrigger: {
      trigger: parentEl || el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      markers: window.IS_DEBUG_MODE,
      id: 'fade',
    },
  });
}
