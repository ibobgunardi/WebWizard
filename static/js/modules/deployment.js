/**
 * Deployment Module - Handles website deployment to Vercel
 */

// Initialize deployment functionality
export function initDeployment() {
    // Deployment elements
    const deployBtn = document.getElementById('deploy-btn');
    const deployBtnText = document.getElementById('deploy-btn-text');
    const deployLoading = document.getElementById('deploy-loading');
    const vercelToken = document.getElementById('vercel-token');
    const deploymentUrl = document.getElementById('deployment-url');
    const deploymentSection = document.getElementById('deployment-section');
    
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
                // Show success message
                Swal.fire({
                    title: 'Website Deployed!',
                    text: 'Your website has been deployed successfully',
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                // Show deployment URL
                deploymentUrl.href = data.url;
                deploymentUrl.textContent = data.url;
                deploymentSection.classList.remove('d-none');
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
                title: 'Something Went Wrong',
                text: 'An error occurred while deploying your website. Please try again.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B'
            });
        });
    });
}