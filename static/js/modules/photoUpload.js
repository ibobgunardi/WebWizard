/**
 * Photo upload functionality
 */
export function initPhotoUpload() {
    const photoUpload = document.getElementById('photo-upload');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    
    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                // Check if the file is an image
                if (!file.type.match('image.*')) {
                    Swal.fire({
                        title: 'Invalid File',
                        text: 'Please select an image file (JPEG, PNG, GIF, etc.)',
                        icon: 'error',
                        confirmButtonColor: '#FF6B6B'
                    });
                    this.value = '';
                    return;
                }
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        title: 'File Too Large',
                        text: 'Please select an image smaller than 5MB',
                        icon: 'error',
                        confirmButtonColor: '#FF6B6B'
                    });
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    photoPreviewContainer.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
        
        removePhotoBtn.addEventListener('click', function() {
            photoUpload.value = '';
            photoPreviewContainer.classList.add('d-none');
        });
    }
}