from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.message import Message
from app.models.mood import MoodLog
from app.models.user import User
from app.schemas.mood import MoodCreate, MoodResponse


router = APIRouter(prefix="/mood", tags=["Mood"])


@router.post("", response_model=MoodResponse)
def create_mood_log(
    data: MoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If a message_id was provided, make sure it belongs
    # to a conversation owned by the current user.
    message = None

    if data.message_id:
        message = (
            db.query(Message)
            .join(Message.conversation)
            .filter(
                Message.id == data.message_id,
                Message.conversation.has(user_id=current_user.id)
            )
            .first()
        )

        if not message:
            raise HTTPException(
                status_code=404,
                detail="Message not found"
            )

    mood = MoodLog(
        user_id=current_user.id,
        message_id=message.id if message else None,
        emotion=data.emotion,
        confidence=data.confidence,
        distress_score=data.distress_score
    )

    db.add(mood)
    db.commit()
    db.refresh(mood)

    return MoodResponse(
        id=str(mood.id),
        user_id=str(mood.user_id),
        message_id=str(mood.message_id) if mood.message_id else None,
        emotion=mood.emotion,
        confidence=mood.confidence,
        distress_score=mood.distress_score,
        created_at=mood.created_at
    )


@router.get("", response_model=list[MoodResponse])
def get_mood_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    moods = (
        db.query(MoodLog)
        .filter(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.created_at.asc())
        .all()
    )

    return [
        MoodResponse(
            id=str(mood.id),
            user_id=str(mood.user_id),
            message_id=str(mood.message_id) if mood.message_id else None,
            emotion=mood.emotion,
            confidence=mood.confidence,
            distress_score=mood.distress_score,
            created_at=mood.created_at
        )
        for mood in moods
    ]