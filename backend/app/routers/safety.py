from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.message import Message
from app.models.safety import (SafetySeverity, SafetyEvent, SafetyStatus)
from app.models.user import User
from app.schemas.safety import (
    SafetyEventCreate,
    SafetyEventResponse,
    SafetyEventUpdate
)

from datetime import datetime, timezone



router = APIRouter(
    prefix="/safety",
    tags=["Safety"]
)


@router.post("", response_model=SafetyEventResponse)
def create_safety_event(
    data: SafetyEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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

    try: 
        severity_enum = SafetySeverity(data.severity.upper())
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid severity"
        )

    event = SafetyEvent(
        user_id=current_user.id,
        message_id=message.id if message else None,
        event_type=data.event_type,
        severity=severity_enum,
        status=SafetyStatus.PENDING,
        description=data.description
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return SafetyEventResponse(
        id=str(event.id),
        user_id=str(event.user_id),
        message_id=str(event.message_id) if event.message_id else None,
        event_type=event.event_type,
        severity=event.severity.value,
        status=event.status.value,
        description=event.description,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.get("", response_model=list[SafetyEventResponse])
def get_safety_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    events = (
        db.query(SafetyEvent)
        .filter(SafetyEvent.user_id == current_user.id)
        .order_by(SafetyEvent.created_at.desc())
        .all()
    )

    return [
        SafetyEventResponse(
            id=str(event.id),
            user_id=str(event.user_id),
            message_id=str(event.message_id)
            if event.message_id else None,
            event_type=event.event_type,
            severity=event.severity.value,
            status=event.status.value,
            description=event.description,
            created_at=event.created_at,
            updated_at=event.updated_at,
            resolved_at=event.resolved_at
        )
        for event in events
    ]


@router.patch("/{event_id}", response_model=SafetyEventResponse)
def update_safety_event(
    event_id: str,
    data: SafetyEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = (
        db.query(SafetyEvent)
        .filter(
            SafetyEvent.id == event_id,
            SafetyEvent.user_id == current_user.id
        )
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Safety event not found"
        )

    try:
        new_status = SafetyStatus(data.status.upper())
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    event.status = new_status

    if new_status == SafetyStatus.RESOLVED:
        event.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(event)

    return SafetyEventResponse(
        id=str(event.id),
        user_id=str(event.user_id),
        message_id=str(event.message_id) if event.message_id else None,
        event_type=event.event_type,
        severity=event.severity.value,
        status=event.status.value,
        description=event.description,
        created_at=event.created_at,
        updated_at=event.updated_at,
        resolved_at=event.resolved_at
    )