/**
 * Language Module - Handles language detection
 */

// Initialize language detection
export function initLanguageDetection() {
    const contentInput = document.getElementById('content');
    const languageDetection = document.getElementById('language-detection');
    
    // Detect language on content input
    contentInput.addEventListener('input', debounce(function() {
        const content = this.value.trim();
        
        // Only detect language if there's enough content
        if (content.length > 20) {
            // Show loading indicator
            languageDetection.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Detecting language...';
            
            // Simple language detection based on common words
            let language = detectLanguage(content);
            
            // Show detected language
            if (language === 'id') {
                languageDetection.innerHTML = '<i class="bi bi-translate"></i> Bahasa Indonesia terdeteksi';
            } else {
                languageDetection.innerHTML = '<i class="bi bi-translate"></i> English detected';
            }
        } else {
            // Clear language detection if content is too short
            languageDetection.innerHTML = '';
        }
    }, 500));
}

// Simple language detection function
function detectLanguage(text) {
    // Convert to lowercase for easier comparison
    const lowerText = text.toLowerCase();
    
    // Common Indonesian words
    const indonesianWords = ['yang', 'dan', 'dengan', 'untuk', 'pada', 'adalah', 'ini', 'dari', 'dalam', 'akan'];
    
    // Count Indonesian words
    let indonesianCount = 0;
    indonesianWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'g');
        const matches = lowerText.match(regex);
        if (matches) {
            indonesianCount += matches.length;
        }
    });
    
    // If more than 2 Indonesian words are found, assume it's Indonesian
    return indonesianCount > 2 ? 'id' : 'en';
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}