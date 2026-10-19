import { useState } from "react";

import { useApiList } from "../utils/useApiList";
import { isToday, toHHMM, toLocalDateString } from "../utils/dates";

// The dashboard shows the API records as they are.
const asIs = (record) => record;

function getGreeting(date) {

  const hour = date.getHours();

  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";

  return "Good evening!";
}

function Dashboard() {

  // Fixed when the page opens, so every number below uses the same "now".
  const [now] = useState(() => new Date());
  const today = toLocalDateString(now);

  // Symptoms from the last 7 days (today + the 6 days before it)
  const [weekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toLocalDateString(date);
  });

  const symptoms = useApiList(`/symptoms?from_date=${weekStart}`, asIs);
  const appointments = useApiList(`/appointments?from_date=${today}`, asIs);
  const medications = useApiList("/medications", asIs);
  const moods = useApiList("/mood?source=MANUAL", asIs);

  const loading =
    symptoms.loading ||
    appointments.loading ||
    medications.loading ||
    moods.loading;

  const loadError =
    symptoms.loadError ||
    appointments.loadError ||
    medications.loadError ||
    moods.loadError;

  // Appointments that haven't started yet (earlier today doesn't count)
  const upcoming = appointments.items.filter(
    (appointment) =>
      new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      ) >= now
  );

  // "As needed" medications have no schedule, so they aren't listed here
  const scheduled = medications.items.filter(
    (medicine) => medicine.frequency !== "As needed"
  );

  const takenCount = scheduled.filter(
    (medicine) => isToday(medicine.last_taken_at)
  ).length;

  // Most recent check-in made today (the list is oldest -> newest)
  const todaysMood = moods.items
    .filter((entry) => toLocalDateString(entry.created_at) === today)
    .at(-1);

  // Show a dash instead of a misleading 0 while data is still loading
  const count = (value) => (loading ? "–" : value);

  return (
    <main className="main-content">

      {/* Top header */}

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Dashboard
          </p>

          <h1>{getGreeting(now)}</h1>

          <p className="subtitle">
            Here's an overview of your health and wellness.
          </p>

          {loadError && (
            <p className="subtitle">
              Could not load some of your data: {loadError}
            </p>
          )}

        </div>

        <div className="header-date">
          {now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </div>

      </div>

      {/* Welcome banner */}

      <section className="welcome-banner">

        <div>

          <span className="welcome-label">
            YOUR HEALTH JOURNEY
          </span>

          <h2>
            You're doing great by staying connected
            with your health.
          </h2>

          <p>
            Keep track of your symptoms, appointments,
            medications, and emotional wellbeing in one place.
          </p>

        </div>

        <div className="welcome-illustration">
          💙
        </div>

      </section>

      {/* Statistics */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon blue">
            🩺
          </div>

          <div>

            <span className="stat-label">
              SYMPTOMS
            </span>

            <h3>{count(symptoms.items.length)}</h3>

            <p>
              {symptoms.items.length === 0
                ? "No symptoms logged this week"
                : "Logged in the last 7 days"}
            </p>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon purple">
            📅
          </div>

          <div>

            <span className="stat-label">
              APPOINTMENTS
            </span>

            <h3>{count(upcoming.length)}</h3>

            <p>
              Upcoming appointments
            </p>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            💊
          </div>

          <div>

            <span className="stat-label">
              MEDICATIONS
            </span>

            <h3>{count(scheduled.length)}</h3>

            <p>
              {scheduled.length === 0
                ? "No medications scheduled"
                : `${takenCount} of ${scheduled.length} taken today`}
            </p>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            😊
          </div>

          <div>

            <span className="stat-label">
              TODAY'S MOOD
            </span>

            <h3>{loading ? "–" : todaysMood ? todaysMood.emotion : "—"}</h3>

            <p>
              {todaysMood ? "Logged today" : "Not logged yet"}
            </p>

          </div>

        </div>

      </section>

      {/* Bottom cards */}

      <section className="dashboard-columns">

        {/* Upcoming appointments */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>Upcoming Appointments</h2>

              <p>Your scheduled healthcare visits</p>

            </div>

          </div>

          {upcoming.length === 0 ? (

            <div className="empty-state small">

              <div>📅</div>

              <p>{loading ? "Loading..." : "No upcoming appointments"}</p>

              <span>
                Add your next appointment to keep track of it.
              </span>

            </div>

          ) : (

            <div className="record-list">

              {upcoming.slice(0, 3).map((appointment) => (

                <div className="record-item" key={appointment.id}>

                  <div className="record-main">

                    <div className="record-icon">📅</div>

                    <div>

                      <h3>{appointment.appointment_type}</h3>

                      <p>
                        {appointment.doctor}
                        {appointment.hospital
                          ? ` • ${appointment.hospital}`
                          : ""}
                      </p>

                    </div>

                  </div>

                  <div className="record-details">

                    <strong>{appointment.appointment_date}</strong>

                    <span>{toHHMM(appointment.appointment_time)}</span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Today's medication */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>Today's Medications</h2>

              <p>Stay on top of your medication schedule</p>

            </div>

          </div>

          {scheduled.length === 0 ? (

            <div className="empty-state small">

              <div>💊</div>

              <p>{loading ? "Loading..." : "No medications scheduled"}</p>

              <span>
                Your medication schedule will appear here.
              </span>

            </div>

          ) : (

            <div className="record-list">

              {scheduled.map((medicine) => (

                <div className="record-item" key={medicine.id}>

                  <div className="record-main">

                    <div className="record-icon">💊</div>

                    <div>

                      <h3>{medicine.name}</h3>

                      <p>
                        {medicine.dosage} • {medicine.frequency}
                      </p>

                    </div>

                  </div>

                  <div className="record-details">

                    <strong>{toHHMM(medicine.time_of_day)}</strong>

                    <span>
                      {isToday(medicine.last_taken_at)
                        ? "✓ Taken"
                        : "Not taken yet"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* Wellness */}

      <section className="dashboard-card wellness-card">

        <div className="card-header">

          <div>

            <h2>Wellness Check-in</h2>

            <p>
              Take a moment to check in with yourself today.
            </p>

          </div>

        </div>

        <div className="wellness-content">

          <span className="large-emoji">
            😊
          </span>

          <div>

            <h3>How are you feeling today?</h3>

            <p>
              Recording your mood can help you understand
              your emotional wellbeing over time.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;