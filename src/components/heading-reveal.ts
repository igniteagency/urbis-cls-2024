export function headingReveal() {
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
