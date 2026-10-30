# HAIDER AI — Advanced Personal AI Assistant

<div align="center">

![HAIDER AI Banner](https://img.shields.io/badge/HAIDER%20AI-Intelligent%20Personal%20Assistant-06b6d4?style=for-the-badge&logo=openai&logoColor=white)

**Your Intelligent Personal AI Assistant**

[![Developed By](https://img.shields.io/badge/Developed%20By-Syed%20Haider%20Ali-0284c7?style=flat-square&logo=github)](https://github.com/syedhaiderali-0164)
[![GitHub](https://img.shields.io/badge/GitHub-syedhaiderali--0164-181717?style=flat-square&logo=github)](https://github.com/syedhaiderali-0164)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Haider%20Ali-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/haider-ali-1447bb3a/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

## 🌟 Executive Overview

**HAIDER AI** is a production-grade, commercial-quality AI Personal Assistant engineered from the ground up by **Syed Haider Ali**. Unlike simple UI mockups or API wrappers, HAIDER AI is a complete full-stack enterprise SaaS platform providing real-time Server-Sent Events (SSE) token streaming, multimodal Document Intelligence (RAG) for PDFs, DOCX, XLSX, and CSV files, continuous bidirectional voice interactions, six specialized AI productivity power tools, persistent task management, and rigorous multi-tenant data isolation.

---

## 🚀 Key Capabilities

### 1. 💬 Real-Time Streaming AI Chat
- **Ultra-low latency SSE token streaming:** Generates responses in real-time word-by-word.
- **Rich Markdown & Code Rendering:** GitHub Flavored Markdown, syntax highlighting, copy-to-clipboard, and tables.
- **Message Lifecycle Controls:** Edit prompt to regenerate, copy response, regenerate, delete message, and stop generation.
- **Persistent Conversation Management:** Auto-titling from context, pin favorites, search history, and delete.

### 2. 📄 Multimodal Document Intelligence (RAG)
- **Supported Formats:** PDF, Word DOCX, Excel XLSX, CSV, and plain text.
- **Automated Ingestion Pipeline:** Sanitization, text extraction, recursive semantic chunking, and vector indexing.
- **Context-Augmented Q&A:** Grounded answers referencing retrieved excerpts with similarity ranking.
- **Executive Summarizer:** 1-Click summaries (Executive, Key Takeaways, ELI5, or Comprehensive).

### 3. 🎙️ Interactive Voice Assistant
- **Continuous Speech Recognition:** Hands-free voice input using browser Web Speech API.
- **Speech Synthesis Playback:** Spoken AI audio with adjustable voice speed and mute toggle.
- **Soundwave Visualizer:** Live pulsing sound orb and transcript log.

### 4. ⚡ Specialized AI Power Tools
- **AI Writing Assistant:** Emails, formal business letters, executive reports, viral social captions, and content rewriting.
- **AI Summarizer:** Long-form article and transcript condenser with multiple output formats.
- **Multilingual Translator:** Nuanced translations with dedicated Urdu (اردو) and English bidirectional support.
- **AI Coding Assistant:** Deep code explanation, automated bug fixing, refactoring, and generation.
- **AI Study Assistant:** Concept breakdowns, interactive MCQ practice quizzes with real-time grading, and flashcards.
- **AI Productivity Assistant:** Time-boxed project breakdowns into actionable subtasks with **1-Click Import into the Task Manager**.

### 5. 📋 Personal Task Management Hub
- Full CRUD productivity suite with priority levels (Urgent, High, Medium, Low), statuses, due dates, and tags.
- Productivity metrics dashboard and real-time status counters.
- 1-Click integration with the AI Productivity Assistant.

### 6. ⚙️ AI Models & System Settings
- Support for any OpenAI-compatible provider: **OpenAI**, **Groq**, **OpenRouter**, **Local Ollama**, or custom vLLM.
- **Live Connection Test Probe:** Tests endpoint connectivity, reports latency in milliseconds, and validates model name.
- Server-side encrypted API key storage (keys are masked and never exposed to the client).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, React Markdown |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), HTTPX, Passlib |
| **Database** | PostgreSQL with Alembic Migrations (Seamless SQLite fallback for local development) |
| **Document Processing** | PyPDF, python-docx, openpyxl, vector cosine similarity |
| **Security** | Password hashing (bcrypt), JWT access & refresh tokens, strict tenant boundary enforcement |
| **DevOps** | Docker, Docker Compose, Nginx reverse proxy |

---

## 🏗️ Project Architecture

```
haider-ai-personal-assistant/
├── frontend/                     # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, TopHeader, MarkdownRenderer, SocialIcons
│   │   ├── context/              # AuthContext, ThemeContext, ToastContext
│   │   ├── layouts/              # PublicLayout, DashboardLayout
│   │   ├── pages/                # 13 Dedicated SaaS Pages
│   │   ├── services/             # API client, Auth, Chat, Docs, Tasks, Settings, Tools
│   │   └── types/                # TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Python FastAPI REST API & AI Engine
│   ├── alembic/                  # Database migration versions
│   ├── app/
│   │   ├── api/v1/endpoints/     # Auth, Users, Chat, Docs, Tasks, Settings, Tools, Voice
│   │   ├── core/                 # Config, Database engine, Security & JWT
│   │   ├── models/               # SQLAlchemy models (User, Conv, Msg, Doc, Task, Settings)
│   │   ├── schemas/              # Pydantic v2 request/response models
│   │   ├── services/             # AIService, RAGService, VoiceService
│   │   └── main.py               # FastAPI application entry point
│   ├── tests/                    # Pytest integration & unit test suite
│   ├── alembic.ini
│   └── requirements.txt
├── docs/                         # Architecture, API Reference, Deployment Guides
├── docker-compose.yml            # Multi-container orchestration (DB, API, Frontend)
├── .env.example                  # Environment configuration template
├── .gitignore                    # Comprehensive exclusion rules
└── README.md                     # Flagship project documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node 22/24 recommended) & npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/syedhaiderali-0164/haider-ai-personal-assistant.git
cd haider-ai-personal-assistant
```

### 2. Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` with Swagger documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🧪 Running the Test Suite

The backend includes a comprehensive `pytest` test suite verifying authentication, password security, conversation lifecycle, user data isolation, document RAG, and AI tool endpoints:

```bash
# From workspace root with virtual environment activated:
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest backend\tests -v
```

To verify the frontend TypeScript and production bundles:
```bash
cd frontend
npm run build
```

---

## 🐳 Running with Docker

Run the entire full-stack application (PostgreSQL + FastAPI + React Nginx) with a single command:

```bash
docker-compose up --build -d
```

- **Frontend:** `http://localhost:80`
- **Backend API:** `http://localhost:8000`
- **PostgreSQL:** `localhost:5432`

---

## 🔒 Security Best Practices

- **Zero Secret Exposure:** API keys and passwords are never exposed in frontend code, URL params, or browser storage.
- **Tenant Isolation:** Every database query filters by `user_id == current_user.id` to guarantee absolute data privacy.
- **File Validation:** Uploads are strictly validated by extension (PDF, DOCX, XLSX, CSV, TXT) and capped at 25MB. Files are never executed.
- **Password Protection:** Cryptographic hashing with bcrypt and salted iterations.

---

## 👨‍💻 Developer & Portfolio Attribution

**Developed by Syed Haider Ali**

- **GitHub:** [https://github.com/syedhaiderali-0164](https://github.com/syedhaiderali-0164)
- **LinkedIn:** [https://www.linkedin.com/in/haider-ali-1447bb3a/](https://www.linkedin.com/in/haider-ali-1447bb3a/)
- **Repository:** `haider-ai-personal-assistant`

*HAIDER AI is an original software application developed for modern high-performance AI personal assistance.*

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
