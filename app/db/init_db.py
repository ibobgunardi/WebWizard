import logging
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine
from app.models.ai_templates import (
    AIRequestTemplate, 
    AIPromptConfig, 
    AIAutoPlaceholder, 
    AIUserRequest,
    PromptRole,
    PlaceholderScope,
    Base
)

logger = logging.getLogger(__name__)

# Sample data for initialization
TEMPLATES = [
    {
        "type": "cv",
        "name": "Modern HTML Resume Builder",
        "description": "Creates a modern, responsive HTML resume",
        "category": "frontend",
        "is_active": True
    },
    {
        "type": "portfolio",
        "name": "Creative Portfolio Generator",
        "description": "Builds a stunning portfolio website",
        "category": "frontend",
        "is_active": True
    },
    {
        "type": "landing_page",
        "name": "Business Landing Page",
        "description": "Professional landing page for businesses",
        "category": "frontend",
        "is_active": True
    }
]

PROMPT_CONFIGS = [
    # CV System Prompt
    {
        "template_type": "cv",
        "role": PromptRole.SYSTEM,
        "sequence_order": 1,
        "prompt_content": "You are an expert frontend engineer and UI/UX designer specializing in creating modern, responsive HTML resumes. Create clean, professional, and visually appealing resume layouts using HTML, CSS, and minimal JavaScript. Focus on: 1) Modern design principles 2) Mobile responsiveness 3) Clean typography 4) Professional color schemes 5) Proper semantic HTML structure. Always include CSS animations and micro-interactions to make the resume stand out."
    },
    # CV User Prompt
    {
        "template_type": "cv",
        "role": PromptRole.USER,
        "sequence_order": 1,
        "prompt_content": """Create a modern HTML resume based on this user request: "{{user_input}}"

Design the resume with these specifications:
- Use {{color}} as the primary color scheme
- Apply {{style}} design style  
- Include a professional photo placeholder: {{photo}}
- Make it fully responsive and modern
- Add smooth animations and micro-interactions
- Ensure accessibility and print-friendly version

The user input contains all the personal and professional information needed. Extract and organize it properly into a beautiful, professional resume layout."""
    },
    # Portfolio System Prompt
    {
        "template_type": "portfolio",
        "role": PromptRole.SYSTEM,
        "sequence_order": 1,
        "prompt_content": "You are an expert web designer specializing in creating stunning, creative portfolio websites. Focus on: 1) Visual impact and creativity 2) Showcase-focused layouts 3) Interactive elements 4) Mobile responsiveness 5) Fast loading times."
    },
    # Portfolio User Prompt
    {
        "template_type": "portfolio",
        "role": PromptRole.USER,
        "sequence_order": 1,
        "prompt_content": """Create a creative portfolio website based on this user request: "{{user_input}}"

Design specifications:
- Use {{color}} as the primary color palette
- Apply {{style}} design aesthetic
- Include a professional photo: {{photo}}
- Make it fully responsive with smooth animations
- Focus on showcasing work/projects effectively

Extract all relevant information from the user input and create a visually stunning portfolio that highlights their skills and work."""
    },
    # Landing Page System Prompt
    {
        "template_type": "landing_page",
        "role": PromptRole.SYSTEM,
        "sequence_order": 1,
        "prompt_content": "You are an expert web designer specializing in creating high-converting, professional landing pages. Focus on: 1) Clear value proposition 2) Compelling call-to-action 3) Professional design 4) Mobile responsiveness 5) Fast loading times."
    },
    # Landing Page User Prompt
    {
        "template_type": "landing_page",
        "role": PromptRole.USER,
        "sequence_order": 1,
        "prompt_content": """Create a professional landing page based on this user request: "{{user_input}}"

Design specifications:
- Use {{color}} as the primary color palette
- Apply {{style}} design aesthetic
- Include clear call-to-action buttons
- Make it fully responsive with smooth animations
- Focus on converting visitors to customers

Extract all relevant information from the user input and create a professional landing page that effectively communicates the value proposition."""
    }
]

