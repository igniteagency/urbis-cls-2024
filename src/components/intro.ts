export function IntroAnimation() {
  const introTl = window.gsap.timeline({
    defaults: {
      duration: 1, // Default duration for animations
      ease: 'power4.inOut', // Default easing for animations
      /* Common timing controls:
  ">>"     = start after all previous animations
  "<"      = start at same time as previous
  "-=0.5"  = start 0.5s before previous ends
  "+=0.5"  = start 0.5s after previous ends
  "2"      = start at absolute time 2s
*/
    },
  });

  const splitText = new window.SplitType('.intro_message-wrap p', {
    types: 'chars', // Splits into characters; options include 'words' or 'lines'
    tagName: 'span', // Wrap each character in a span for easier styling
  });

  window.gsap.set('.hero-header_background-video-wrapper', {
    clipPath: 'inset(50%)',
  });

  introTl.to('.loader-number_wrap', {
    height: '100%',
    duration: 3,
  });

  introTl.to(
    '.loader-percentage',
    {
      scale: 4,
      duration: 3,
    },
    '<'
  );

  introTl.to(
    '.loader-percentage > span',
    {
      innerText: 100,
      snap: { innerText: 1 },
      duration: 3,
    },
    '<'
  );

  introTl.to(
    '.intro-wrap_loader',
    {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1,
    },
    '+=0.2'
  );

  introTl.from(
    '.heading_cl > *',
    {
      yPercent: 100,
      duration: 0.5,
      stagger: 0.2,
    },
    '>'
  );

  introTl.from(
    '.heading_2024 > span',
    {
      opacity: 0,
      duration: 1,
      stagger: 0.2,
    },
    '>'
  );

  introTl.to(
    '.intro_logo-wrap',
    {
      y: 'calc(50vh - 100%)',
      scale: 1,
    },
    'logoExit'
  );

  introTl.to(
    '.hero-header_background-video-wrapper',
    {
      clipPath: 'inset(0%)',
      duration: 2,
    },
    '>'
  );

  introTl.play('logoExit');
}
