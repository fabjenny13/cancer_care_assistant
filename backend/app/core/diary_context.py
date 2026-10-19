from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.medication import Medication
from app.models.mood import MoodLog
from app.models.symptom import SymptomLog

SEVERITY_RANK = {"mild": 1, "moderate": 2, "severe": 3}


def build_diary_context(db: Session, user_id, days: int = 7):
    """Short plain-text summary of what the user logged recently.
    Returns None if there is nothing to report."""
    today = date.today()
    since_dt = datetime.now(timezone.utc) - timedelta(days=days)
    since_date = today - timedelta(days=days)
    lines = []

    # Mood: manual check-ins only (1 = very low, 5 = very good)
    moods = (
        db.query(MoodLog)
        .filter(
            MoodLog.user_id == user_id,
            MoodLog.source == "MANUAL",
            MoodLog.mood_score.isnot(None),
            MoodLog.created_at >= since_dt,
        )
        .all()
    )
    if moods:
        avg = sum(m.mood_score for m in moods) / len(moods)
        lines.append(
            f"Mood check-ins, last {days} days: {len(moods)} logged, "
            f"average {avg:.1f} out of 5 (1 = very low, 5 = very good)."
        )

    # Symptoms: grouped by name, with the worst severity seen
    symptoms = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id, SymptomLog.logged_on >= since_date)
        .all()
    )
    if symptoms:
        grouped = {}
        for s in symptoms:
            name = s.symptom.strip().lower()
            entry = grouped.setdefault(name, {"count": 0, "worst": "mild"})
            entry["count"] += 1
            sev = s.severity.strip().lower()
            if SEVERITY_RANK.get(sev, 0) > SEVERITY_RANK.get(entry["worst"], 0):
                entry["worst"] = sev
        parts = [
            f"{name} (logged {e['count']} time{'s' if e['count'] != 1 else ''}, worst: {e['worst']})"
            for name, e in grouped.items()
        ]
        lines.append(f"Symptoms, last {days} days: " + "; ".join(parts) + ".")

    # Medications: current schedule
    meds = db.query(Medication).filter(Medication.user_id == user_id).limit(8).all()
    if meds:
        parts = [
            f"{m.name} {m.dosage}, {m.frequency} at {m.time_of_day.strftime('%I:%M %p')}"
            for m in meds
        ]
        lines.append("Medications: " + "; ".join(parts) + ".")

    # Appointments: next 3 upcoming
    appts = (
        db.query(Appointment)
        .filter(Appointment.user_id == user_id, Appointment.appointment_date >= today)
        .order_by(Appointment.appointment_date, Appointment.appointment_time)
        .limit(3)
        .all()
    )
    if appts:
        parts = [
            f"{a.appointment_type} with {a.doctor} on "
            f"{a.appointment_date.strftime('%d %b %Y')} at "
            f"{a.appointment_time.strftime('%I:%M %p')}"
            for a in appts
        ]
        lines.append("Upcoming appointments: " + "; ".join(parts) + ".")

    return "\n".join(lines) if lines else None
