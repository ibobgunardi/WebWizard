/**
 * API token validation functionality
 */
export function validateApiToken(token) {
    const apiToken = document.getElementById('api-token');
    const generateBtn = document.getElementById('generate-btn');
    const tokenRegex = /^[a-zA-Z0-9_\-]{10,}/;
    const isValid = tokenRegex.test(token);
    
    // Show validation feedback
    if (token) {
        if (isValid) {
            apiToken.classList.add('is-valid');
            apiToken.classList.remove('is-invalid');
            generateBtn.disabled = false;
        } else {
            apiToken.classList.add('is-invalid');
            apiToken.classList.remove('is-valid');
            generateBtn.disabled = true;
        }
    } else {
        apiToken.classList.remove('is-valid', 'is-invalid');
        generateBtn.disabled = true;
    }
}

export function initApiToken() {
    const apiToken = document.getElementById('api-token');
    const toggleTokenBtn = document.getElementById('toggle-token-btn');
    
    // Toggle password visibility
    toggleTokenBtn.addEventListener('click', function() {
        const tokenIcon = this.querySelector('i');
        if (apiToken.type === 'password') {
            apiToken.type = 'text';
            tokenIcon.classList.remove('fa-eye');
            tokenIcon.classList.add('fa-eye-slash');
        } else {
            apiToken.type = 'password';
            tokenIcon.classList.remove('fa-eye-slash');
            tokenIcon.classList.add('fa-eye');
        }
    });
    
    apiToken.addEventListener('input', function() {
        validateApiToken(this.value.trim());
    });
}