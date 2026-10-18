import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="SET NULL"),
        index=True
    )

    emotion: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    confidence: Mapped[float | None] = mapped_column(
        Float
    )

    distress_score: Mapped[float | None] = mapped_column(
        Float
    )

    # MANUAL = the user's own check-in, AI = detected from a message.
    # Kept apart so mood charts don't mix the two kinds of entry.
    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="MANUAL",
        server_default="MANUAL"
    )

    # 1 (Very Low) .. 5 (Very Good) for manual check-ins
    mood_score: Mapped[int | None] = mapped_column(
        SmallInteger
    )

    note: Mapped[str | None] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user: Mapped["User"] = relationship(
        back_populates="mood_logs"
    )

    message: Mapped["Message | None"] = relationship(
        back_populates="mood_logs"
    )