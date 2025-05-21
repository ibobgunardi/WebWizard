/**
 * Deployment functionality
 */
export function initDeploy() {
    const deployBtn = document.getElementById('deploy-btn');
    const deployBtnText = document.getElementById('deploy-btn-text');
    const deployLoading = document.getElementById('deploy-loading');
    const vercelToken = document.getElementById('vercel-token');
    
    if (deployBtn) {
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
            
            // Get the HTML content from the iframe
            const iframe = document.getElementById('preview-iframe');
            let htmlContent = '';
            
            try {
                // Try to get the HTML content from the iframe
                htmlContent = iframe.contentDocument.documentElement.outerHTML;
            } catch (e) {
                console.error('Error accessing iframe content:', e);
                Swal.fire({
                    title: 'Deployment Failed',
                    text: 'Could not access the website content. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
                
                // Reset button state
                deployBtn.disabled = false;
                deployBtnText.classList.remove('d-none');
                deployLoading.classList.add('d-none');
                return;
            }
            
            // Prepare form data
            const formData = new FormData();
            formData.append('html_content', htmlContent);
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
                        title: 'Website Deployed!',
                        html: `Your website has been deployed successfully!<br><br>
                               <a href="${data.url}" target="_blank" class="btn btn-primary">
                                   <i class="fas fa-external-link-alt me-2"></i>Visit Your Website
                               </a>`,
                        icon: 'success',
                        confirmButtonColor: '#FF6B6B'
                    });
                } else {
                    Swal.fire({
                        title: 'Deployment Failed',
                        text: data.error || 'There was an error deploying your website. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#FF6B6B'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Reset button state
                deployBtn.disabled = false;
                deployBtnText.classList.remove('d-none');
                deployLoading.classList.add('d-none');
                
                Swal.fire({
                    title: 'Deployment Failed',
                    text: 'There was an error deploying your website. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
            });
        });
    }
}