import json
import time
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.models.settings import UserSettings

class AIService:
    @staticmethod
    def get_effective_config(user_settings: Optional[UserSettings] = None) -> Dict[str, Any]:
        """
        Derives the effective AI provider, base URL, model, and API key.
        Checks user-specific settings first, then falls back to server env settings.
        """
        api_provider = (user_settings.api_provider if user_settings and user_settings.api_provider else settings.DEFAULT_AI_PROVIDER).lower()
        api_base_url = user_settings.api_base_url if user_settings and user_settings.api_base_url else settings.DEFAULT_AI_BASE_URL
        model_name = user_settings.model_name if user_settings and user_settings.model_name else settings.DEFAULT_AI_MODEL
        temperature = user_settings.temperature if user_settings and user_settings.temperature is not None else 0.7
        max_tokens = user_settings.max_tokens if user_settings and user_settings.max_tokens else 2048
        
        # API Key lookup
        api_key = ""
        if user_settings and user_settings.api_key_encrypted:
            api_key = user_settings.api_key_encrypted
        elif settings.DEFAULT_AI_API_KEY:
            api_key = settings.DEFAULT_AI_API_KEY
            
        # Standardize base URL
        api_base_url = api_base_url.rstrip("/")
        
        return {
            "provider": api_provider,
            "base_url": api_base_url,
            "model": model_name,
            "api_key": api_key,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

    @staticmethod
    async def test_connection(
        api_provider: str,
        api_base_url: str,
        model_name: str,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends a test prompt to the specified OpenAI-compatible endpoint to verify connectivity.
        """
        clean_url = api_base_url.rstrip("/")
        endpoint = f"{clean_url}/chat/completions"
        
        headers = {
            "Content-Type": "application/json"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            
        payload = {
            "model": model_name,
            "messages": [
                {"role": "user", "content": "Respond with the word 'CONNECTED' to confirm API connection."}
            ],
            "max_tokens": 10,
            "temperature": 0.0
        }
        
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                latency = round((time.time() - start_time) * 1000, 2)
                
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    return {
                        "success": True,
                        "message": f"Successfully connected to {model_name} in {latency}ms! AI Response: {content}",
                        "latency_ms": latency,
                        "model_tested": model_name
                    }
                else:
                    error_msg = response.text
                    try:
                        err_json = response.json()
                        error_msg = err_json.get("error", {}).get("message", response.text)
                    except Exception:
                        pass
                    return {
                        "success": False,
                        "message": f"Connection failed (HTTP {response.status_code}): {error_msg}",
                        "latency_ms": latency,
                        "model_tested": model_name
                    }
        except httpx.ConnectError:
            return {
                "success": False,
                "message": f"Could not connect to server at {clean_url}. Please check the URL and your network connection.",
                "latency_ms": None,
                "model_tested": model_name
            }
        except httpx.TimeoutException:
            return {
                "success": False,
                "message": f"Connection to {clean_url} timed out after 15 seconds.",
                "latency_ms": None,
                "model_tested": model_name
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection test error: {str(e)}",
                "latency_ms": None,
                "model_tested": model_name
            }

    @staticmethod
    async def generate_response(
        messages: List[Dict[str, str]],
        user_settings: Optional[UserSettings] = None,
        override_model: Optional[str] = None,
        override_temp: Optional[float] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Non-streaming response generator.
        """
        config = AIService.get_effective_config(user_settings)
        model = override_model or config["model"]
        temperature = override_temp if override_temp is not None else config["temperature"]
        api_key = config["api_key"]
        base_url = config["base_url"]
        
        # Prepare messages
        chat_messages = []
        if system_prompt or (user_settings and user_settings.system_prompt):
            sys_text = system_prompt or (user_settings.system_prompt if user_settings else "")
            chat_messages.append({"role": "system", "content": sys_text})
        chat_messages.extend(messages)
        
        endpoint = f"{base_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            
        payload = {
            "model": model,
            "messages": chat_messages,
            "temperature": temperature,
            "max_tokens": config["max_tokens"]
        }
        
        # If no API key configured and not a local endpoint, inform user clearly
        if not api_key and "localhost" not in base_url and "127.0.0.1" not in base_url:
            return (
                "⚠️ **AI API Key Not Configured**\n\n"
                "HAIDER AI needs an API key to generate live responses. "
                "Please navigate to **Settings** in the sidebar to configure your API provider (e.g., OpenAI, Groq, OpenRouter, or Ollama) and enter your API key.\n\n"
                "*Tip: You can use free keys from Groq or OpenRouter, or connect directly to local Ollama with no key!*"
            )

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("choices", [{}])[0].get("message", {}).get("content", "")
                else:
                    try:
                        err_json = response.json()
                        err_text = err_json.get("error", {}).get("message", response.text)
                    except Exception:
                        err_text = response.text
                    return f"❌ **AI Provider Error (HTTP {response.status_code})**: {err_text}"
        except Exception as e:
            return f"❌ **Request Error**: {str(e)}. Please check your AI endpoint settings."

    @staticmethod
    async def stream_response(
        messages: List[Dict[str, str]],
        user_settings: Optional[UserSettings] = None,
        override_model: Optional[str] = None,
        override_temp: Optional[float] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Streaming response generator sending Server-Sent Events (SSE).
        """
        config = AIService.get_effective_config(user_settings)
        model = override_model or config["model"]
        temperature = override_temp if override_temp is not None else config["temperature"]
        api_key = config["api_key"]
        base_url = config["base_url"]
        
        chat_messages = []
        sys_text = system_prompt or (user_settings.system_prompt if user_settings else "You are HAIDER AI, an intelligent personal AI assistant developed by Syed Haider Ali.")
        if sys_text:
            chat_messages.append({"role": "system", "content": sys_text})
        chat_messages.extend(messages)
        
        # If no API key and not local, stream the helpful configuration instruction
        if not api_key and "localhost" not in base_url and "127.0.0.1" not in base_url:
            demo_msg = (
                "⚠️ **AI API Key Required**\n\n"
                "HAIDER AI is ready to assist you! However, no active API key was found.\n\n"
                "**How to configure:**\n"
                "1. Click on **Settings** in the left sidebar.\n"
                "2. Choose your preferred AI Provider (OpenAI, Groq, OpenRouter, or Ollama).\n"
                "3. Enter your API key and click **Save Settings**.\n"
                "4. Click **Test AI Connection** to verify.\n\n"
                "*All credentials are securely stored and encrypted on the server.*"
            )
            for word in demo_msg.split(" "):
                yield f"data: {json.dumps({'content': word + ' '})}\n\n"
            yield "data: [DONE]\n\n"
            return
            
        endpoint = f"{base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            
        payload = {
            "model": model,
            "messages": chat_messages,
            "temperature": temperature,
            "max_tokens": config["max_tokens"],
            "stream": True
        }
        
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                async with client.stream("POST", endpoint, json=payload, headers=headers) as response:
                    if response.status_code != 200:
                        err_content = await response.aread()
                        err_text = err_content.decode("utf-8", errors="replace")
                        yield f"data: {json.dumps({'error': f'API Error {response.status_code}: {err_text}'})}\n\n"
                        yield "data: [DONE]\n\n"
                        return

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                yield "data: [DONE]\n\n"
                                break
                            try:
                                chunk_json = json.loads(data_str)
                                delta = chunk_json.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content")
                                if content:
                                    yield f"data: {json.dumps({'content': content})}\n\n"
                            except Exception:
                                continue
        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': f'Failed to connect to AI provider at {base_url}. Please verify URL in Settings.'})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Streaming error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"

