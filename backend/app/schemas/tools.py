from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# 1. Writing Assistant
class WritingAssistantRequest(BaseModel):
    category: str = Field(..., description="email, letter, report, social_caption, rewrite")
    topic_or_content: str = Field(..., min_length=2)
    tone: Optional[str] = "professional"  # professional, casual, persuasive, urgent, friendly
    audience: Optional[str] = "General"
    extra_instructions: Optional[str] = None

# 2. Summarizer
class SummarizerRequest(BaseModel):
    content: str = Field(..., min_length=10)
    summary_type: Optional[str] = "bullet_points"  # executive, bullet_points, tldr, one_sentence
    length: Optional[str] = "medium"  # short, medium, detailed

# 3. Translator
class TranslatorRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target_language: str = Field(..., description="Urdu, English, Spanish, French, German, Arabic, Chinese, Japanese, etc.")
    source_language: Optional[str] = "Auto-detect"
    preserve_tone: Optional[bool] = True

# 4. Coding Assistant
class CodingAssistantRequest(BaseModel):
    action: str = Field(..., description="explain, debug, improve, generate")
    code_or_prompt: str = Field(..., min_length=2)
    language: Optional[str] = "python"
    error_message: Optional[str] = None

# 5. Study Assistant
class StudyAssistantRequest(BaseModel):
    action: str = Field(..., description="explain_topic, mcq_quiz, flashcards, study_notes")
    topic: str = Field(..., min_length=2)
    difficulty_level: Optional[str] = "intermediate"  # beginner, intermediate, advanced, academic
    num_questions: Optional[int] = 5

# 6. Productivity Assistant
class ProductivityAssistantRequest(BaseModel):
    action: str = Field(..., description="daily_plan, breakdown_project, smart_reminders")
    goals_or_project: str = Field(..., min_length=2)
    available_hours: Optional[float] = 8.0
    deadline: Optional[str] = None

class ToolExecutionResponse(BaseModel):
    feature: str
    result: str
    metadata: Optional[Dict[str, Any]] = None

