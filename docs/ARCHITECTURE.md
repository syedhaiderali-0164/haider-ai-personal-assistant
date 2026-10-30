# HAIDER AI — Architecture & System Design

**Developer:** Syed Haider Ali  
**GitHub:** [syedhaiderali-0164](https://github.com/syedhaiderali-0164)  
**LinkedIn:** [Syed Haider Ali](https://www.linkedin.com/in/haider-ali-1447bb3a/)  
**Product:** HAIDER AI — Your Intelligent Personal AI Assistant  

---

## 1. High-Level Architectural Overview

HAIDER AI is architected as a modular, decoupled full-stack platform designed for ultra-low latency, strict tenant privacy, and multi-model flexibility:

```
┌─────────────────────────────────────────────────────────────┐
│                 REACT 19 + TYPESCRIPT CLIENT                │
│    Landing • Dashboard • Chat • Docs • Voice • Tools • Tasks│
└──────────────────────────────┬──────────────────────────────┘
                               │  HTTPS / SSE (Streaming)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FASTAPI GATEWAY                         │
│   • CORS & JWT Authentication                               │
│   • Multi-Tenant User Isolation Guard                       │
│   • Server-Sent Events (SSE) Stream Controller              │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    DATABASE & VECTOR STORE   │ │       AI ENGINE LAYER       │
│ • Users & UserSettings       │ │ • OpenAI-compatible Client  │
│ • Conversations & Messages   │ │ • Groq / OpenRouter Presets │
│ • Document & DocumentChunks  │ │ • Local Ollama Connectivity │
│ • Personal Tasks & AI Logs   │ │ • RAG Vector Search & Rank  │
│ • PostgreSQL / SQLite Fallback│ └─────────────────────────────┘
└──────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Real-Time Streaming Chat (SSE)
- When a user submits a prompt, FastAPI initiates a `StreamingResponse` using `text/event-stream`.
- Tokens are yielded in real-time as JSON chunks: `data: {"content": "token"}\n\n`.
- The React client consumes chunks using `ReadableStream` and `TextDecoder`, giving instant word-by-word UI feedback.
- On stream completion, the full assistant response is stored in the database, updating conversation metrics and logging latency.

### B. Document Intelligence (RAG Engine)
- **Supported Formats:** PDF (`pypdf`), Word DOCX (`python-docx`), Excel XLSX (`openpyxl`), CSV, TXT.
- **Processing Pipeline:**
  1. File integrity and MIME validation (max 25MB).
  2. Text extraction across pages, tables, and sheets.
  3. Recursive paragraph and sentence chunking with configurable overlap (~1000 characters per chunk, 150 overlap).
  4. Vector indexing and cosine similarity calculation.
  5. Top-k chunk retrieval for question answering and executive summarization.
  6. Strict user data isolation: all document queries are constrained to the authenticated user's ID.

### C. Voice Interaction Subsystem
- Utilizes the W3C Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) for low-latency microphone transcription.
- Seamlessly submits voice transcripts to the AI backend.
- Renders responses using `SpeechSynthesisUtterance` with adjustable voice speed and mute controls.
- Displays an animated audio soundwave and pulsing glowing orb.

### D. Security & Data Isolation
- **Authentication:** Password hashing with bcrypt. Bearer JWT access and refresh tokens.
- **Credential Storage:** User-configured API keys are securely stored server-side and masked (`sk-••••89`) when retrieved by the client. Keys are never exposed in browser localStorage, query parameters, or client-side JavaScript.
- **Resource Ownership:** Every database query filters by `user_id == current_user.id`, ensuring complete multi-tenant isolation.

