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
    gsap.set(message.querySelectorAll('.line'), { yPercent: 120 });
  });

  // Scroll event to trigger `.menu_wrapper` animation
  let menuAnimationTriggered = false;

  window.addEventListener('scroll', () => {
    console.log('Scroll Y position:', window.scrollY); // Log the current scroll position

    if (!menuAnimationTriggered && window.scrollY > 5) {
      // Adjust `5` as needed for your case
      menuAnimationTriggered = true;
      console.log('Scroll detected, animating menu wrapper'); // Debugging log to indicate the condition was met

      // Animate `.menu_wrapper` independently
      gsap.to('.menu_wrapper', {
        y: 0,
        duration: 1,
        ease: 'power4.out',
      });
    }
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
    '-=0.5'
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

  // introTl.to(
  //   '.hero-header_background-video-wrapper',
  //   {
  //     clipPath: 'inset(0%)',
  //     duration: 2,
  //   },
  //   '<'
  // );

  introTl.to(
    '.intro-overlays.top, .intro-overlays.bottom',
    {
      scaleY: 0,
      duration: 3,
      delay: 0.2,
    },
    '<'
  );

  // Add overlay animation to introTl timeline
  introTl.to(
    '.intro-overlays.left, .intro-overlays.right',
    {
      scaleX: 0,
      duration: 2,
    },
    '<'
  );

  // Create a nested timeline for introMessages sequence
  const messagesTl = gsap.timeline();

  // Add each message's animations to messagesTl
  introMessages.forEach((message, index) => {
    // Animate lines in for each .intro_message
    messagesTl.to(message.querySelectorAll('.line'), {
      yPercent: 0, // Animate line to visible position
      duration: 1,
      ease: 'power4.out',
      stagger: 0.2, // Stagger between lines within the message
    });

    // Only add the exit animation if it's not the last message
    if (index < introMessages.length - 1) {
      messagesTl.to(
        message.querySelectorAll('.line'),
        {
          yPercent: -120, // Animate line downward to hide
          duration: 1,
          ease: 'power4.in',
          stagger: 0.2,
          delay: 1.5, // Wait before starting the exit animation
        },
        '-=0.5' // Overlap with the next animation by 0.5 seconds
      );
    }

    // Add a dummy, zero-duration tween to mark the end of this sequence
    messagesTl.to({}, { duration: 0 });
  });

  // Add messagesTl to introTl with a start offset of '-=1'
  introTl.add(messagesTl, '-=1.5');

  // Add the next animation after messages sequence
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

  // Select all img elements
  const images = document.querySelectorAll('.reveal-image');

  images.forEach((img) => {
    // Set initial clip-path with GSAP to ensure it's recognized
    gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });

    // Create ScrollTrigger animation
    gsap.to(img, {
      clipPath: 'inset(0 0% 0 0)', // Fully reveal the image
      duration: 1.5, // Adjust duration for visual effect
      ease: 'power4.out', // Smooth easing function
      scrollTrigger: {
        trigger: img,
        start: 'top 80%', // Trigger when the top of the image enters 90% of the viewport height
        toggleActions: 'play none none none',
        //markers: true, // Debug markers to visualize trigger points
      },
    });
  });

  const H1s = document.querySelectorAll('.heading-style-h1');

  H1s.forEach((heading) => {
    // Use SplitType to split the heading into lines
    const splitText = new window.SplitType(heading, {
      types: 'lines',
      tagName: 'span',
    });

    // Wrap each line in a parent div for masking effect
    splitText.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      wrapper.style.display = 'inline-block'; // Keeps lines aligned horizontally

      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Set each line to start at yPercent 110 (below the view)
    gsap.set(heading.querySelectorAll('.line'), { yPercent: 110 });

    // ScrollTrigger animation to move lines into view
    gsap.to(heading.querySelectorAll('.line'), {
      yPercent: 0, // Move lines to their original position
      duration: 1, // Duration of the animation
      ease: 'power4.out', // Smooth easing for entry
      stagger: 0.2, // Stagger the animation for each line
      scrollTrigger: {
        trigger: heading, // The heading itself triggers the animation
        start: 'top 80%', // Start animation when the top of the heading is at 90% of viewport
        toggleActions: 'play none none none', // Animation plays once when triggered
      },
    });
  });
}
