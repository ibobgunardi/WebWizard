# WebWizard

WebWizard is an AI-powered website generator that transforms your content into professionally styled websites in minutes.

## Features

- Generate CV/Resume, Landing Page, or Portfolio websites
- Multiple style templates to choose from
- Support for profile photos
- Custom color palettes
- Language detection (English and Indonesian)
- Preview generated websites
- Download as PDF
- Deploy to Vercel

## Tech Stack

- FastAPI
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
│   │   │   └── website.py
│   │   └── api.py
│   ├── core/
│   │   ├── config.py
│   │   └── session.py
│   ├── db/
│   ├── models/
│   ├── schemas/
│   │   └── website.py
│   ├── services/
│   │   ├── deployment.py
│   │   └── website_generator.py
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   ├── templates/
│   │   ├── index.html
│   │   └── preview.html
│   ├── utils/
│   │   └── language_detector.py
│   └── main.py
├── logs/
│   ├── ai_responses/
│   └── html_dumps/
├── .gitignore
├── main.py
├── pyproject.toml
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   pip install -e .
   ```
3. Run the application:
   ```
   python main.py
   ```
4. Open your browser and navigate to `http://localhost:12000`

## API Endpoints

- `GET /`: Main page
- `POST /api/v1/website/generate`: Generate a website
- `GET /api/v1/preview`: Preview the generated website
- `GET /api/v1/preview/download-pdf`: Download the website as PDF
- `POST /api/v1/deploy/vercel`: Deploy the website to Vercel

## Environment Variables

- `SECRET_KEY`: Secret key for session encryption
- `PORT`: Port to run the application (default: 12000)

## License

MIT