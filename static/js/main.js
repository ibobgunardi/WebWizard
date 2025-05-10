document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    const htmlElement = document.documentElement;
    
    // Initialize theme based on data-bs-theme attribute (default is dark)
    updateThemeIcon();
    
    themeToggleBtn.addEventListener('click', function() {
        if (htmlElement.getAttribute('data-bs-theme') === 'dark') {
            htmlElement.setAttribute('data-bs-theme', 'light');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'dark');
        }
        updateThemeIcon();
    });
    
    function updateThemeIcon() {
        if (htmlElement.getAttribute('data-bs-theme') === 'dark') {
            themeIcon.className = 'fas fa-sun'; // Show sun in dark mode
        } else {
            themeIcon.className = 'fas fa-moon'; // Show moon in light mode
        }
    }
    
    // Elements
    const websiteTypes = document.querySelectorAll('.website-type');
    const websiteTypeInput = document.getElementById('website-type-input');
    const step1Next = document.getElementById('step-1-next');
    
    const contentInput = document.getElementById('content-input');
    const languageDetection = document.getElementById('language-detection');
    const step2Next = document.getElementById('step-2-next');
    const step2Prev = document.getElementById('step-2-prev');
    
    const styleTemplates = document.querySelectorAll('.style-template');
    const styleTemplateInput = document.getElementById('style-template-input');
    const styleDescription = document.getElementById('style-description');
    const styleCharCount = document.getElementById('style-char-count');
    const step3Next = document.getElementById('step-3-next');
    const step3Prev = document.getElementById('step-3-prev');
    
    const apiToken = document.getElementById('api-token');
    const generateBtn = document.getElementById('generate-btn');
    const generateBtnText = document.getElementById('generate-btn-text');
    const generateLoading = document.getElementById('generate-loading');
    const step4Prev = document.getElementById('step-4-prev');
    
    const previewIframe = document.getElementById('preview-iframe');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const deployBtn = document.getElementById('deploy-btn');
    const deployBtnText = document.getElementById('deploy-btn-text');
    const deployLoading = document.getElementById('deploy-loading');
    const vercelToken = document.getElementById('vercel-token');
    
    // Navigation function
    function goToStep(stepNumber) {
        // Update steps progress
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Show active step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            if (index + 1 === stepNumber) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    // Website Type Selection
    websiteTypes.forEach(type => {
        type.addEventListener('click', function() {
            websiteTypes.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            websiteTypeInput.value = this.dataset.type;
            step1Next.disabled = false;
        });
    });
    
    step1Next.addEventListener('click', function() {
        goToStep(2);
    });
    
    // Content Input - Auto Language Detection with Validation
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
    
    step2Next.addEventListener('click', function() {
        goToStep(3);
    });
    
    step2Prev.addEventListener('click', function() {
        goToStep(1);
    });
    
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
    
    step3Next.addEventListener('click', function() {
        goToStep(4);
    });
    
    step3Prev.addEventListener('click', function() {
        goToStep(2);
    });
    
    // API Token and Generation
    step4Prev.addEventListener('click', function() {
        goToStep(3);
    });
    
    // API Token validation and toggle visibility
    const toggleTokenBtn = document.getElementById('toggle-token-btn');
    
    // Toggle password visibility
    toggleTokenBtn.addEventListener('click', function() {
        const tokenIcon = this.querySelector('i');
        if (apiToken.type === 'password') {
            apiToken.type = 'text';
            tokenIcon.classList.remove('fa-eye');
            tokenIcon.classList.add('fa-eye-slash');
        } else {
            apiToken.type = 'password';
            tokenIcon.classList.remove('fa-eye-slash');
            tokenIcon.classList.add('fa-eye');
        }
    });
    
    apiToken.addEventListener('input', function() {
        validateApiToken(this.value.trim());
    });
    
    function validateApiToken(token) {
        const tokenRegex = /^[a-zA-Z0-9_\-]{10,}/;
        const isValid = tokenRegex.test(token);
        
        // Show validation feedback
        if (token) {
            if (isValid) {
                apiToken.classList.add('is-valid');
                apiToken.classList.remove('is-invalid');
                generateBtn.disabled = false;
            } else {
                apiToken.classList.add('is-invalid');
                apiToken.classList.remove('is-valid');
                generateBtn.disabled = true;
            }
        } else {
            apiToken.classList.remove('is-valid', 'is-invalid');
            generateBtn.disabled = true;
        }
    }
    
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
                    
                    // Set iframe content
                    const iframe = document.getElementById('preview-iframe');
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(data.html);
                    iframeDoc.close();
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
    
    // Try Again Button
    tryAgainBtn.addEventListener('click', function() {
        // Reset to step 1
        goToStep(1);
        
        // Reset form
        document.getElementById('website-generator-form').reset();
        websiteTypes.forEach(t => t.classList.remove('selected'));
        styleTemplates.forEach(t => t.classList.remove('selected'));
        step1Next.disabled = true;
        step2Next.disabled = true;
        step3Next.disabled = true;
        
        // Reset preview
        previewIframe.classList.add('d-none');
        previewPlaceholder.classList.remove('d-none');
        languageDetection.innerHTML = '';
    });
    
    // Deploy to Vercel
    deployBtn.addEventListener('click', function() {
        if (!vercelToken.value.trim()) {
            Swal.fire({
                title: 'Vercel Token Required',
                text: 'Please enter your Vercel API token to deploy the website',
                icon: 'warning',
                confirmButtonColor: '#FF6B6B'
            });
            return;
        }
        
        // Show loading state
        deployBtn.disabled = true;
        deployBtnText.classList.add('d-none');
        deployLoading.classList.remove('d-none');
        
        // Prepare form data
        const formData = new FormData();
        formData.append('vercel_token', vercelToken.value);
        
        // Send request to deploy website
        fetch('/deploy', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Reset button state
            deployBtn.disabled = false;
            deployBtnText.classList.remove('d-none');
            deployLoading.classList.add('d-none');
            
            if (data.success) {
                Swal.fire({
                    title: 'Successfully Deployed!',
                    html: `Your website is now live at:<br><a href="${data.url}" target="_blank">${data.url}</a>`,
                    icon: 'success',
                    confirmButtonText: 'Open Website',
                    confirmButtonColor: '#FF6B6B',
                    showCancelButton: true,
                    cancelButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.open(data.url, '_blank');
                    }
                });
            } else {
                Swal.fire({
                    title: 'Deployment Failed',
                    text: 'Error: ' + data.message,
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            deployBtn.disabled = false;
            deployBtnText.classList.remove('d-none');
            deployLoading.classList.add('d-none');
            
            Swal.fire({
                title: 'Deployment Error',
                text: 'An error occurred during deployment. Please try again.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B'
            });
        });
    });
});
