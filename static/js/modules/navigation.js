/**
 * Navigation Module - Handles step navigation and progress bar
 */

// Export the goToStep function to be used in other modules
export function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('d-none');
    });
    
    // Show the current step
    document.getElementById(`step-${stepNumber}`).classList.remove('d-none');
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((step, index) => {
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
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize navigation buttons
export function initNavigation() {
    // Step navigation buttons
    const step1Next = document.getElementById('step-1-next');
    const step2Next = document.getElementById('step-2-next');
    const step2Back = document.getElementById('step-2-back');
    const step3Next = document.getElementById('step-3-next');
    const step3Back = document.getElementById('step-3-back');
    const step4Back = document.getElementById('step-4-back');
    const tryAgainBtn = document.getElementById('try-again-btn');
    
    // Step 1 -> Step 2
    step1Next.addEventListener('click', () => goToStep(2));
    
    // Step 2 -> Step 3
    step2Next.addEventListener('click', () => goToStep(3));
    
    // Step 2 -> Step 1
    step2Back.addEventListener('click', () => goToStep(1));
    
    // Step 3 -> Step 4
    step3Next.addEventListener('click', () => goToStep(4));
    
    // Step 3 -> Step 2
    step3Back.addEventListener('click', () => goToStep(2));
    
    // Step 4 -> Step 3
    step4Back.addEventListener('click', () => goToStep(3));
    
    // Try Again Button
    tryAgainBtn.addEventListener('click', function() {
        // Reset to step 1
        goToStep(1);
        
        // Reset form
        document.getElementById('website-generator-form').reset();
        document.querySelectorAll('.website-type').forEach(t => t.classList.remove('selected'));
        document.querySelectorAll('.style-template').forEach(t => t.classList.remove('selected'));
        
        // Reset preview
        document.getElementById('preview-iframe').classList.add('d-none');
        document.getElementById('preview-placeholder').classList.remove('d-none');
        document.getElementById('language-detection').innerHTML = '';
    });
}