import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.models.safety import SafetyEvent, SafetySeverity
from app.core.diary_context import build_diary_context
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    ConversationUpdate,
    ChatReplyResponse
)

from app.schemas.message import MessageCreate, MessageResponse
from app.models.message import Message, SenderType
from sqlalchemy import func


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)
AI_CORE_URL = os.getenv("AI_CORE_URL", "http://localhost:8001")

@router.post("", response_model=ConversationResponse)
def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = Conversation(
        user_id=current_user.id,
        title=data.title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ConversationResponse(
        id=str(conversation.id),
        user_id=str(conversation.user_id),
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.get("", response_model=list[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return [
        ConversationResponse(
            id=str(conversation.id),
            user_id=str(conversation.user_id),
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at
        )
        for conversation in conversations
    ]


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse
)
def create_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    message = Message(
        conversation_id=conversation.id,
        sender=SenderType.USER,
        content=data.content
    )

    db.add(message)

    conversation.updated_at = func.now()

    db.commit()
    db.refresh(message)

    return MessageResponse(
        id=str(message.id),
        conversation_id=str(message.conversation_id),
        sender=message.sender.value,
        content=message.content,
        created_at=message.created_at
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse]
)
def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        MessageResponse(
            id=str(message.id),
            conversation_id=str(message.conversation_id),
            sender=message.sender.value,
            content=message.content,
            created_at=message.created_at
        )
        for message in messages
    ]


@router.post(
    "/{conversation_id}/messages/ai",
    response_model=MessageResponse
)
def create_ai_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    message = Message(
        conversation_id=conversation.id,
        sender=SenderType.ASSISTANT,
        content=data.content
    )

    db.add(message)

    conversation.updated_at = func.now()

    db.commit()
    db.refresh(message)

    return MessageResponse(
        id=str(message.id),
        conversation_id=str(message.conversation_id),
        sender=message.sender.value,
        content=message.content,
        created_at=message.created_at
    )


@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse
)
def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    conversation.title = data.title
    conversation.updated_at = func.now()

    db.commit()
    db.refresh(conversation)

    return ConversationResponse(
        id=str(conversation.id),
        user_id=str(conversation.user_id),
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )

@router.post(
    "/{conversation_id}/chat",
    response_model=ChatReplyResponse
)
def chat_with_ai(
    conversation_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # last 10 earlier messages as history for the AI
    past = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(10)
        .all()
    )
    past.reverse()
    history = [
        {
            "role": "user" if m.sender == SenderType.USER else "assistant",
            "content": m.content,
        }
        for m in past
    ]

    # save the user's message
    user_msg = Message(
        conversation_id=conversation.id,
        sender=SenderType.USER,
        content=data.content
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # summary of the user's recent diary entries for the AI
    user_context = build_diary_context(db, current_user.id)

    # call the AI core
    try:
        resp = requests.post(
            f"{AI_CORE_URL}/chat",
            json={
                "message": data.content,
                "history": history,
                "user_context": user_context,
            },
            timeout=120,
        )
        resp.raise_for_status()
        result = resp.json()
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="AI service is unavailable right now"
        )

    # save the AI's reply
    ai_msg = Message(
        conversation_id=conversation.id,
        sender=SenderType.ASSISTANT,
        content=result["reply"]
    )
    db.add(ai_msg)
    if result["flagged"]:
        db.add(SafetyEvent(
            user_id=current_user.id,
            message_id=user_msg.id,
            event_type="CRISIS_LANGUAGE",
            severity=SafetySeverity.HIGH,
            description="Crisis language detected by the AI safety guardrail",
        ))
    conversation.updated_at = func.now()
    db.commit()
    db.refresh(ai_msg)

    def to_response(m):
        return MessageResponse(
            id=str(m.id),
            conversation_id=str(m.conversation_id),
            sender=m.sender.value,
            content=m.content,
            created_at=m.created_at
        )

    return ChatReplyResponse(
        user_message=to_response(user_msg),
        ai_message=to_response(ai_msg),
        flagged=result["flagged"],
    )