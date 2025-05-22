/**
 * PDF Download functionality
 */
export function initPdfDownload() {
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            const iframe = document.getElementById('preview-iframe');
            
            if (!iframe || iframe.classList.contains('d-none')) {
                Swal.fire({
                    title: 'No Content',
                    text: 'Please generate a website first before downloading as PDF',
                    icon: 'warning',
                    confirmButtonColor: '#FF6B6B'
                });
                return;
            }
            
            // Get the content from the iframe
            const element = iframe.contentDocument.documentElement;
            
            // Set options for html2pdf
            const opt = {
                margin: 10,
                filename: 'generated-website.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Check if html2pdf is loaded, if not, load it
            if (typeof html2pdf === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = function() {
                    // Once loaded, generate PDF
                    html2pdf().set(opt).from(element).save().then(() => {
                        Swal.fire({
                            title: 'PDF Generated',
                            text: 'Your PDF has been downloaded successfully!',
                            icon: 'success',
                            confirmButtonColor: '#FF6B6B'
                        });
                    });
                };
                document.head.appendChild(script);
            } else {
                // If already loaded, generate PDF
                html2pdf().set(opt).from(element).save().then(() => {
                    Swal.fire({
                        title: 'PDF Generated',
                        text: 'Your PDF has been downloaded successfully!',
                        icon: 'success',
                        confirmButtonColor: '#FF6B6B'
                    });
                });
            }
        });
    }
}