import logging
from langdetect import detect

logger = logging.getLogger(__name__)

def detect_language(text: str) -> str:
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
        logger.error(f"Language detection error: {str(e)}")
        # Default to English if detection fails
        return 'en'