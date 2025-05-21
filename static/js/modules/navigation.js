/**
 * Navigation functionality
 */
export function goToStep(stepNumber) {
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

export function initNavigation() {
    const step1Next = document.getElementById('step-1-next');
    const step2Next = document.getElementById('step-2-next');
    const step2Prev = document.getElementById('step-2-prev');
    const step3Next = document.getElementById('step-3-next');
    const step3Prev = document.getElementById('step-3-prev');
    const step4Prev = document.getElementById('step-4-prev');
    
    step1Next.addEventListener('click', function() {
        goToStep(2);
    });
    
    step2Next.addEventListener('click', function() {
        goToStep(3);
    });
    
    step2Prev.addEventListener('click', function() {
        goToStep(1);
    });
    
    step3Next.addEventListener('click', function() {
        goToStep(4);
    });
    
    step3Prev.addEventListener('click', function() {
        goToStep(2);
    });
    
    step4Prev.addEventListener('click', function() {
        goToStep(3);
    });
}