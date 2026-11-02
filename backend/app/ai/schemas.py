from typing import Any, Optional
from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Natural language user prompt in English, Hindi, or Hinglish")


class AIChatResponse(BaseModel):
    response: str = Field(..., description="Natural language answer synthesized by local Ollama AI Agent")
    tool_used: str = Field(..., description="Name of the controlled deterministic backend tool invoked")
    data: dict[str, Any] = Field(default_factory=dict, description="Structured factual backend data returned by the tool")
    status: str = Field(default="success", description="Status of request execution ('success' or 'error')")
    error_detail: Optional[str] = Field(default=None, description="Optional user-safe error message")
