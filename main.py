import uvicorn
import logging
from app.core.config import settings
from app.db.init_db import init_db
from app.db.database import SessionLocal

logger = logging.getLogger(__name__)

def init():
    """Initialize the database with sample data."""
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

if __name__ == "__main__":
    # Initialize logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize database
    logger.info("Initializing database...")
    init()
    logger.info("Database initialized.")
    
    # Run the application
    uvicorn.run(
        "app.main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True,
        log_level="info"
    )
