/**
 * Website Generation Module - Handles website generation and preview
 */

import { goToStep } from './navigation.js';

// Initialize website generation functionality
export function initWebsiteGeneration() {
    // Form elements
    const websiteTypeInput = document.getElementById('website-type-input');
    const contentInput = document.getElementById('content-input');
    const styleTemplateInput = document.getElementById('style-template-input');
    const styleDescription = document.getElementById('style-description');
    const apiToken = document.getElementById('api-token');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const profileImageInput = document.getElementById('profile-image-input');
    
    // Generation elements
    const generateBtn = document.getElementById('generate-btn');
    const generateBtnText = document.getElementById('generate-btn-text');
    const generateLoading = document.getElementById('generate-loading');
    
    // Preview elements
    const previewIframe = document.getElementById('preview-iframe');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    
    // Generate button click handler
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            // Validate form
            const validationResult = validateForm();
            
            // Show error if validation fails
            if (!validationResult.isValid) {
                Swal.fire({
                    title: 'Cannot Generate Website',
                    text: 'Please provide the following: ' + validationResult.missingItems.join(", "),
                    icon: 'warning',
                    confirmButtonColor: '#FF6B6B'
                });
                return;
            }
            
            // Show loading state
            generateBtn.disabled = true;
            generateBtnText.classList.add('d-none');
            generateLoading.classList.remove('d-none');
            
            // Prepare form data
            const formData = new FormData();
            formData.append('website_type', websiteTypeInput.value);
            formData.append('content', contentInput.value);
            formData.append('style', styleTemplateInput.value + (styleDescription.value ? ': ' + styleDescription.value : ''));
            formData.append('api_token', apiToken.value);
            formData.append('terms_accepted', termsCheckbox.checked);
            
            // Add profile image if it's a CV and an image was uploaded
            if (websiteTypeInput.value.toLowerCase() === 'cv' && profileImageInput && profileImageInput.files.length > 0) {
                formData.append('profile_image', profileImageInput.files[0]);
            }
            
            // Send request to generate website
            fetch('/generate', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Server error occurred');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Store HTML in session storage for preview
                    sessionStorage.setItem('generatedHtml', data.html);
                    
                    // Show preview
                    previewIframe.src = '/preview';
                    previewIframe.classList.remove('d-none');
                    previewPlaceholder.classList.add('d-none');
                    
                    // Go to preview step
                    goToStep(5);
                } else {
                    throw new Error(data.message || 'Failed to generate website');
                }
            })
            .catch(error => {
                console.error('Generation error:', error);
                Swal.fire({
                    title: 'Generation Failed',
                    text: error.message || 'An error occurred during website generation. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
            })
            .finally(() => {
                // Reset button state
                generateBtn.disabled = false;
                generateBtnText.classList.remove('d-none');
                generateLoading.classList.add('d-none');
            });
        });
    }
    
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