# HAIDER AI — REST API Reference Guide

**Base URL:** `/api/v1`  
**Swagger Interactive Docs:** `http://localhost:8000/docs`  
**Developer:** Syed Haider Ali  

---

## 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user account and initialize default settings | No |
| `POST` | `/auth/login` | Authenticate email & password, returns JWT tokens | No |
| `POST` | `/auth/refresh` | Exchange valid refresh token for a new access token | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Bearer JWT |

---

## 2. User & Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `PUT` | `/users/me` | Update full name and email address | Bearer JWT |
| `PUT` | `/users/me/password` | Change user password | Bearer JWT |
| `GET` | `/users/me/stats` | Get usage statistics (chats, messages, docs, tasks) | Bearer JWT |

---

## 3. AI Model & System Settings

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/settings/` | Get current AI settings (API key masked) | Bearer JWT |
| `PUT` | `/settings/` | Update provider, model, base URL, temperature, key | Bearer JWT |
| `POST` | `/settings/test-connection` | Test live connectivity to OpenAI-compatible provider | Bearer JWT |

---

## 4. Conversations & Messaging

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/conversations/` | List user's conversations with search & sorting | Bearer JWT |
| `POST` | `/conversations/` | Create a new conversation thread | Bearer JWT |
| `GET` | `/conversations/{id}` | Get full conversation with message history | Bearer JWT |
| `PUT` | `/conversations/{id}` | Rename or toggle pin on conversation | Bearer JWT |
| `DELETE` | `/conversations/{id}` | Delete conversation and all its messages | Bearer JWT |
| `PUT` | `/messages/{id}` | Edit user message content | Bearer JWT |
| `DELETE` | `/messages/{id}` | Delete a specific message | Bearer JWT |
| `POST` | `/chat/stream` | Server-Sent Events (SSE) streaming chat endpoint | Bearer JWT |

---

## 5. Document Intelligence (RAG)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/documents/upload` | Upload PDF, DOCX, TXT, CSV, XLSX, parse & index | Bearer JWT |
| `GET` | `/documents/` | List all documents owned by user | Bearer JWT |
| `GET` | `/documents/{id}` | Get document metadata and summary | Bearer JWT |
| `DELETE` | `/documents/{id}` | Delete document and remove file from disk | Bearer JWT |
| `POST` | `/documents/query` | Ask context-grounded questions against documents | Bearer JWT |
| `POST` | `/documents/{id}/summary` | Generate executive, key points, or ELI5 summary | Bearer JWT |

---

## 6. Personal Task Management

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/tasks/` | List tasks with status/priority filtering and search | Bearer JWT |
| `POST` | `/tasks/` | Create a single task | Bearer JWT |
| `POST` | `/tasks/batch` | Batch create tasks (for 1-click AI import) | Bearer JWT |
| `GET` | `/tasks/stats` | Get task counts (total, completed, todo, urgent) | Bearer JWT |
| `PUT` | `/tasks/{id}` | Update task title, status, priority, due date | Bearer JWT |
| `DELETE` | `/tasks/{id}` | Delete task | Bearer JWT |

---

## 7. AI Power Tools

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/tools/writing` | Emails, formal letters, reports, social captions | Bearer JWT |
| `POST` | `/tools/summarizer` | Text summarizer, bullet points, TL;DR | Bearer JWT |
| `POST` | `/tools/translator` | Multilingual translator (Urdu & English focus) | Bearer JWT |
| `POST` | `/tools/coding` | Code explain, debug, improve, and generation | Bearer JWT |
| `POST` | `/tools/study` | Topic explanation, interactive MCQs, notes | Bearer JWT |
| `POST` | `/tools/productivity` | Daily planning, project task breakdown | Bearer JWT |
