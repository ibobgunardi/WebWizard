/**
 * Validation Module - Handles form validation
 */

// Validate API token
export function validateApiToken(token) {
    const apiToken = document.getElementById('api-token');
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
    
    return isValid;
}

// Validate generate button
export function validateGenerateButton() {
    // We'll validate on click instead of disabling the button
    const apiToken = document.getElementById('api-token');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const generateBtn = document.getElementById('generate-btn');
    
    const tokenValid = apiToken.value.trim() !== '';
    const termsAccepted = termsCheckbox.checked;
    
    // Visual feedback only
    if (tokenValid) {
        apiToken.classList.add('is-valid');
        apiToken.classList.remove('is-invalid');
    } else {
        apiToken.classList.remove('is-valid');
        // Don't add invalid class here, we'll do it on click
    }
    
    // Remove disabled attribute from generate button
    generateBtn.disabled = false;
}

// Validate form on generate
export function validateForm() {
    const apiToken = document.getElementById('api-token');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const websiteTypeInput = document.getElementById('website-type');
    const contentInput = document.getElementById('content');
    const styleTemplateInput = document.getElementById('style-template');
    
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
            missingItems.push("valid OpenRouter API token (should be at least 10 characters)");
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