import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

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

    symptom: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # Mild / Moderate / Severe (validated in the schema layer)
    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # The day the symptom was experienced, as chosen by the user.
    # Stored as a plain date (no timezone) on purpose: it is the
    # user's calendar day, not a server timestamp.
    logged_on: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    user: Mapped["User"] = relationship(
        back_populates="symptom_logs"
    )
