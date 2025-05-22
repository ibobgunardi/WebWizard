import time
import logging
import requests
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def deploy_to_vercel(html_content: str, vercel_token: str) -> str:
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
        
        logger.error(f"Vercel API request error: {str(req_err)}")
        logger.error(f"Response: {error_text}")
        
        if "unauthorized" in error_text.lower() or "authentication" in error_text.lower():
            raise Exception("Invalid Vercel API token. Please check your token and try again.")
        else:
            raise Exception(f"Deployment request failed: {error_text}")
    except Exception as e:
        # Handle all other errors
        logger.error(f"Vercel deployment error: {str(e)}")
        raise Exception(f"Failed to deploy website: {str(e)}")