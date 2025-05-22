/**
 * Website generation functionality
 */
import { goToStep } from './navigation.js';
import { validateApiToken } from './apiToken.js';

export function initGeneration() {
    const generateBtn = document.getElementById('generate-btn');
    const generateBtnText = document.getElementById('generate-btn-text');
    const generateLoading = document.getElementById('generate-loading');
    const apiToken = document.getElementById('api-token');
    const websiteTypeInput = document.getElementById('website-type-input');
    const contentInput = document.getElementById('content-input');
    const styleTemplateInput = document.getElementById('style-template-input');
    const styleDescription = document.getElementById('style-description');
    const previewIframe = document.getElementById('preview-iframe');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const tryAgainBtn = document.getElementById('try-again-btn');
    
    generateBtn.addEventListener('click', function() {
        if (!apiToken.value.trim()) {
            Swal.fire({
                title: 'API Token Required',
                text: 'Please enter your OpenRouter API token to generate the website',
                icon: 'warning',
                confirmButtonColor: '#FF6B6B'
            });
            return;
        }
        
        // Extra validation
        const token = apiToken.value.trim();
        const tokenRegex = /^[a-zA-Z0-9_\-]{10,}/;
        if (!tokenRegex.test(token)) {
            Swal.fire({
                title: 'Invalid API Token',
                text: 'The API token you entered doesn\'t appear to be valid. Please check and try again.',
                icon: 'error',
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
        
        // Add color palette if available
        const colorPaletteInput = document.getElementById('color-palette-input');
        if (colorPaletteInput && colorPaletteInput.value) {
            formData.append('color_palette', colorPaletteInput.value);
        }
        
        // Add photo if uploaded
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload && photoUpload.files && photoUpload.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Add the base64 image data to the form
                formData.append('photo_data', e.target.result);
                
                // Now send the request with the photo data
                sendGenerateRequest(formData);
            };
            reader.readAsDataURL(photoUpload.files[0]);
        } else {
            // No photo, send request directly
            sendGenerateRequest(formData);
        }
    });
    
    // Function to send the generate request
    function sendGenerateRequest(formData) {
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
                }, 500);
            } else {
                Swal.fire({
                    title: 'Generation Failed',
                    text: data.error || 'There was an error generating your website. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Reset button state
            generateBtn.disabled = false;
            generateBtnText.classList.remove('d-none');
            generateLoading.classList.add('d-none');
            
            Swal.fire({
                title: 'Generation Failed',
                text: 'There was an error generating your website. Please try again.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B'
            });
        });
    }
    
    // Try again button
    tryAgainBtn.addEventListener('click', function() {
        goToStep(1);
        
        // Reset form
        document.querySelectorAll('.website-type').forEach(t => t.classList.remove('selected'));
        document.querySelectorAll('.style-template').forEach(t => t.classList.remove('selected'));
        
        document.getElementById('website-type-input').value = '';
        document.getElementById('content-input').value = '';
        document.getElementById('style-template-input').value = '';
        document.getElementById('style-description').value = '';
        
        // Reset preview
        previewIframe.classList.add('d-none');
        previewPlaceholder.classList.remove('d-none');
    });
}