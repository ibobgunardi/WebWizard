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
    
    // Color palettes for each style
    const colorPalettes = {
        'modern-minimal': {
            primary: '#3498db',    // Blue
            secondary: '#ecf0f1',  // Light Gray
            background: '#ffffff', // White
            text: '#2c3e50',       // Dark Blue
            accent: '#bdc3c7'      // Silver
        },
        'bold-creative': {
            primary: '#e74c3c',    // Red
            secondary: '#f39c12',  // Orange
            background: '#f9f9f9', // Off-White
            text: '#34495e',       // Navy Blue
            accent: '#9b59b6'      // Purple
        },
        'elegant-professional': {
            primary: '#2c3e50',    // Dark Blue
            secondary: '#7f8c8d',  // Gray
            background: '#f5f5f5', // Light Gray
            text: '#2c3e50',       // Dark Blue
            accent: '#d4af37'      // Gold
        },
        'tech-startup': {
            primary: '#1abc9c',    // Turquoise
            secondary: '#3498db',  // Blue
            background: '#ecf0f1', // Light Gray
            text: '#2c3e50',       // Dark Blue
            accent: '#9b59b6'      // Purple
        },
        'artistic-portfolio': {
            primary: '#9b59b6',    // Purple
            secondary: '#3498db',  // Blue
            background: '#ffffff', // White
            text: '#34495e',       // Navy Blue
            accent: '#e74c3c'      // Red
        },
        'corporate-clean': {
            primary: '#34495e',    // Navy Blue
            secondary: '#2980b9',  // Blue
            background: '#ecf0f1', // Light Gray
            text: '#2c3e50',       // Dark Blue
            accent: '#7f8c8d'      // Gray
        }
    };
    
    // Store the selected color palette in a hidden input
    const colorPaletteInput = document.createElement('input');
    colorPaletteInput.type = 'hidden';
    colorPaletteInput.id = 'color-palette-input';
    document.querySelector('form').appendChild(colorPaletteInput);
    
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
            
            // Store the color palette
            if (colorPalettes[styleName]) {
                colorPaletteInput.value = JSON.stringify(colorPalettes[styleName]);
            }
            
            step3Next.disabled = false;
        });
    });
    
    // Export the color palettes for use in other modules
    return {
        getColorPalette: function(styleName) {
            return colorPalettes[styleName] || colorPalettes['modern-minimal']; // Default to modern-minimal
        }
    };
}