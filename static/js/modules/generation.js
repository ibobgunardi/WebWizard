/**
 * Generation Module - Handles website generation and preview
 */

import { goToStep } from './navigation.js';
import { validateForm } from './validation.js';

// Initialize website generation functionality
export function initGeneration() {
    // Form elements
    const generateBtn = document.getElementById('generate-btn');
    const generateBtnText = document.getElementById('generate-btn-text');
    const generateLoading = document.getElementById('generate-loading');
    const websiteTypeInput = document.getElementById('website-type');
    const contentInput = document.getElementById('content');
    const styleTemplateInput = document.getElementById('style-template');
    const styleDescription = document.getElementById('style-description');
    const apiToken = document.getElementById('api-token');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const profileImageInput = document.getElementById('profile-image');
    
    // Preview elements
    const previewIframe = document.getElementById('preview-iframe');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    
    // Generate website
    generateBtn.addEventListener('click', function() {
        // Validate form
        const validation = validateForm();
        
        // Show error if validation fails
        if (!validation.isValid) {
            Swal.fire({
                title: 'Cannot Generate Website',
                text: 'Please provide the following: ' + validation.missingItems.join(", "),
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
        .then(response => response.json())
        .then(data => {
            // Reset button state
            generateBtn.disabled = false;
            generateBtnText.classList.remove('d-none');
            generateLoading.classList.add('d-none');
            
            if (data.success) {
                // Move to results step
                goToStep(5);
                
                // Show preview with loading animation
                Swal.fire({
                    title: 'Website Generated!',
                    text: 'Your website has been created successfully',
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                // Show preview
                setTimeout(() => {
                    previewPlaceholder.classList.add('d-none');
                    previewIframe.classList.remove('d-none');
                    
                    // Set iframe content using srcdoc to properly isolate the content
                    const iframe = document.getElementById('preview-iframe');
                    
                    // Create a blob URL from the HTML content to ensure proper isolation
                    const blob = new Blob([data.html], { type: 'text/html' });
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // Set the src attribute to the blob URL instead of using document.write
                    iframe.src = blobUrl;
                    
                    // Clean up the blob URL when the iframe loads
                    iframe.onload = function() {
                        URL.revokeObjectURL(blobUrl);
                    };
                }, 1000);
            } else {
                Swal.fire({
                    title: 'Generation Failed',
                    text: 'Error: ' + data.message,
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            generateBtn.disabled = false;
            generateBtnText.classList.remove('d-none');
            generateLoading.classList.add('d-none');
            
            Swal.fire({
                title: 'Something Went Wrong',
                text: 'An error occurred while generating your website. Please try again.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B'
            });
        });
    });
}