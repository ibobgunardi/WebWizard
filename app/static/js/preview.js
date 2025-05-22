document.addEventListener('DOMContentLoaded', function() {
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
    
    // Download button functionality
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
});
