import os
import json
import logging
import requests
from datetime import datetime
from typing import Optional, Dict, Any, Union
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.services.prompt_service import PromptService
from app.schemas.ai_templates import UserRequestCreate

logger = logging.getLogger(__name__)

def generate_website(
    website_type: str, 
    content: str, 
    style: str, 
    language: str, 
    api_token: str, 
    color_palette: Optional[Union[str, Dict[str, str]]] = None, 
    photo_data: Optional[str] = None
) -> str:
    """
    Generate website HTML using OpenRouter API.
    
    Args:
        website_type (str): Type of website (CV, landing page, portfolio)
        content (str): User's content to transform
        style (str): Selected style template
        language (str): Detected language ('id' or 'en')
        api_token (str): OpenRouter API token
        color_palette (dict or str, optional): Color palette to use for the website
        photo_data (str, optional): Base64 encoded photo data
        
    Returns:
        str: Generated HTML content
    """
    # OpenRouter API endpoint
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Create DB session
    db = SessionLocal()
    try:
        # Get prompts from database
        prompt_service = PromptService(db)
        template_data = prompt_service.get_template_prompts(website_type)
        
        if not template_data["success"]:
            # Fallback to hardcoded prompts if template not found
            logger.warning(f"Template not found for type: {website_type}. Using fallback prompts.")
            return generate_website_fallback(
                website_type, content, style, language, api_token, color_palette, photo_data
            )
        
        # Extract placeholders
        placeholder_values = {
            "{{user_input}}": content,
            "{{style}}": style,
            "{{language}}": language
        }
        
        # Parse color palette if provided as JSON string
        colors = None
        if color_palette:
            if isinstance(color_palette, str):
                try:
                    colors = json.loads(color_palette)
                    placeholder_values["{{color}}"] = colors.get('primary', '#007bff')
                except json.JSONDecodeError:
                    logger.warning("Failed to parse color palette JSON")
                    placeholder_values["{{color}}"] = "#007bff"
            else:
                placeholder_values["{{color}}"] = colors.get('primary', '#007bff')
        
        # Add photo placeholder if provided
        if photo_data:
            placeholder_values["{{photo}}"] = f"data:image/jpeg;base64,{photo_data}"
        
        # Replace placeholders in system prompts
        system_prompts = []
        for prompt in template_data["system_prompts"]:
            resolved_prompt = prompt_service.replace_placeholders(prompt, placeholder_values)
            system_prompts.append(resolved_prompt)
        
        # Replace placeholders in user prompts
        user_prompts = []
        for prompt in template_data["user_prompts"]:
            resolved_prompt = prompt_service.replace_placeholders(prompt, placeholder_values)
            user_prompts.append(resolved_prompt)
        
        # Create messages array for API request
        messages = []
        
        # Add system prompts
        for prompt in system_prompts:
            messages.append({"role": "system", "content": prompt})
        
        # Add user prompts
        for prompt in user_prompts:
            messages.append({"role": "user", "content": prompt})
        
        # If no prompts were found, use a fallback
        if not messages:
            logger.warning("No prompts found in database. Using fallback.")
            return generate_website_fallback(
                website_type, content, style, language, api_token, color_palette, photo_data
            )
        
        # Make request to OpenRouter API
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "nousresearch/deephermes-3-mistral-24b-preview:free",  # Using a free model from OpenRouters
            "messages": messages,
            "max_tokens": 4000,
            "temperature": 0.7
        }
        
        # Create user request record in database
        user_request = UserRequestCreate(
            template_id=template_data["template"].id,
            user_input=content
        )
        
        # Process the request and store in database
        request_result = prompt_service.process_user_request(user_request)
        
        # Make API request
        response = requests.post(api_url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        # Log the AI response
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        ai_response_path = f"logs/ai_responses/response_{timestamp}.json"
        os.makedirs(os.path.dirname(ai_response_path), exist_ok=True)
        with open(ai_response_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Check if we have choices in the response
        if 'choices' not in result or not result['choices'] or 'message' not in result['choices'][0]:
            error_msg = "API response did not contain expected data structure"
            logger.error(f"OpenRouter API error: {error_msg}")
            logger.error(f"Response: {result}")
            raise Exception(error_msg)
            
        html_content = result["choices"][0]["message"]["content"]
        
        # Clean up the response if needed (remove any markdown code block markers)
        html_content = html_content.replace("```html", "").replace("```", "").strip()
        
        # Process photo data if provided
        if photo_data:
            # Check if the AI included the placeholder
            if 'id="profile-photo-placeholder"' in html_content:
                # Replace the placeholder with the actual image
                html_content = html_content.replace(
                    'id="profile-photo-placeholder"', 
                    f'id="profile-photo" src="data:image/jpeg;base64,{photo_data}"'
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
                img_tag = f'<img src="data:image/jpeg;base64,{photo_data}" alt="Profile Photo" class="profile-photo" style="max-width: 300px; border-radius: 8px; margin: 20px auto; display: block;">'
                
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
        
        # Log the generated HTML
        html_dump_path = f"logs/html_dumps/html_{timestamp}.html"
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
        
        logger.error(f"OpenRouter API request error: {str(req_err)}")
        logger.error(f"Response: {error_text}")
        
        if "rate limit" in error_text.lower():
            raise Exception("Rate limit exceeded. Please try again in a few minutes.")
        else:
            raise Exception(f"API request failed: {str(req_err)}")
    except Exception as e:
        # Handle all other errors
        logger.error(f"OpenRouter API error: {str(e)}")
        raise Exception(f"Failed to generate website: {str(e)}")
    finally:
        db.close()

def generate_website_fallback(
    website_type: str, 
    content: str, 
    style: str, 
    language: str, 
    api_token: str, 
    color_palette: Optional[Union[str, Dict[str, str]]] = None, 
    photo_data: Optional[str] = None
) -> str:
    """Fallback method using hardcoded prompts if database prompts are not available."""
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
                logger.warning("Failed to parse color palette JSON")
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
        ai_response_path = f"logs/ai_responses/response_{timestamp}.json"
        os.makedirs(os.path.dirname(ai_response_path), exist_ok=True)
        with open(ai_response_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Check if we have choices in the response
        if 'choices' not in result or not result['choices'] or 'message' not in result['choices'][0]:
            error_msg = "API response did not contain expected data structure"
            logger.error(f"OpenRouter API error: {error_msg}")
            logger.error(f"Response: {result}")
            raise Exception(error_msg)
            
        html_content = result["choices"][0]["message"]["content"]
        
        # Clean up the response if needed (remove any markdown code block markers)
        html_content = html_content.replace("```html", "").replace("```", "").strip()
        
        # Process photo data if provided
        if photo_data:
            # Check if the AI included the placeholder
            if 'id="profile-photo-placeholder"' in html_content:
                # Replace the placeholder with the actual image
                html_content = html_content.replace(
                    'id="profile-photo-placeholder"', 
                    f'id="profile-photo" src="data:image/jpeg;base64,{photo_data}"'
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
                img_tag = f'<img src="data:image/jpeg;base64,{photo_data}" alt="Profile Photo" class="profile-photo" style="max-width: 300px; border-radius: 8px; margin: 20px auto; display: block;">'
                
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
        
        # Log the generated HTML
        html_dump_path = f"logs/html_dumps/html_{timestamp}.html"
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
        
        logger.error(f"OpenRouter API request error: {str(req_err)}")
        logger.error(f"Response: {error_text}")
        
        if "rate limit" in error_text.lower():
            raise Exception("Rate limit exceeded. Please try again in a few minutes.")
        else:
            raise Exception(f"API request failed: {str(req_err)}")
    except Exception as e:
        # Handle all other errors
        logger.error(f"OpenRouter API error: {str(e)}")
        raise Exception(f"Failed to generate website: {str(e)}")