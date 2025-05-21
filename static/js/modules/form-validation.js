/**
 * Form Validation Module - Handles form validation and error messages
 */

// Initialize form validation
export function initFormValidation() {
    // Content input validation
    const contentInput = document.getElementById('content-input');
    const contentCharCount = document.getElementById('content-char-count');
    const languageDetection = document.getElementById('language-detection');
    const step2Next = document.getElementById('step-2-next');
    
    // Style description validation
    const styleDescription = document.getElementById('style-description');
    const styleCharCount = document.getElementById('style-char-count');
    
    // API token validation
    const apiToken = document.getElementById('api-token');
    const toggleTokenBtn = document.getElementById('toggle-token-btn');
    
    // Terms checkbox validation
    const termsCheckbox = document.getElementById('terms-checkbox');
    
    // Content input validation
    if (contentInput) {
        contentInput.addEventListener('input', function() {
            const contentLength = this.value.length;
            const minLength = parseInt(this.getAttribute('data-min-length') || 50);
            const maxLength = parseInt(this.getAttribute('data-max-length') || 2500);
            
            // Update character count
            if (contentCharCount) {
                contentCharCount.textContent = contentLength;
                
                // Add warning classes based on length
                if (contentLength > maxLength * 0.9) {
                    contentCharCount.classList.add('text-danger');
                    contentCharCount.classList.remove('text-warning', 'text-success');
                } else if (contentLength > maxLength * 0.7) {
                    contentCharCount.classList.add('text-warning');
                    contentCharCount.classList.remove('text-danger', 'text-success');
                } else if (contentLength >= minLength) {
                    contentCharCount.classList.add('text-success');
                    contentCharCount.classList.remove('text-danger', 'text-warning');
                } else {
                    contentCharCount.classList.remove('text-success', 'text-danger', 'text-warning');
                }
            }
            
            // Enable/disable next button based on content length
            if (step2Next) {
                step2Next.disabled = !(contentLength >= minLength && contentLength <= maxLength);
            }
        });
    }
    
    // Style description character counter
    if (styleDescription) {
        styleDescription.addEventListener('input', function() {
            const currentLength = this.value.length;
            if (styleCharCount) {
                styleCharCount.textContent = currentLength;
            }
        });
    }
    
    // API token validation
    if (apiToken) {
        apiToken.addEventListener('input', function() {
            validateApiToken(this.value.trim());
        });
    }
    
    // Toggle API token visibility
    if (toggleTokenBtn) {
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
    }
    
    // Terms checkbox validation
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            if (termsCheckbox.checked) {
                termsCheckbox.classList.add('is-valid');
                termsCheckbox.classList.remove('is-invalid');
            } else {
                termsCheckbox.classList.remove('is-valid');
                termsCheckbox.classList.add('is-invalid');
            }
        });
    }
    
    // API token validation function
    function validateApiToken(token) {
        const tokenRegex = /^[a-zA-Z0-9_\-]{10,}/;
        const isValid = tokenRegex.test(token);
        
        // Show validation feedback
        if (token) {
            if (isValid) {
                apiToken.classList.add('is-valid');
                apiToken.classList.remove('is-invalid');
            } else {
                apiToken.classList.add('is-invalid');
                apiToken.classList.remove('is-valid');
            }
        } else {
            apiToken.classList.remove('is-valid', 'is-invalid');
        }
    }
    
    // Export validation functions for use in other modules
    return {
        validateApiToken,
        validateForm
    };
    
    // Form validation function
    function validateForm() {
        // Collect validation issues
        let missingItems = [];
        
        // Check API token
        if (!apiToken.value.trim()) {
            apiToken.classList.add('is-invalid');
            apiToken.classList.remove('is-valid');
            missingItems.push("OpenRouter API token");
        } else {
            // Extra validation for token format
            const token = apiToken.value.trim();
            const tokenRegex = /^[a-zA-Z0-9_\-]{10,}/;
            if (!tokenRegex.test(token)) {
                apiToken.classList.add('is-invalid');
                apiToken.classList.remove('is-valid');
                missingItems.push("valid OpenRouter API token format");
            } else {
                apiToken.classList.add('is-valid');
                apiToken.classList.remove('is-invalid');
            }
        }
        
        // Check terms acceptance
        if (!termsCheckbox.checked) {
            termsCheckbox.classList.add('is-invalid');
            termsCheckbox.classList.remove('is-valid');
            missingItems.push("terms and conditions acceptance");
        } else {
            termsCheckbox.classList.add('is-valid');
            termsCheckbox.classList.remove('is-invalid');
        }
        
        return {
            isValid: missingItems.length === 0,
            missingItems: missingItems
        };
    }
}