/**
 * Content input and validation functionality
 */
export function initContentInput() {
    const contentInput = document.getElementById('content-input');
    const languageDetection = document.getElementById('language-detection');
    const step2Next = document.getElementById('step-2-next');
    
    contentInput.addEventListener('input', function() {
        const contentLength = this.value.length;
        const minLength = this.getAttribute('data-min-length') || 20;
        const maxLength = this.getAttribute('data-max-length') || 4000;
        
        // Update the character count and limit display
        const charCountDisplay = document.getElementById('content-char-count');
        if (charCountDisplay) {
            charCountDisplay.textContent = contentLength;
            
            // Add warning classes based on length
            if (contentLength > maxLength * 0.9) {
                charCountDisplay.classList.add('text-danger');
                charCountDisplay.classList.remove('text-warning', 'text-success');
            } else if (contentLength > maxLength * 0.7) {
                charCountDisplay.classList.add('text-warning');
                charCountDisplay.classList.remove('text-danger', 'text-success');
            } else if (contentLength >= minLength) {
                charCountDisplay.classList.add('text-success');
                charCountDisplay.classList.remove('text-danger', 'text-warning');
            } else {
                charCountDisplay.classList.remove('text-success', 'text-danger', 'text-warning');
            }
        }
        
        if (contentLength >= minLength && contentLength <= maxLength) {
            // We're using the server-side detection in utils.py, this is just for immediate UI feedback
            const hasIndonesianWords = /\b(dan|atau|dengan|ini|itu|yang|di|ke|dari|pada|adalah|untuk|dalam|tidak|bukan)\b/i.test(this.value);
            const language = hasIndonesianWords ? 'Indonesian (ID)' : 'English (EN)';
            languageDetection.innerHTML = `<i class="fas fa-globe me-1"></i> Auto-detected language: <strong>${language}</strong>`;
            step2Next.disabled = false;
            
            // Remove any validation messages
            if (document.getElementById('content-validation-message')) {
                document.getElementById('content-validation-message').remove();
            }
        } else {
            // Update language detection display
            if (contentLength >= minLength) {
                const hasIndonesianWords = /\b(dan|atau|dengan|ini|itu|yang|di|ke|dari|pada|adalah|untuk|dalam|tidak|bukan)\b/i.test(this.value);
                const language = hasIndonesianWords ? 'Indonesian (ID)' : 'English (EN)';
                languageDetection.innerHTML = `<i class="fas fa-globe me-1"></i> Auto-detected language: <strong>${language}</strong>`;
            } else {
                languageDetection.innerHTML = '';
            }
            
            // Disable the next button
            step2Next.disabled = true;
            
            // Show validation message
            let validationMessage = '';
            if (contentLength < minLength) {
                validationMessage = `Content is too short. Please enter at least ${minLength} characters.`;
            } else if (contentLength > maxLength) {
                validationMessage = `Content is too long. Maximum allowed is ${maxLength} characters.`;
            }
            
            // Add or update validation message
            let validationElement = document.getElementById('content-validation-message');
            if (!validationElement && validationMessage) {
                validationElement = document.createElement('div');
                validationElement.id = 'content-validation-message';
                validationElement.className = 'alert alert-warning mt-2';
                validationElement.innerHTML = validationMessage;
                this.parentNode.appendChild(validationElement);
            } else if (validationElement && validationMessage) {
                validationElement.innerHTML = validationMessage;
            }
        }
    });
}