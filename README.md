# ATS Resume Optimizer

AI-powered resume optimizer that analyzes your resume against any job description through a 6-stage pipeline and generates a fully rewritten, ATS-optimized resume you can download as .DOC or PDF.

![ATS Resume Optimizer](https://img.shields.io/badge/AI-Resume_Optimizer-6c5ce7?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![n8n](https://img.shields.io/badge/n8n-Automation-EA4B71?style=flat-square&logo=n8n)

## Features

- **Drag & Drop** resume upload (PDF/DOCX)
- **6-Stage AI Pipeline** powered by n8n + OpenAI
- **ATS Score** with detailed breakdown
- **Keyword Gap Analysis** — matched vs missing
- **Bullet Point Optimizer** — before/after comparisons
- **Full Resume Rewrite** — download as .DOC, PDF, or HTML
- **Dark UI** with professional design

## 6-Stage AI Pipeline

| Stage | Description |
|-------|-------------|
| 1. JD Analyzer | Extracts skills, tools, certs, action verbs from job description |
| 2. Synonym Generator | Creates ATS-recognized keyword variations |
| 3. ATS Match Scorer | Scores resume vs JD on keywords, skills, experience, formatting |
| 4. Bullet Optimizer | Rewrites every bullet with ATS keywords + quantified metrics |
| 5. Final Plan | Optimized summary, skills reorganization, priority action items |
| 6. Resume Generator | Fully rewrites the complete resume as downloadable .DOC/.PDF |

## Quick Start

### Frontend

```bash
git clone https://github.com/YOUR_USERNAME/ats-resume-optimizer.git
cd ats-resume-optimizer
npm install
npm run dev
```

Open `http://localhost:5173`

### Backend (n8n)

1. Install [n8n](https://n8n.io/) locally or use n8n cloud
2. Import `n8n/workflow.json` into n8n
3. Set up OpenAI API credentials in n8n
4. See `n8n/setup-guide.md` for detailed node configuration
5. Activate the workflow

### Connect

Paste your n8n webhook URL into the frontend's webhook field:
- Test: `http://localhost:5678/webhook-test/resume-optimizer`
- Production: `http://localhost:5678/webhook/resume-optimizer`

## Project Structure

```
ats-resume-optimizer/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Entry point
├── n8n/
│   ├── workflow.json         # n8n workflow (Stages 1-5)
│   ├── setup-guide.md        # Manual setup guide with all prompts
│   └── stage6-guide.md       # Stage 6 resume generation guide
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** n8n (workflow automation)
- **AI:** OpenAI GPT-4o / GPT-4o-mini
- **Styling:** Custom CSS (no frameworks)

## Deploy

### Netlify / Vercel

```bash
npm run build
# Deploy the dist/ folder
```

### Important

When deploying to a public URL (Netlify, Vercel), your n8n instance must also be publicly accessible. Options:
- Use [ngrok](https://ngrok.com/) to tunnel localhost
- Host n8n on a cloud server
- Use n8n Cloud

## License

MIT
