/**
 * Style template selection functionality
 */
export function initStyleTemplateSelection() {
    const styleTemplates = document.querySelectorAll('.style-template');
    const styleTemplateInput = document.getElementById('style-template-input');
    const styleDescription = document.getElementById('style-description');
    const styleCharCount = document.getElementById('style-char-count');
    const step3Next = document.getElementById('step-3-next');
    
    // Style Description Character Counter
    styleDescription.addEventListener('input', function() {
        const currentLength = this.value.length;
        styleCharCount.textContent = currentLength;
    });
    
    // Style Template Selection with Auto-Fill Style Description
    const styleDescriptions = {
        'modern-minimal': 'Clean, minimalist design with ample whitespace and focused content presentation.',
        'bold-creative': 'Vibrant colors, dynamic layouts, and creative elements for a strong visual impact.',
        'elegant-professional': 'Sophisticated and refined design with premium feel for professional presence.',
        'tech-startup': 'Modern, cutting-edge design with tech-focused elements and innovative layout.',
        'artistic-portfolio': 'Creative, gallery-style layout showcasing visual work with artistic flair.',
        'corporate-clean': 'Professional, structured design with clear hierarchy ideal for business use.'
    };
    
    styleTemplates.forEach(template => {
        template.addEventListener('click', function() {
            // Update selected template visually
            styleTemplates.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            
            // Get the style name
            const styleName = this.dataset.style;
            styleTemplateInput.value = styleName;
            
            // Auto-fill the style description
            if (styleDescriptions[styleName]) {
                styleDescription.value = styleDescriptions[styleName];
                styleCharCount.textContent = styleDescription.value.length;
            }
            
            step3Next.disabled = false;
        });
    });
}