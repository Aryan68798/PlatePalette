// Apply theme early to prevent unstyled flash
(function() {
  const savedTheme = localStorage.getItem('platePaletteTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

// Wait for DOM to load before attaching toggle listener
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    
    // Set initial icon state
    if (document.body.classList.contains('dark-mode')) {
      if(moonIcon) moonIcon.classList.add('hidden');
      if(sunIcon) sunIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('platePaletteTheme', isDark ? 'dark' : 'light');
      
      if (isDark) {
        if(moonIcon) moonIcon.classList.add('hidden');
        if(sunIcon) sunIcon.classList.remove('hidden');
      } else {
        if(moonIcon) moonIcon.classList.remove('hidden');
        if(sunIcon) sunIcon.classList.add('hidden');
      }
    });
  }
});
