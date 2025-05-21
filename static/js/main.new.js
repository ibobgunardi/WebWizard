/**
 * Main JavaScript file for WebWizard
 * This file imports and initializes all modules
 */

// Import modules
import { initThemeToggle } from './modules/theme.js';
import { initNavigation, goToStep } from './modules/navigation.js';
import { initSelection } from './modules/selection.js';
import { initFormValidation } from './modules/form-validation.js';
import { initWebsiteGeneration } from './modules/website-generation.js';
import { initDeployment } from './modules/deployment.js';

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize navigation
    const navigation = initNavigation();
    
    // Initialize selection
    initSelection();
    
    // Initialize form validation
    const validation = initFormValidation();
    
    // Initialize website generation
    initWebsiteGeneration();
    
    // Initialize deployment
    initDeployment();
    
    // Initialize PDF download functionality
    initPdfDownload();
    
    // Initialize PDF download functionality
    function initPdfDownload() {
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', function() {
                const previewIframe = document.getElementById('preview-iframe');
                
                if (previewIframe && previewIframe.contentWindow) {
                    // Get the document from the iframe
                    const iframeDocument = previewIframe.contentWindow.document;
                    
                    // Get the HTML content
                    const element = iframeDocument.documentElement;
                    
                    // Set options for html2pdf
                    const options = {
                        margin: 10,
                        filename: 'website.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    
                    // Generate PDF
                    html2pdf()
                        .from(element)
                        .set(options)
                        .save()
                        .catch(error => {
                            console.error('PDF generation error:', error);
                            Swal.fire({
                                title: 'PDF Generation Failed',
                                text: 'An error occurred while generating the PDF. Please try again.',
                                icon: 'error',
                                confirmButtonColor: '#FF6B6B'
                            });
                        });
                } else {
                    Swal.fire({
                        title: 'PDF Generation Failed',
                        text: 'No preview content found. Please generate a website first.',
                        icon: 'error',
                        confirmButtonColor: '#FF6B6B'
                    });
                }
            });
        }
    }
});