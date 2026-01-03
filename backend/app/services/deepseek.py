import os
import json
from openai import OpenAI
from typing import Dict, Any
from app.models import SessionLocal, SystemConfig

class DeepSeekService:
    def __init__(self):
        try:
            db = SessionLocal()
            api_key = db.query(SystemConfig).filter(SystemConfig.key == "DEEPSEEK_API_KEY").first()
            base_url = db.query(SystemConfig).filter(SystemConfig.key == "DEEPSEEK_API_BASE").first()
            model = db.query(SystemConfig).filter(SystemConfig.key == "DEEPSEEK_MODEL").first()
            db.close()

            self.api_key = api_key.value if api_key else os.getenv("DEEPSEEK_API_KEY")
            self.base_url = base_url.value if base_url else os.getenv("DEEPSEEK_API_BASE")
            self.model = model.value if model else os.getenv("DEEPSEEK_MODEL", "LEXA")
        except Exception:
            self.api_key = os.getenv("DEEPSEEK_API_KEY")
            self.base_url = os.getenv("DEEPSEEK_API_BASE")
            self.model = os.getenv("DEEPSEEK_MODEL", "LEXA")

        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    async def ping(self) -> bool:
        """
        Pulse check against the vLLM node.
        """
        try:
            self.client.models.list()
            return True
        except Exception:
            return False

    async def summarize_thread(self, current_summary: Dict[str, Any], new_message: str) -> Dict[str, Any]:
        """
        Optimized for DeepSeek-V3-Distill-Llama-70B:
        Recursive Summarization with strategic reasoning.
        """
        prompt = f"""
        ### Task: Update Founder's Communication Thread Summary
        ### Role: You are a strategic Chief of Staff for a startup founder.
        
        ### Current Summary:
        {json.dumps(current_summary)}
        
        ### New Incoming Message:
        {new_message}
        
        ### Instructions:
        1. Analyze the new message for strategic shifts, commitments, or risks.
        2. Update the 'rolling_summary' JSON object.
        3. Maintain a high 'Confidence Score'—if information is ambiguous, mark it as 'needs_clarification'.
        4. Focus on:
           - Strategic context: Why is this conversation happening?
           - Hard commitments: Specific tasks and deadlines.
           - Leverage points: Information the founder can use in future negotiations.
        
        ### Output Format (Strict JSON):
        {{
            "status": "active/waiting/completed",
            "strategic_context": "One sentence summary of the deal/project stage",
            "key_decisions": ["List of confirmed agreements"],
            "pending_tasks": [
                {{
                    "description": "Task details",
                    "priority": "high/medium/low",
                    "deadline": "ISO date or null",
                    "confidence_score": 0.0-1.0
                }}
            ],
            "leverage_points": ["Specific facts/history for negotiation"],
            "sentiment_analysis": "Contextual tone of the counterparty",
            "needs_clarification": ["Ambiguous points to follow up on"]
        }}
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a strategic AI assistant for a startup founder. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    async def get_embedding(self, text: str):
        """
        Get vector embedding for search.
        """
        # Note: Scaleway DeepSeek might not support embeddings directly, 
        # but if it does, use this. Otherwise, use OpenAI embeddings.
        response = self.client.embeddings.create(
            input=text,
            model="text-embedding-3-small" # Or equivalent
        )
        return response.data[0].embedding

