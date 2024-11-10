document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.toggle-checkbox'); // Select your toggle checkbox
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Function to set the theme and trigger an event
  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    window.currentTheme = theme;
    document.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
  }

  // Set the initial theme based on saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
    toggle.checked = savedTheme === 'dark';
  } else {
    const initialTheme = prefersDark.matches ? 'dark' : 'default';
    setTheme(initialTheme);
    toggle.checked = prefersDark.matches;
  }

  // Listen for changes to the system preference
  prefersDark.addEventListener('change', (e) => {
    if (!toggle.hasAttribute('data-user-toggle')) {
      // Only change if user hasn't manually toggled
      const newTheme = e.matches ? 'dark' : 'default';
      setTheme(newTheme);
      toggle.checked = e.matches;
    }
  });

  // Toggle theme based on user interaction
  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'dark' : 'default';
    setTheme(theme);

    // Set an attribute to remember that the user manually toggled
    toggle.setAttribute('data-user-toggle', true);
  });

  // Trigger themeChange event on initial load
  document.dispatchEvent(
    new CustomEvent('themeChange', {
      detail: document.body.getAttribute('data-theme') || 'default',
    })
  );
});
