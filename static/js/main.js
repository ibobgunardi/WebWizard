document.addEventListener('DOMContentLoaded', function() {
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
    const randomStyleBtn = document.getElementById('random-style-btn');
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
    
    // Content Input
    contentInput.addEventListener('input', function() {
        // Simple language detection simulation
        if (this.value.length > 20) {
            const hasIndonesianWords = /\b(dan|atau|dengan|ini|itu|yang|di|ke|dari|pada)\b/i.test(this.value);
            const language = hasIndonesianWords ? 'Indonesian' : 'English';
            languageDetection.innerHTML = `<i class="fas fa-globe me-1"></i> Detected language: <strong>${language}</strong>`;
            step2Next.disabled = false;
        } else {
            languageDetection.innerHTML = '';
            step2Next.disabled = true;
        }
    });
    
    step2Next.addEventListener('click', function() {
        goToStep(3);
    });
    
    step2Prev.addEventListener('click', function() {
        goToStep(1);
    });
    
    // Style Template Selection
    styleTemplates.forEach(template => {
        template.addEventListener('click', function() {
            styleTemplates.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            styleTemplateInput.value = this.dataset.style;
            step3Next.disabled = false;
        });
    });
    
    randomStyleBtn.addEventListener('click', function() {
        const templates = Array.from(styleTemplates);
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        styleTemplates.forEach(t => t.classList.remove('selected'));
        randomTemplate.classList.add('selected');
        styleTemplateInput.value = randomTemplate.dataset.style;
        step3Next.disabled = false;
        
        // Scroll to the selected template
        randomTemplate.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    generateBtn.addEventListener('click', function() {
        if (!apiToken.value.trim()) {
            alert('Please enter your OpenRouter API token');
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
        formData.append('style', styleTemplateInput.value);
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
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            generateBtn.disabled = false;
            generateBtnText.classList.remove('d-none');
            generateLoading.classList.add('d-none');
            alert('An error occurred. Please try again.');
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
            alert('Please enter your Vercel API token');
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
                alert('Website deployed successfully! URL: ' + data.url);
                window.open(data.url, '_blank');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            deployBtn.disabled = false;
            deployBtnText.classList.remove('d-none');
            deployLoading.classList.add('d-none');
            alert('An error occurred during deployment. Please try again.');
        });
    });
});
