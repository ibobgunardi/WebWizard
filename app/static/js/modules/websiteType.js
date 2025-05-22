/**
 * Website type selection functionality
 */
export function initWebsiteTypeSelection() {
    const websiteTypes = document.querySelectorAll('.website-type');
    const websiteTypeInput = document.getElementById('website-type-input');
    const step1Next = document.getElementById('step-1-next');
    
    websiteTypes.forEach(type => {
        type.addEventListener('click', function() {
            websiteTypes.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            websiteTypeInput.value = this.dataset.type;
            step1Next.disabled = false;
        });
    });
}