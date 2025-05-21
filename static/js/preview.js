/**
 * WebWizard - Preview JavaScript
 * 
 * This file initializes the preview functionality for the WebWizard application.
 */

// Import modules
import { initPreview, initDownload } from './modules/preview.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize preview functionality
    initPreview();
    
    // Initialize download functionality
    initDownload();
});