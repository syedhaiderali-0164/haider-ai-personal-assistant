import os
import re
import math
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from pypdf import PdfReader
from docx import Document as DocxDocument
import openpyxl
import csv
from app.services.ai_service import AIService
from app.models.settings import UserSettings

class RAGService:
    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        """
        Extracts clean plain text from PDF, DOCX, TXT, CSV, or XLSX files.
        """
        file_type = file_type.lower().replace(".", "")
        text = ""
        
        try:
            if file_type == "pdf":
                reader = PdfReader(file_path)
                pages_text = []
                for i, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        pages_text.append(f"[Page {i+1}]\n{extracted.strip()}")
                text = "\n\n".join(pages_text)
                
            elif file_type in ["docx", "doc"]:
                doc = DocxDocument(file_path)
                paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
                # Also extract table text
                for table in doc.tables:
                    for row in table.rows:
                        row_vals = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_vals:
                            paras.append(" | ".join(row_vals))
                text = "\n\n".join(paras)
                
            elif file_type == "txt":
                for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
                    try:
                        with open(file_path, "r", encoding=encoding) as f:
                            text = f.read()
                        break
                    except UnicodeDecodeError:
                        continue
                        
            elif file_type == "csv":
                rows = []
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    reader = csv.reader(f)
                    for i, row in enumerate(reader):
                        if i < 500:  # Prevent runaway size
                            rows.append(", ".join(row))
                text = "\n".join(rows)
                
            elif file_type in ["xlsx", "xls"]:
                wb = openpyxl.load_workbook(file_path, data_only=True)
                sheets_text = []
                for sheet in wb.worksheets:
                    sheets_text.append(f"--- Sheet: {sheet.title} ---")
                    for row in sheet.iter_rows(values_only=True):
                        row_vals = [str(val).strip() for val in row if val is not None]
                        if row_vals:
                            sheets_text.append(" | ".join(row_vals))
                text = "\n".join(sheets_text)
                
            else:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    text = f.read()
                    
        except Exception as e:
            text = f"Error extracting text from {file_type} file: {str(e)}"
            
        return text.strip()

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> List[str]:
        """
        Splits text into coherent chunks respecting paragraph and sentence boundaries.
        """
        if not text:
            return []
            
        paragraphs = re.split(r'\n\s*\n', text)
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
                
            if len(current_chunk) + len(para) + 2 <= chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                    
                # If paragraph itself is larger than chunk_size, split by sentences
                if len(para) > chunk_size:
                    sentences = re.split(r'(?<=[.!?]) +', para)
                    sub_chunk = ""
                    for sent in sentences:
                        if len(sub_chunk) + len(sent) + 1 <= chunk_size:
                            sub_chunk += (" " if sub_chunk else "") + sent
                        else:
                            if sub_chunk:
                                chunks.append(sub_chunk)
                            sub_chunk = sent
                    if sub_chunk:
                        current_chunk = sub_chunk
                else:
                    current_chunk = para
                    
        if current_chunk:
            chunks.append(current_chunk)
            
        # Add slight overlap if chunks are strictly separated
        return chunks if chunks else [text[:chunk_size]]

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r'\b[a-zA-Z0-9_\u0600-\u06FF]{2,}\b', text.lower())

    @staticmethod
    def calculate_similarity(query: str, doc_chunk: str) -> float:
        """
        Computes cosine similarity based on term frequencies (works with multilingual & Urdu!).
        """
        q_tokens = RAGService._tokenize(query)
        d_tokens = RAGService._tokenize(doc_chunk)
        
        if not q_tokens or not d_tokens:
            return 0.0
            
        q_counts = Counter(q_tokens)
        d_counts = Counter(d_tokens)
        
        all_words = set(q_counts.keys()).union(set(d_counts.keys()))
        
        dot_product = sum(q_counts.get(w, 0) * d_counts.get(w, 0) for w in all_words)
        q_mag = math.sqrt(sum(v ** 2 for v in q_counts.values()))
        d_mag = math.sqrt(sum(v ** 2 for v in d_counts.values()))
        
        if q_mag == 0 or d_mag == 0:
            return 0.0
            
        return dot_product / (q_mag * d_mag)

    @staticmethod
    def retrieve_relevant_chunks(
        query: str,
        chunks: List[Dict[str, Any]],
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Ranks chunks by relevance score and returns top_k items.
        """
        scored_chunks = []
        for chunk in chunks:
            content = chunk.get("content", "")
            score = RAGService.calculate_similarity(query, content)
            scored_chunks.append({**chunk, "score": score})
            
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

    @staticmethod
    async def answer_question(
        query: str,
        relevant_chunks: List[str],
        user_settings: Optional[UserSettings] = None,
        doc_names: List[str] = None
    ) -> str:
        """
        Generates context-grounded answer to a query using retrieved document chunks.
        """
        sources_header = ", ".join(doc_names) if doc_names else "Uploaded Document(s)"
        context_text = "\n\n---\n\n".join([f"Excerpt {i+1}:\n{c}" for i, c in enumerate(relevant_chunks)])
        
        system_prompt = (
            "You are HAIDER AI Document Intelligence Assistant, developed by Syed Haider Ali. "
            "Your task is to answer the user's question accurately and objectively using the provided document excerpts. "
            "If the document does not contain enough information to answer completely, acknowledge that clearly and state what is found. "
            "Use clear formatting, bullet points where helpful, and reference relevant details directly."
        )
        
        user_prompt = (
            f"SOURCE DOCUMENTS: {sources_header}\n\n"
            f"DOCUMENT CONTEXT:\n{context_text}\n\n"
            f"USER QUESTION: {query}\n\n"
            "Please provide a comprehensive, accurate answer based on the context above."
        )
        
        messages = [{"role": "user", "content": user_prompt}]
        return await AIService.generate_response(messages, user_settings=user_settings, system_prompt=system_prompt)

    @staticmethod
    async def generate_document_summary(
        full_text: str,
        mode: str = "comprehensive",
        user_settings: Optional[UserSettings] = None
    ) -> str:
        """
        Generates an intelligent summary of a document.
        """
        # Trim text to reasonable context budget if gigantic
        trimmed_text = full_text[:12000]
        
        mode_instructions = {
            "executive": "Provide a high-level Executive Summary highlighting the core purpose, key findings, and final conclusions.",
            "key_points": "Extract the key points and core takeaways as organized, actionable bullet points.",
            "eli5": "Explain the contents and significance in simple, easy-to-understand terms (Explain Like I'm 5).",
            "comprehensive": "Provide a comprehensive structured summary with Overview, Major Themes, Detailed Insights, and Key Takeaways."
        }.get(mode, "Provide a comprehensive summary.")
        
        system_prompt = (
            "You are HAIDER AI Document Summarizer, developed by Syed Haider Ali. "
            "Analyze the document text and produce an elegant, well-structured, clear summary."
        )
        
        user_prompt = (
            f"DOCUMENT TEXT:\n{trimmed_text}\n\n"
            f"INSTRUCTION: {mode_instructions}"
        )
        
        messages = [{"role": "user", "content": user_prompt}]
        return await AIService.generate_response(messages, user_settings=user_settings, system_prompt=system_prompt)
