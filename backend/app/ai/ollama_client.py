import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://127.0.0.1:11434"
DEFAULT_MODEL = "gemma3:1b"


def is_ollama_available() -> bool:
    """
    Checks if local Ollama service is reachable.
    """
    try:
        req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


def _preload_model() -> None:
    """
    Sends a lightweight request to pre-load the model into memory,
    eliminating cold-start latency on the next real request.
    Runs silently; failures are ignored.
    """
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": "",
        "keep_alive": "10m",
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30):
            pass
    except Exception:
        pass


def generate_completion(prompt: str, system_prompt: str = None, timeout: int = 60) -> dict:
    """
    Calls local Ollama service at /api/generate using model 'gemma3:1b'.
    Returns dict: {"success": True, "response": str} or {"success": False, "error": str}.
    Handles connection errors gracefully without raising unhandled exceptions.
    Uses keep_alive to prevent frequent model unloading/reloading.
    """
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "10m",
    }

    if system_prompt:
        payload["system"] = system_prompt

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                text = body.get("response", "").strip()
                return {"success": True, "response": text}
            else:
                return {
                    "success": False,
                    "error": f"Ollama returned HTTP {resp.status}"
                }
    except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
        logger.warning(f"Ollama connection error: {type(e).__name__}: {e}")
        return {
            "success": False,
            "error": "IBOA AI is currently unavailable. Please make sure Ollama is running."
        }
    except Exception as e:
        logger.warning(f"Ollama unexpected error: {type(e).__name__}: {e}")
        return {
            "success": False,
            "error": "IBOA AI is currently unavailable. Please make sure Ollama is running."
        }