PLACEHOLDERS = [
    # Global placeholders
    {
        "placeholder_key": "{{color}}",
        "placeholder_label": "Color Scheme",
        "scope": PlaceholderScope.GLOBAL,
        "applicable_types": None,
        "default_value": "#007bff",
        "detection_priority": 10,
        "description": "Primary color extracted from user preferences or default professional blue"
    },
    {
        "placeholder_key": "{{style}}",
        "placeholder_label": "Design Style",
        "scope": PlaceholderScope.GLOBAL,
        "applicable_types": None,
        "default_value": "modern",
        "detection_priority": 8,
        "description": "Design style preference extracted from user input or default to modern"
    },
    {
        "placeholder_key": "{{theme}}",
        "placeholder_label": "Theme",
        "scope": PlaceholderScope.GLOBAL,
        "applicable_types": None,
        "default_value": "professional",
        "detection_priority": 7,
        "description": "Overall theme/aesthetic preference"
    },
    {
        "placeholder_key": "{{font}}",
        "placeholder_label": "Font Family",
        "scope": PlaceholderScope.GLOBAL,
        "applicable_types": None,
        "default_value": "Inter",
        "detection_priority": 6,
        "description": "Typography preference extracted or default"
    },
    {
        "placeholder_key": "{{user_input}}",
        "placeholder_label": "User Input",
        "scope": PlaceholderScope.GLOBAL,
        "applicable_types": None,
        "default_value": "",
        "detection_priority": 100,
        "description": "The raw user input text"
    },
    # Type-specific placeholders
    {
        "placeholder_key": "{{photo}}",
        "placeholder_label": "Profile Photo",
        "scope": PlaceholderScope.TYPE_SPECIFIC,
        "applicable_types": ["cv", "portfolio"],
        "default_value": "/api/placeholder/150/150",
        "detection_priority": 15,
        "description": "Profile photo for CV or portfolio - placeholder if not provided"
    },
    {
        "placeholder_key": "{{resume_format}}",
        "placeholder_label": "Resume Format",
        "scope": PlaceholderScope.TYPE_SPECIFIC,
        "applicable_types": ["cv"],
        "default_value": "chronological",
        "detection_priority": 5,
        "description": "Resume format preference extracted from user input"
    },
    {
        "placeholder_key": "{{portfolio_gallery}}",
        "placeholder_label": "Portfolio Gallery",
        "scope": PlaceholderScope.TYPE_SPECIFIC,
        "applicable_types": ["portfolio"],
        "default_value": "[]",
        "detection_priority": 12,
        "description": "Gallery images for portfolio showcase"
    },
    {
        "placeholder_key": "{{cta_text}}",
        "placeholder_label": "Call to Action",
        "scope": PlaceholderScope.TYPE_SPECIFIC,
        "applicable_types": ["landing_page"],
        "default_value": "Get Started",
        "detection_priority": 9,
        "description": "CTA button text for landing pages"
    }
]

def init_db(db: Session) -> None:
    """Initialize the database with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have data
    existing_templates = db.query(AIRequestTemplate).count()
    if existing_templates > 0:
        logger.info("Database already contains data. Skipping initialization.")
        return
    
    # Add templates
    template_map = {}
    for template_data in TEMPLATES:
        template = AIRequestTemplate(**template_data)
        db.add(template)
        db.flush()
        template_map[template.type] = template.id
    
    # Add prompt configs
    for prompt_data in PROMPT_CONFIGS:
        template_type = prompt_data.pop("template_type")
        template_id = template_map.get(template_type)
        if template_id:
            prompt = AIPromptConfig(template_id=template_id, **prompt_data)
            db.add(prompt)
    
    # Add placeholders
    for placeholder_data in PLACEHOLDERS:
        # Convert applicable_types to JSON if needed
        if placeholder_data["applicable_types"] is not None:
            placeholder_data["applicable_types"] = placeholder_data["applicable_types"]
        placeholder = AIAutoPlaceholder(**placeholder_data)
        db.add(placeholder)
    
    # Commit all changes
    db.commit()
    logger.info("Database initialized with sample data.")

def main() -> None:
    """Main function to initialize the database."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Creating initial data")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    logger.info("Initial data created")

if __name__ == "__main__":
    main()