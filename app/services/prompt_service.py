from typing import Dict, List, Any, Optional
import re
import json
from sqlalchemy.orm import Session

from app.crud import ai_templates
from app.schemas.ai_templates import UserRequestCreate

class PromptService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_template_prompts(self, template_type: str) -> Dict[str, Any]:
        """Get prompts and placeholders for a specific template type."""
        template_data = ai_templates.get_complete_template(self.db, template_type)
        if not template_data:
            return {
                "success": False,
                "message": f"No template found for type: {template_type}"
            }
        
        return {
            "success": True,
            "message": "Template found",
            "template": template_data["template"],
            "system_prompts": template_data["system_prompts"],
            "user_prompts": template_data["user_prompts"],
            "available_placeholders": template_data["available_placeholders"]
        }
    
    def extract_placeholders(self, user_input: str, template_type: str) -> Dict[str, Any]:
        """Extract placeholder values from user input based on template type."""
        template_data = ai_templates.get_complete_template(self.db, template_type)
        if not template_data:
            return {}
        
        placeholders = template_data["available_placeholders"]
        extracted_data = {}
        
        # Always include the user input as a placeholder
        extracted_data["{{user_input}}"] = user_input
        
        # Extract other placeholders based on some logic
        # This is a simplified version - in a real app, you might use NLP or other techniques
        for placeholder in placeholders:
            key = placeholder["key"]
            if key != "{{user_input}}":  # Skip user_input as we already set it
                # Use default value if provided
                if placeholder["default_value"]:
                    extracted_data[key] = placeholder["default_value"]
                
                # Simple keyword extraction (this is very basic)
                # In a real app, you'd use more sophisticated techniques
                keyword = key.strip("{{}}").lower()
                if keyword in user_input.lower():
                    # Extract a value based on keyword position
                    # This is just a placeholder for real extraction logic
                    words = user_input.lower().split()
                    if keyword in words:
                        idx = words.index(keyword)
                        if idx + 1 < len(words):
                            extracted_data[key] = words[idx + 1]
        
        return extracted_data
    
    def replace_placeholders(self, prompt: str, placeholder_values: Dict[str, Any]) -> str:
        """Replace placeholders in a prompt with actual values."""
        result = prompt
        for key, value in placeholder_values.items():
            result = result.replace(key, str(value))
        return result
    
    def process_user_request(self, user_request: UserRequestCreate) -> Dict[str, Any]:
        """Process a user request by extracting placeholders and resolving prompts."""
        # Get the template
        template = ai_templates.get_template(self.db, user_request.template_id)
        if not template:
            return {
                "success": False,
                "message": f"Template with ID {user_request.template_id} not found"
            }
        
        # Get template data
        template_data = ai_templates.get_complete_template(self.db, template.type)
        if not template_data:
            return {
                "success": False,
                "message": f"Failed to get complete template data for {template.type}"
            }
        
        # Extract placeholders
        extracted_data = self.extract_placeholders(user_request.user_input, template.type)
        
        # Resolve prompts
        resolved_prompts = {
            "system": [],
            "user": []
        }
        
        # Replace placeholders in system prompts
        for prompt in template_data["system_prompts"]:
            resolved_prompt = self.replace_placeholders(prompt, extracted_data)
            resolved_prompts["system"].append(resolved_prompt)
        
        # Replace placeholders in user prompts
        for prompt in template_data["user_prompts"]:
            resolved_prompt = self.replace_placeholders(prompt, extracted_data)
            resolved_prompts["user"].append(resolved_prompt)
        
        # Create user request record
        db_user_request = ai_templates.create_user_request(
            self.db, 
            user_request, 
            extracted_data, 
            resolved_prompts
        )
        
        return {
            "success": True,
            "message": "User request processed successfully",
            "request_id": db_user_request.id,
            "prompts": resolved_prompts,
            "placeholders": extracted_data
        }