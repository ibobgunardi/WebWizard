# WebWizard

WebWizard is an AI-powered website generator that transforms your content into professionally styled websites in minutes.

## Features

- Generate CV/Resume, Landing Page, or Portfolio websites
- Database-driven prompt templates
- Multiple style templates to choose from
- Support for profile photos
- Custom color palettes
- Language detection (English and Indonesian)
- Preview generated websites
- Download as PDF
- Deploy to Vercel

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Jinja2 Templates
- OpenRouter API for AI generation
- Vercel API for deployment

## Project Structure

```
webwizard/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── deploy.py
│   │   │   ├── preview.py
│   │   │   ├── templates.py
│   │   │   └── website.py
│   │   └── api.py
│   ├── core/
│   │   ├── config.py
│   │   └── session.py
│   ├── crud/
│   │   └── ai_templates.py
│   ├── db/
│   │   ├── database.py
│   │   └── init_db.py
│   ├── models/
│   │   └── ai_templates.py
│   ├── schemas/
│   │   ├── ai_templates.py
│   │   └── website.py
│   ├── services/
│   │   ├── prompt_service.py
│   │   └── website_generator.py
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── templates/
│   │   ├── index.html
│   │   └── preview.html
│   ├── utils/
│   │   └── language_detector.py
│   └── main.py
├── logs/
│   ├── ai_responses/
│   └── html_dumps/
├── scripts/
│   └── init_db.py
├── .env
├── docker-compose.yml
├── .gitignore
├── main.py
├── pyproject.toml
└── README.md
```

## Database Schema

The application uses PostgreSQL with the following tables:

1. `ai_request_templates` - Stores different types of website templates
2. `ai_prompt_configs` - Stores prompt configurations for each template
3. `ai_auto_placeholders` - Defines replaceable placeholders
4. `ai_user_requests` - Stores user requests and generated content

## Getting Started

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ibobgunardi/WebWizard.git
   cd WebWizard
   ```

2. Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Install dependencies:
   ```bash
   pip install -e .
   ```

4. Run the application:
   ```bash
   python main.py
   ```

The application will be available at http://localhost:12000.

## Usage

1. Visit the homepage
2. Select a website type (CV, Portfolio, Landing Page)
3. Enter your content
4. Choose style preferences
5. Upload a photo (optional)
6. Generate your website
7. Preview and download the generated HTML

## API Endpoints

- `/api/v1/website/`: Main website generation endpoints
- `/api/v1/preview/`: Preview generated websites
- `/api/v1/deploy/`: Deploy websites to Vercel
- `/api/v1/templates/`: Manage prompt templates

## Environment Variables

Configure the application using the following environment variables in a `.env` file:

```
# Server settings
HOST=0.0.0.0
PORT=12000

# Database settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=webwizard
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webwizard

# Secret key for session
SECRET_KEY=your_secret_key
```

## License

MIT