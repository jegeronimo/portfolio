document.addEventListener('DOMContentLoaded', function() {
  const fadeInSections = document.querySelectorAll('.fade-in-section');
  
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.15 // trigger when 15% of the section is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Once the section is visible, we can stop observing it
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeInSections.forEach(section => {
    observer.observe(section);
  });
}); 