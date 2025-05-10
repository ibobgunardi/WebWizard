import os
import logging
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
        
        # Detect language
        language = detect_language(content)
        
        # Generate website HTML using AI
        html_content = generate_website(website_type, content, style, language, api_token)
        
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
    app.run(host='0.0.0.0', port=5000, debug=True)
