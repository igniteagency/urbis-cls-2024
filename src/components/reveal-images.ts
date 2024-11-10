export function revealImages() {
  // Select all img elements
  const images = document.querySelectorAll('.reveal-image');

  images.forEach((img) => {
    // Set initial clip-path with GSAP to ensure it's recognized
    window.gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });

    // Create ScrollTrigger animation
    window.gsap.to(img, {
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
}
