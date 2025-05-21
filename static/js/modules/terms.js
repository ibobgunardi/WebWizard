/**
 * Terms and conditions functionality
 */
export function initTerms() {
    const termsCheckbox = document.getElementById('terms-checkbox');
    const generateBtn = document.getElementById('generate-btn');
    
    if (termsCheckbox && generateBtn) {
        // Check terms checkbox status when generate button is clicked
        generateBtn.addEventListener('click', function(event) {
            if (!termsCheckbox.checked) {
                event.preventDefault();
                termsCheckbox.classList.add('is-invalid');
                
                // Show warning alert
                Swal.fire({
                    title: 'Terms Agreement Required',
                    text: 'You must agree to the Terms and Conditions before generating a website.',
                    icon: 'warning',
                    confirmButtonColor: '#FF6B6B'
                });
                
                return false;
            } else {
                termsCheckbox.classList.remove('is-invalid');
                return true;
            }
        });
        
        // Remove invalid class when checkbox is checked
        termsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                this.classList.remove('is-invalid');
            }
        });
    }
}