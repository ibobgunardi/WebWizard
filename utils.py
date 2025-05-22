import os
import json
import logging
import requests
from datetime import datetime
from langdetect import detect

def detect_language(text):
    """
    Detect if the text is in Indonesian or English.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        str: 'id' for Indonesian, 'en' for English, 'en' as fallback
    """
    try:
        lang = detect(text)
        # If Indonesian is detected, return 'id', otherwise default to 'en'
        return lang if lang == 'id' else 'en'
    except Exception as e:
        logging.error(f"Language detection error: {str(e)}")
        # Default to English if detection fails
        return 'en'

def generate_website(website_type, content, style, language, api_token, color_palette=None, photo_data=None):
    """
    Generate website HTML using OpenRouter API.
    
    Args:
        website_type (str): Type of website (CV, landing page, portfolio)
        content (str): User's content to transform
        style (str): Selected style template
        language (str): Detected language ('id' or 'en')
        api_token (str): OpenRouter API token
        color_palette (dict, optional): Color palette to use for the website
        photo_data (str, optional): Base64 encoded photo data
        
    Returns:
        str: Generated HTML content
    """
    # OpenRouter API endpoint
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Create prompt based on inputs
    if language == 'id':
        language_note = "The content is in Indonesian. Generate an Indonesian website."
    else:
        language_note = "The content is in English. Generate an English website."
    
    # Parse color palette if provided as JSON string
    colors = None
    if color_palette:
        if isinstance(color_palette, str):
            try:
                colors = json.loads(color_palette)
            except json.JSONDecodeError:
                logging.warning("Failed to parse color palette JSON")
        else:
            colors = color_palette
    
    # Use provided color palette or default
    color_scheme = """
    3. Incorporate the following color scheme: 
       - Primary: #FF6B6B (soft coral)
       - Secondary: #4ECDC4 (calming teal)
       - Background: #F7F9FC (airy white) 
       - Text: #2D3436 (soft black)
       - Accent: #95A5A6 (gentle grey)
    """
    
    if colors:
        color_scheme = f"""
    3. Incorporate the following color scheme: 
       - Primary: {colors.get('primary', '#FF6B6B')}
       - Secondary: {colors.get('secondary', '#4ECDC4')}
       - Background: {colors.get('background', '#F7F9FC')}
       - Text: {colors.get('text', '#2D3436')}
       - Accent: {colors.get('accent', '#95A5A6')}
    """
    
    # Add photo instructions if provided
    photo_instructions = ""
    if photo_data:
        photo_instructions = """
    11. Include a profile photo placeholder with the ID "profile-photo-placeholder" in an appropriate location.
        Use this exact HTML: <img id="profile-photo-placeholder" alt="Profile Photo" class="profile-photo" style="max-width: 300px; border-radius: 8px; margin: 20px auto; display: block;">
        """
    
    prompt = f"""
    Create a complete, standalone HTML page for a {website_type} website with the following content:
    
    {content}
    
    Style preferences: {style}
    
    {language_note}
    
    Important requirements:
    1. Create a fully working standalone single-page HTML file that includes all CSS styles internally
    2. Use modern HTML5 and CSS3 features with responsive design{color_scheme}
    4. Use Quicksand for headings and Inter for body text (with Google Fonts)
    5. Include soft shadows, 12px rounded corners, and 24px consistent spacing
    6. Make the design professional, modern, and visually appealing
    7. Include links to the developer's profile indicating they are "open to work"
    8. Add donation buttons for Trakteer and BuyMeACoffee at the bottom
    9. Use dark theme styling that matches the selected style
    10. The page should be complete and ready to deploy without any external dependencies{photo_instructions}
    
    Return only the HTML code without any explanation or markdown.
    """
    
    # Make request to OpenRouter API
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "nousresearch/deephermes-3-mistral-24b-preview:free",  # Using a free model from OpenRouters
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(api_url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        # Log the AI response
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        ai_response_path = f"/workspace/WebWizard/logs/ai_responses/response_{timestamp}.json"
        os.makedirs(os.path.dirname(ai_response_path), exist_ok=True)
        with open(ai_response_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Check if we have choices in the response
        if 'choices' not in result or not result['choices'] or 'message' not in result['choices'][0]:
            error_msg = "API response did not contain expected data structure"
            logging.error(f"OpenRouter API error: {error_msg}")
            logging.error(f"Response: {result}")
            raise Exception(error_msg)
            
        html_content = result["choices"][0]["message"]["content"]
        
        # Clean up the response if needed (remove any markdown code block markers)
        html_content = html_content.replace("```html", "").replace("```", "").strip()
        
        # Log the generated HTML
        html_dump_path = f"/workspace/WebWizard/logs/html_dumps/html_{timestamp}.html"
        os.makedirs(os.path.dirname(html_dump_path), exist_ok=True)
        with open(html_dump_path, 'w') as f:
            f.write(html_content)
        
        return html_content
    except requests.RequestException as req_err:
        # Handle request-related errors
        error_text = ""
        if hasattr(req_err, 'response') and req_err.response:
            try:
                error_text = req_err.response.text
            except:
                error_text = "No response text available"
        
        logging.error(f"OpenRouter API request error: {str(req_err)}")
        logging.error(f"Response: {error_text}")
        
        if "rate limit" in error_text.lower():
            raise Exception("Rate limit exceeded. Please try again in a few minutes.")
        else:
            raise Exception(f"API request failed: {str(req_err)}")
    except Exception as e:
        # Handle all other errors
        logging.error(f"OpenRouter API error: {str(e)}")
        raise Exception(f"Failed to generate website: {str(e)}")

def deploy_to_vercel(html_content, vercel_token):
    """
    Deploy the generated HTML to Vercel.
    
    Args:
        html_content (str): The generated HTML content
        vercel_token (str): Vercel API token
        
    Returns:
        str: URL of the deployed website
    """
    try:
        # Vercel API endpoint for creating a new deployment
        api_url = "https://api.vercel.com/v13/deployments"
        
        # Create a simple project structure with index.html
        files = [
            {
                "file": "index.html",
                "data": html_content
            }
        ]
        
        # Prepare the deployment payload
        payload = {
            "name": f"ai-generated-website-{int(time.time())}",
            "files": files,
            "projectSettings": {
                "framework": None,
                "buildCommand": None,
                "outputDirectory": None,
                "rootDirectory": None,
                "nodeVersion": "18.x"
            }
        }
        
        # Make request to Vercel API
        headers = {
            "Authorization": f"Bearer {vercel_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        deployment_url = result.get("url")
        
        if not deployment_url:
            raise Exception("Deployment URL not found in response")
        
        return f"https://{deployment_url}"
    except requests.RequestException as req_err:
        # Handle request-related errors
        error_text = ""
        if hasattr(req_err, 'response') and req_err.response:
            try:
                error_text = req_err.response.text
                error_json = req_err.response.json()
                if 'error' in error_json and 'message' in error_json['error']:
                    error_text = error_json['error']['message']
            except:
                error_text = req_err.response.text if req_err.response.text else "No response text available"
        
        logging.error(f"Vercel API request error: {str(req_err)}")
        logging.error(f"Response: {error_text}")
        
        if "unauthorized" in error_text.lower() or "authentication" in error_text.lower():
            raise Exception("Invalid Vercel API token. Please check your token and try again.")
        else:
            raise Exception(f"Deployment request failed: {error_text}")
    except Exception as e:
        # Handle all other errors
        logging.error(f"Vercel deployment error: {str(e)}")
        raise Exception(f"Failed to deploy website: {str(e)}")

# Add missing import
import time
