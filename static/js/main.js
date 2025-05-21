/**
 * Main JavaScript file that imports and initializes all modules
 */
import { initThemeToggle } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initWebsiteTypeSelection } from './modules/websiteType.js';
import { initContentInput } from './modules/contentInput.js';
import { initStyleTemplateSelection } from './modules/styleTemplate.js';
import { initApiToken } from './modules/apiToken.js';
import { initGeneration } from './modules/generation.js';
import { initPhotoUpload } from './modules/photoUpload.js';
import { initDeploy } from './modules/deploy.js';
import { initPdfDownload } from './modules/pdfDownload.js';
import { initTerms } from './modules/terms.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initThemeToggle();
    initNavigation();
    initWebsiteTypeSelection();
    initContentInput();
    initStyleTemplateSelection();
    initApiToken();
    initGeneration();
    initPhotoUpload();
    initDeploy();
    initPdfDownload();
    initTerms();
});