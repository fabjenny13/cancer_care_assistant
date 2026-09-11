function Dashboard() {

  return (
    <main className="main-content">

      {/* Top header */}

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Dashboard
          </p>

          <h1>Good evening!</h1>

          <p className="subtitle">
            Here's an overview of your health and wellness.
          </p>

        </div>

        <div className="header-date">
           September 8, 2026
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

            <h3>0</h3>

            <p>
              No symptoms logged
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

            <h3>0</h3>

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

            <h3>0</h3>

            <p>
              Scheduled for today
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

            <h3>—</h3>

            <p>
              Not logged yet
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

          <div className="empty-state small">

            <div>📅</div>

            <p>No upcoming appointments</p>

            <span>
              Add your next appointment to keep track of it.
            </span>

          </div>

        </div>


        {/* Today's medication */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>Today's Medications</h2>

              <p>Stay on top of your medication schedule</p>

            </div>

          </div>

          <div className="empty-state small">

            <div>💊</div>

            <p>No medications scheduled</p>

            <span>
              Your medication schedule will appear here.
            </span>

          </div>

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