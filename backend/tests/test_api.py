import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.models.user import User

# Use an in-memory or test sqlite database
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_haider_ai.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["developer"] == "Syed Haider Ali"

        root_res = await client.get("/")
        assert root_res.status_code == 200
        root_data = root_res.json()
        assert root_data["product"] == "HAIDER AI"
        assert root_data["developer"] == "Syed Haider Ali"

@pytest.mark.asyncio
async def test_auth_registration_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register User 1
        reg_payload = {
            "email": "user1@haiderai.com",
            "full_name": "Haider Test User",
            "password": "Password123!"
        }
        reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "user1@haiderai.com"
        assert data["user"]["full_name"] == "Haider Test User"

        # 2. Duplicate registration should fail
        dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert dup_res.status_code == 400

        # 3. Login User 1
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "user1@haiderai.com",
            "password": "Password123!"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        token = login_data["access_token"]
        assert token

        # 4. Access protected route /api/v1/auth/me
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "user1@haiderai.com"

        # 5. Invalid password login should fail
        bad_login = await client.post("/api/v1/auth/login", json={
            "email": "user1@haiderai.com",
            "password": "WrongPassword!"
        })
        assert bad_login.status_code == 401

@pytest.mark.asyncio
async def test_user_settings_and_connection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register User
        await client.post("/api/v1/auth/register", json={
            "email": "settings_user@haiderai.com",
            "full_name": "Settings Tester",
            "password": "Password123!"
        })
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "settings_user@haiderai.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get settings
        get_res = await client.get("/api/v1/settings/", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["api_provider"] == "openai"

        # Update settings
        update_res = await client.put("/api/v1/settings/", headers=headers, json={
            "api_provider": "groq",
            "model_name": "llama-3.3-70b-versatile",
            "temperature": 0.5,
            "theme": "dark"
        })
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["api_provider"] == "groq"
        assert updated["model_name"] == "llama-3.3-70b-versatile"
        assert updated["temperature"] == 0.5

@pytest.mark.asyncio
async def test_tasks_crud_and_user_isolation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register User A
        await client.post("/api/v1/auth/register", json={
            "email": "user_a@haiderai.com",
            "full_name": "User Alpha",
            "password": "Password123!"
        })
        token_a = (await client.post("/api/v1/auth/login", json={
            "email": "user_a@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register User B
        await client.post("/api/v1/auth/register", json={
            "email": "user_b@haiderai.com",
            "full_name": "User Beta",
            "password": "Password123!"
        })
        token_b = (await client.post("/api/v1/auth/login", json={
            "email": "user_b@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A creates a task
        create_task_res = await client.post("/api/v1/tasks/", headers=headers_a, json={
            "title": "Complete AI Architecture",
            "description": "Design modular clean API",
            "priority": "high",
            "status": "todo"
        })
        assert create_task_res.status_code == 201
        task_a = create_task_res.json()
        task_a_id = task_a["id"]

        # User A can list tasks and see it
        tasks_a_list = await client.get("/api/v1/tasks/", headers=headers_a)
        assert len(tasks_a_list.json()) == 1

        # User B lists tasks -> MUST BE EMPTY (User isolation!)
        tasks_b_list = await client.get("/api/v1/tasks/", headers=headers_b)
        assert len(tasks_b_list.json()) == 0

        # User B cannot update User A's task
        hack_update = await client.put(f"/api/v1/tasks/{task_a_id}", headers=headers_b, json={"title": "Hacked"})
        assert hack_update.status_code == 404

        # User A updates the task
        update_res = await client.put(f"/api/v1/tasks/{task_a_id}", headers=headers_a, json={"status": "completed"})
        assert update_res.status_code == 200
        assert update_res.json()["status"] == "completed"

        # Check stats for User A
        stats_res = await client.get("/api/v1/tasks/stats", headers=headers_a)
        assert stats_res.status_code == 200
        assert stats_res.json()["completed"] == 1

@pytest.mark.asyncio
async def test_conversations_and_isolation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login User A
        token_a = (await client.post("/api/v1/auth/login", json={
            "email": "user_a@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Login User B
        token_b = (await client.post("/api/v1/auth/login", json={
            "email": "user_b@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A creates conversation
        conv_res = await client.post("/api/v1/conversations/", headers=headers_a, json={
            "title": "Quantum Computing Exploration"
        })
        assert conv_res.status_code == 201
        conv_id = conv_res.json()["id"]

        # User A gets it
        get_conv = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_a)
        assert get_conv.status_code == 200
        assert get_conv.json()["title"] == "Quantum Computing Exploration"

        # User B tries to get User A's conversation -> 404 Not Found (Data Isolation)
        forbidden_get = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_b)
        assert forbidden_get.status_code == 404
@pytest.mark.asyncio
async def test_document_upload_and_query():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login User A
        token_a = (await client.post("/api/v1/auth/login", json={
            "email": "user_a@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Upload a sample text file
        sample_doc_content = (
            "HAIDER AI Architecture Overview.\n"
            "Developed by Syed Haider Ali, HAIDER AI is an enterprise-grade personal AI assistant.\n"
            "Key features include real-time streaming chat, multimodal RAG, and personal task management.\n"
            "The system uses FastAPI on the backend and React with TypeScript on the frontend."
        )
        files = {
            "file": ("haider_ai_specs.txt", sample_doc_content.encode("utf-8"), "text/plain")
        }
        upload_res = await client.post("/api/v1/documents/upload", headers=headers_a, files=files)
        assert upload_res.status_code == 201
        doc_data = upload_res.json()
        assert doc_data["original_name"] == "haider_ai_specs.txt"
        assert doc_data["status"] == "indexed"
        assert doc_data["chunk_count"] >= 1
        doc_id = doc_data["id"]

        # List documents
        list_res = await client.get("/api/v1/documents/", headers=headers_a)
        assert list_res.status_code == 200
        docs = list_res.json()
        assert any(d["id"] == doc_id for d in docs)

        # Query document
        query_res = await client.post("/api/v1/documents/query", headers=headers_a, json={
            "document_ids": [doc_id],
            "query": "Who developed HAIDER AI and what are its key features?"
        })
        assert query_res.status_code == 200
        q_data = query_res.json()
        assert "answer" in q_data
        assert len(q_data["relevant_chunks"]) >= 1

@pytest.mark.asyncio
async def test_ai_tools_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a = (await client.post("/api/v1/auth/login", json={
            "email": "user_a@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 1. Writing Tool
        w_res = await client.post("/api/v1/tools/writing", headers=headers_a, json={
            "category": "email",
            "topic_or_content": "Project status update for Q4 release",
            "tone": "professional",
            "audience": "Executives"
        })
        assert w_res.status_code == 200
        assert "result" in w_res.json()

        # 2. Summarizer Tool
        s_res = await client.post("/api/v1/tools/summarizer", headers=headers_a, json={
            "content": "Artificial intelligence systems have undergone rapid transformation from rule-based engines to generative architectures.",
            "summary_type": "bullet_points"
        })
        assert s_res.status_code == 200
        assert "result" in s_res.json()

        # 3. Translator Tool
        t_res = await client.post("/api/v1/tools/translator", headers=headers_a, json={
            "text": "Welcome to HAIDER AI, your intelligent assistant.",
            "target_language": "Urdu",
            "source_language": "English"
        })
        assert t_res.status_code == 200
        assert "result" in t_res.json()

        # 4. Coding Tool
        c_res = await client.post("/api/v1/tools/coding", headers=headers_a, json={
            "action": "explain",
            "code_or_prompt": "def fib(n):\n    return n if n <= 1 else fib(n-1) + fib(n-2)",
            "language": "python"
        })
        assert c_res.status_code == 200
        assert "result" in c_res.json()

        # 5. Study Tool
        study_res = await client.post("/api/v1/tools/study", headers=headers_a, json={
            "action": "explain_topic",
            "topic": "Newton's laws of motion",
            "difficulty_level": "beginner"
        })
        assert study_res.status_code == 200
        assert "result" in study_res.json()

        # 6. Productivity Tool
        p_res = await client.post("/api/v1/tools/productivity", headers=headers_a, json={
            "action": "breakdown_project",
            "goals_or_project": "Launch personal portfolio website",
            "available_hours": 6.0
        })
        assert p_res.status_code == 200
        assert "result" in p_res.json()

@pytest.mark.asyncio
async def test_connection_test_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token_a = (await client.post("/api/v1/auth/login", json={
            "email": "user_a@haiderai.com",
            "password": "Password123!"
        })).json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Test with invalid unreachable endpoint - must handle gracefully without crashing
        test_res = await client.post("/api/v1/settings/test-connection", headers=headers_a, json={
            "api_provider": "custom",
            "api_base_url": "http://127.0.0.1:9999/v1",
            "model_name": "dummy-model",
            "api_key": "dummy-key"
        })
        assert test_res.status_code == 200
        data = test_res.json()
        assert data["success"] is False
        assert "Could not connect" in data["message"] or "failed" in data["message"].lower()
