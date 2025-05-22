import os
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from utils import generate_website, detect_language, deploy_to_vercel

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

@app.route('/')
def index():
    """Render the main page of the application."""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    """Generate a website based on user input using OpenRouter API."""
    try:
        # Get form data
        website_type = request.form.get('website_type')
        content = request.form.get('content')
        style = request.form.get('style')
        api_token = request.form.get('api_token')
        photo_data = request.form.get('photo_data')
        color_palette = request.form.get('color_palette')
        
        # Detect language
        language = detect_language(content)
        
        # Process photo data if provided
        original_photo_data = None
        if photo_data:
            # Extract just the base64 part from the data URL
            if 'base64,' in photo_data:
                original_photo_data = photo_data.split('base64,')[1]
            else:
                original_photo_data = photo_data
            
            # Add a note about the photo to the content
            content += "\n\nPlease include a profile photo in the generated website."
        
        # Generate website HTML using AI
        html_content = generate_website(
            website_type=website_type, 
            content=content, 
            style=style, 
            language=language, 
            api_token=api_token,
            color_palette=color_palette,
            photo_data=original_photo_data is not None  # Just pass a boolean flag
        )
        
        # If photo data was provided, add it to the placeholder or insert it if no placeholder exists
        if original_photo_data:
            # Check if the AI included the placeholder
            if 'id="profile-photo-placeholder"' in html_content:
                # Replace the placeholder with the actual image
                html_content = html_content.replace(
                    'id="profile-photo-placeholder"', 
                    f'id="profile-photo" src="data:image/jpeg;base64,{original_photo_data}"'
                )
            else:
                # If no placeholder, add it ourselves in a reasonable location
                # Try to find a suitable container for the photo
                photo_containers = [
                    '<div class="profile"', 
                    '<div class="about"', 
                    '<div class="header"', 
                    '<header', 
                    '<section', 
                    '<div class="container"'
                ]
                
                insertion_point = None
                for container in photo_containers:
                    if container in html_content:
                        # Find the end of the opening tag
                        start_idx = html_content.find(container)
                        end_idx = html_content.find('>', start_idx) + 1
                        if end_idx > 0:
                            insertion_point = end_idx
                            break
                
                # Create the image tag with appropriate styling
                img_tag = f'<img src="data:image/jpeg;base64,{original_photo_data}" alt="Profile Photo" class="profile-photo" style="max-width: 300px; border-radius: 8px; margin: 20px auto; display: block;">'
                
                if insertion_point:
                    # Insert after the container opening tag
                    html_content = html_content[:insertion_point] + img_tag + html_content[insertion_point:]
                elif '</body>' in html_content:
                    # Fallback: insert before closing body tag
                    html_content = html_content.replace('</body>', f'{img_tag}</body>')
            
            # Add CSS for the profile photo if not already present
            if '.profile-photo' not in html_content and '</style>' in html_content:
                photo_css = """
    .profile-photo {
        max-width: 300px;
        border-radius: 8px;
        margin: 20px auto;
        display: block;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    .profile-photo:hover {
        transform: scale(1.02);
    }
"""
                html_content = html_content.replace('</style>', f'{photo_css}</style>')
        
        # Log the final HTML
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_html_path = f"/workspace/WebWizard/logs/html_dumps/final_html_{timestamp}.html"
        os.makedirs(os.path.dirname(final_html_path), exist_ok=True)
        with open(final_html_path, 'w') as f:
            f.write(html_content)
        
        # Store the generated HTML in the session for preview
        session['generated_html'] = html_content
        
        return jsonify({
            'success': True,
            'message': 'Website generated successfully!',
            'html': html_content
        })
    except Exception as e:
        logging.error(f"Error generating website: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error: {str(e)}"
        }), 500

@app.route('/preview')
def preview():
    """Display the preview of the generated website."""
    html_content = session.get('generated_html', '')
    if not html_content:
        return render_template('index.html', error="No website has been generated yet")
    
    return render_template('preview.html', html_content=html_content)

@app.route('/download-pdf')
def download_pdf():
    """Generate a PDF from the HTML content."""
    html_content = session.get('generated_html', '')
    if not html_content:
        return jsonify({
            'success': False,
            'message': 'No website has been generated yet'
        }), 400
    
    # We'll use the html2pdf.js library on the client side for PDF generation
    # This route is just a placeholder for future server-side PDF generation if needed
    return jsonify({
        'success': True,
        'html': html_content
    })

@app.route('/deploy', methods=['POST'])
def deploy():
    """Deploy the generated website to Vercel."""
    try:
        html_content = session.get('generated_html', '')
        if not html_content:
            return jsonify({
                'success': False,
                'message': 'No website has been generated yet'
            }), 400
        
        # Get Vercel token
        vercel_token = request.form.get('vercel_token')
        if not vercel_token:
            return jsonify({
                'success': False,
                'message': 'Vercel token is required'
            }), 400
        
        # Deploy to Vercel
        deployment_url = deploy_to_vercel(html_content, vercel_token)
        
        return jsonify({
            'success': True,
            'message': 'Website deployed successfully!',
            'url': deployment_url
        })
    except Exception as e:
        logging.error(f"Error deploying website: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=12000, debug=True)
