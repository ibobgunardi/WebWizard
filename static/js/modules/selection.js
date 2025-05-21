/**
 * Selection Module - Handles website type and style template selection
 */

import { goToStep } from './navigation.js';

// Initialize selection functionality
export function initSelection() {
    // Website type selection
    const websiteTypes = document.querySelectorAll('.website-type');
    const websiteTypeInput = document.getElementById('website-type');
    const step1Next = document.getElementById('step-1-next');
    
    // Style template selection
    const styleTemplates = document.querySelectorAll('.style-template');
    const styleTemplateInput = document.getElementById('style-template');
    const step2Next = document.getElementById('step-2-next');
    
    // Profile image section (for CV websites)
    const profileImageSection = document.getElementById('profile-image-section');
    const profileImageInput = document.getElementById('profile-image');
    const profileImagePreview = document.getElementById('profile-image-preview');
    
    // Website type selection
    websiteTypes.forEach(type => {
        type.addEventListener('click', function() {
            // Remove selected class from all types
            websiteTypes.forEach(t => t.classList.remove('selected'));
            
            // Add selected class to clicked type
            this.classList.add('selected');
            
            // Set the value in the hidden input
            websiteTypeInput.value = this.dataset.type;
            
            // Enable next button
            step1Next.disabled = false;
            
            // Show/hide profile image section based on website type
            if (this.dataset.type.toLowerCase() === 'cv') {
                profileImageSection.classList.remove('d-none');
            } else {
                profileImageSection.classList.add('d-none');
            }
        });
    });
    
    // Style template selection
    styleTemplates.forEach(template => {
        template.addEventListener('click', function() {
            // Remove selected class from all templates
            styleTemplates.forEach(t => t.classList.remove('selected'));
            
            // Add selected class to clicked template
            this.classList.add('selected');
            
            // Set the value in the hidden input
            styleTemplateInput.value = this.dataset.style;
            
            // Enable next button
            step2Next.disabled = false;
        });
    });
    
    // Profile image preview
    if (profileImageInput) {
        profileImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    profileImagePreview.src = e.target.result;
                    profileImagePreview.classList.remove('d-none');
                };
                
                reader.readAsDataURL(this.files[0]);
            } else {
                profileImagePreview.classList.add('d-none');
            }
        });
    }
}