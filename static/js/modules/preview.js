/**
 * Preview Module - Handles website preview and download functionality
 * 
 * This module provides functions to:
 * 1. Initialize the preview iframe with the generated HTML content
 * 2. Handle HTML and PDF download functionality
 */

// Initialize preview functionality
export function initPreview() {
    // Get HTML content from hidden div
    const htmlContent = document.getElementById('html-content').innerHTML;
    
    // Set iframe content using blob URL to properly isolate the content
    const iframe = document.getElementById('preview-frame');
    
    // Create a blob URL from the HTML content to ensure proper isolation
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Set the src attribute to the blob URL instead of using document.write
    iframe.src = blobUrl;
    
    // Clean up the blob URL when the iframe loads
    iframe.onload = function() {
        URL.revokeObjectURL(blobUrl);
    };
}

// Initialize download functionality
export function initDownload() {
    const htmlContent = document.getElementById('html-content').innerHTML;
    const iframe = document.getElementById('preview-frame');
    
    // HTML Download button functionality
    document.getElementById('download-btn').addEventListener('click', function() {
        // Create a blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-website.html';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });
    
    // PDF Download button functionality
    document.getElementById('download-pdf-btn').addEventListener('click', function() {
        // Show loading indicator
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        this.disabled = true;
        
        // Get the iframe document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Configure html2pdf options
        const options = {
            margin: 10,
            filename: 'generated-website.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Use html2pdf to generate PDF
        html2pdf()
            .from(iframeDoc.documentElement)
            .set(options)
            .save()
            .then(() => {
                // Reset button state
                const btn = document.getElementById('download-pdf-btn');
                btn.innerHTML = originalText;
                btn.disabled = false;
            })
            .catch(error => {
                console.error('PDF generation error:', error);
                // Reset button state and show error
                const btn = document.getElementById('download-pdf-btn');
                btn.innerHTML = originalText;
                btn.disabled = false;
                alert('Failed to generate PDF. Please try again.');
            });
    });
}