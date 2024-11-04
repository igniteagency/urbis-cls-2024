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

  const introMessages = document.querySelectorAll('.intro_message p');
  introMessages.forEach((message) => {
    const splitText = new window.SplitType(message, {
      types: 'lines',
      tagName: 'span',
    });

    splitText.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      wrapper.style.display = 'inline-block'; // Keeps lines in place horizontally

      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Set each line to start at yPercent -100 (above)
    gsap.set(message.querySelectorAll('.line'), { yPercent: 100 });
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
    '-=1'
  );

  introTl.from(
    '.heading_cl > *',
    {
      yPercent: 100,
      ease: 'power4.out',
      duration: 1,
      stagger: 0.2,
    },
    '>'
  );

  introTl.from(
    '.heading_2024 > span', //2024 number
    {
      opacity: 0,
      duration: 1,
      stagger: 0.2,
    },
    '-=1'
  );

  introTl.to(
    '.intro_logo-wrap',
    {
      y: 0,
      scale: 1,
      duration: 2,
    },
    //'logoExit'
    '>'
  );

  introTl.to(
    '.hero-header_background-video-wrapper',
    {
      clipPath: 'inset(0%)',
      duration: 2,
    },
    '<'
  );

  introMessages.forEach((message, index) => {
    // Animate lines in for each .intro_message
    introTl.to(message.querySelectorAll('.line'), {
      yPercent: 0, // Animate line to visible position
      duration: 1,
      ease: 'power4.out',
      stagger: 0.2, // Stagger between lines within the message
    });

    // Only add the exit animation if it's not the last message
    if (index < introMessages.length - 1) {
      introTl.to(
        message.querySelectorAll('.line'),
        {
          yPercent: -100, // Animate line downward to hide
          duration: 1,
          ease: 'power4.in',
          stagger: 0.2,
          delay: 1.5, // Wait before starting the exit animation
        },
        '-=0.5'
      );
    }

    // Add a dummy, zero-duration tween to mark the end of this sequence
    introTl.to({}, { duration: 0 });
  });

  introTl.to(
    '.intro_logo',
    {
      yPercent: 122,
    },
    '-=1'
  );

  introTl.to(
    '.menu_wrapper',
    {
      y: 0,
    },
    '<+=0.2'
  );

  introTl.to(
    '.header-scroll-ind',
    {
      y: 0,
    },
    '<+=0.2'
  );

  //introTl.play('logoExit');
}
