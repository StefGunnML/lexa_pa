from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from .deepseek import DeepSeekService
from ..models import get_db_engine, Thread, Message, PendingAction, Entity
from sqlalchemy.orm import sessionmaker
import os

# Setup Database Session
engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class AgentState(TypedDict):
    thread_id: str
    new_message: str
    sender_info: Dict[str, Any]
    current_summary: Dict[str, Any]
    extracted_tasks: List[Dict[str, Any]]
    potential_matches: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]

class CompassAgent:
    def __init__(self):
        self.deepseek = DeepSeekService()
        self.workflow = self._build_workflow()

    def _build_workflow(self):
        workflow = StateGraph(AgentState)

        workflow.add_node("resolve_identity", self._resolve_identity_node)
        workflow.add_node("summarize", self._summarize_node)
        workflow.add_node("extract_tasks", self._extract_tasks_node)
        workflow.add_node("generate_actions", self._generate_actions_node)

        workflow.set_entry_point("resolve_identity")
        workflow.add_edge("resolve_identity", "summarize")
        workflow.add_edge("summarize", "extract_tasks")
        workflow.add_edge("extract_tasks", "generate_actions")
        workflow.add_edge("generate_actions", END)

        return workflow.compile()

    async def _resolve_identity_node(self, state: AgentState):
        """
        Identity Resolution Engine:
        Scans for existing entities that might match the sender.
        If no match found but info exists, we suggest a profile merge.
        """
        sender = state.get("sender_info", {})
        email = sender.get("email")
        slack_id = sender.get("slack_id")
        
        db = SessionLocal()
        # 1. Exact Email Match
        entity = db.query(Entity).filter(Entity.email == email).first()
        if not entity and slack_id:
            # 2. Slack ID Match
            entity = db.query(Entity).filter(Entity.slack_id == slack_id).first()
        
        db.close()

        if entity:
            return {"potential_matches": [{"id": str(entity.id), "name": entity.name}]}
        
        # If we have name but no ID match, return a potential match by name
        if sender.get("name"):
            db = SessionLocal()
            matches = db.query(Entity).filter(Entity.name.ilike(f"%{sender['name']}%")).all()
            db.close()
            return {"potential_matches": [{"id": str(m.id), "name": m.name} for m in matches]}

        return {"potential_matches": []}

    async def _summarize_node(self, state: AgentState):
        # Only summarize if it's a new message or update needed
        summary = await self.deepseek.summarize_thread(state.get('current_summary', {}), state['new_message'])
        
        # Persist to DB
        db = SessionLocal()
        thread = db.query(Thread).filter(Thread.id == state['thread_id']).first()
        if thread:
            thread.rolling_summary = summary
            db.commit()
        db.close()

        return {"current_summary": summary}

    async def _extract_tasks_node(self, state: AgentState):
        tasks = state.get('current_summary', {}).get("pending_tasks", [])
        return {"extracted_tasks": tasks}

    async def _generate_actions_node(self, state: AgentState):
        actions = []
        thread_id = state.get('thread_id')
        db = SessionLocal()
        
        # 1. Merge Profile Actions (Reliability Layer)
        if not state.get('potential_matches') and state.get('sender_info', {}).get('email'):
            # This is a new entity, suggest creating it
            actions.append({
                "type": "create_profile",
                "confidence_score": 0.9,
                "source_link": "#",
                "data": {
                    "name": state['sender_info'].get('name', 'Unknown User'),
                    "email": state['sender_info'].get('email'),
                    "reasoning": "New contact detected in communication stream."
                }
            })

        # 2. Task-based Actions
        for task in state['extracted_tasks']:
            source_link = f"https://mail.google.com/mail/u/0/#all/{thread_id}" if "SLACK" not in thread_id else "#"
            confidence = task.get("confidence_score", 0.5) 
            
            if "schedule" in task.get("description", "").lower() or "meeting" in task.get("description", "").lower():
                action = PendingAction(
                    type="calendar_invite",
                    confidence_score=confidence,
                    source_link=source_link,
                    thread_id=thread_id,
                    data={
                        "title": task['description'], 
                        "deadline": task.get("deadline"),
                        "reasoning": state['current_summary'].get("strategic_context", "AI derived action.")
                    }
                )
                db.add(action)
                db.flush()
                actions.append({
                    "id": str(action.id),
                    "type": action.type,
                    "data": action.data
                })
        
        db.commit()
        db.close()
        return {"actions": actions}

    async def run(self, thread_id: str, message: str, current_summary: Dict[str, Any], sender_info: Dict[str, Any] = {}):
        initial_state = {
            "thread_id": thread_id,
            "new_message": message,
            "sender_info": sender_info,
            "current_summary": current_summary,
            "extracted_tasks": [],
            "potential_matches": [],
            "actions": []
        }
        return await self.workflow.ainvoke(initial_state)

