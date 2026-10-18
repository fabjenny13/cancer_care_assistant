import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
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
        distress_score=data.distress_score,
        mood_score=data.mood_score,
        note=data.note,
        source=data.source
    )

    db.add(mood)
    db.commit()
    db.refresh(mood)

    return mood


@router.get("", response_model=list[MoodResponse])
def get_mood_logs(
    source: str | None = Query(default=None, pattern="^(MANUAL|AI)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MoodLog).filter(MoodLog.user_id == current_user.id)

    if source:
        query = query.filter(MoodLog.source == source)

    return query.order_by(MoodLog.created_at.asc()).all()


@router.delete("/{mood_id}")
def delete_mood_log(
    mood_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mood = (
        db.query(MoodLog)
        .filter(
            MoodLog.id == mood_id,
            MoodLog.user_id == current_user.id
        )
        .first()
    )

    if not mood:
        raise HTTPException(
            status_code=404,
            detail="Mood entry not found"
        )

    db.delete(mood)
    db.commit()

    # JSON body (not 204): the frontend's apiRequest() always calls
    # response.json(), which would throw on an empty response.
    return {"message": "Mood entry deleted"}
