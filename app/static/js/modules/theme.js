/**
 * Theme toggle functionality
 */
export function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    const htmlElement = document.documentElement;
    
    // Initialize theme based on data-bs-theme attribute (default is dark)
    updateThemeIcon();
    
    themeToggleBtn.addEventListener('click', function() {
        if (htmlElement.getAttribute('data-bs-theme') === 'dark') {
            htmlElement.setAttribute('data-bs-theme', 'light');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'dark');
        }
        updateThemeIcon();
    });
    
    function updateThemeIcon() {
        if (htmlElement.getAttribute('data-bs-theme') === 'dark') {
            themeIcon.className = 'fas fa-sun'; // Show sun in dark mode
        } else {
            themeIcon.className = 'fas fa-moon'; // Show moon in light mode
        }
    }
}