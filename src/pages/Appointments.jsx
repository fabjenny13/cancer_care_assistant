import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Appointments() {

  const location = useLocation();
  const navigate = useNavigate();


  // -----------------------------------------
  // FORM STATES
  // -----------------------------------------

  const [doctor, setDoctor] = useState("");
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");


  // -----------------------------------------
  // LOAD SAVED APPOINTMENTS
  // -----------------------------------------

  const [appointments, setAppointments] = useState(() => {

    try {

      const savedAppointments =
        localStorage.getItem(
          "cancercare_appointments"
        );

      return savedAppointments
        ? JSON.parse(savedAppointments)
        : [];

    } catch (error) {

      console.error(
        "Could not load appointments:",
        error
      );

      return [];

    }

  });


  const [assistantFilled, setAssistantFilled] =
    useState(false);


  // -----------------------------------------
  // SAVE APPOINTMENTS PERMANENTLY
  // -----------------------------------------

  useEffect(() => {

    localStorage.setItem(
      "cancercare_appointments",
      JSON.stringify(appointments)
    );

  }, [appointments]);


  // -----------------------------------------
  // RECEIVE AI PREFILL
  // -----------------------------------------

  useEffect(() => {

    const prefill =
      location.state?.prefill;

    if (!prefill) {
      return;
    }


    if (prefill.doctor) {
      setDoctor(prefill.doctor);
    }

    if (prefill.hospital) {
      setHospital(prefill.hospital);
    }

    if (prefill.date) {
      setDate(prefill.date);
    }

    if (prefill.time) {
      setTime(prefill.time);
    }

    if (prefill.type) {
      setType(prefill.type);
    }

    if (prefill.notes) {
      setNotes(prefill.notes);
    }


    setAssistantFilled(true);


    // Remove temporary navigation state

    navigate(location.pathname, {
      replace: true,
      state: null
    });

  }, [
    location.state,
    location.pathname,
    navigate
  ]);


  // -----------------------------------------
  // ADD APPOINTMENT
  // -----------------------------------------

  function handleSubmit(event) {

    event.preventDefault();


    if (
      !doctor ||
      !date ||
      !time ||
      !type
    ) {

      alert(
        "Please fill in Doctor, Date, Time and Appointment Type."
      );

      return;

    }


    const newAppointment = {

      id: Date.now(),

      doctor,

      hospital,

      date,

      time,

      type,

      notes

    };


    setAppointments(
      (previousAppointments) => [
        ...previousAppointments,
        newAppointment
      ]
    );


    // Clear form

    setDoctor("");
    setHospital("");
    setDate("");
    setTime("");
    setType("");
    setNotes("");

    setAssistantFilled(false);


    alert(
      "Appointment added successfully! 📅"
    );

  }


  // -----------------------------------------
  // DELETE APPOINTMENT
  // -----------------------------------------

  function deleteAppointment(id) {

    setAppointments(
      (previousAppointments) =>
        previousAppointments.filter(
          (appointment) =>
            appointment.id !== id
        )
    );

  }


  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (

    <main className="main-content">

      {/* HEADER */}

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Appointments
          </p>

          <h1>
            Appointments 📅
          </h1>

          <p className="subtitle">
            Keep track of your upcoming healthcare visits.
          </p>

        </div>

      </div>


      {/* AI PREFILL MESSAGE */}

      {assistantFilled && (

        <div className="assistant-fill-banner">

          <div className="assistant-fill-icon">
            🤖
          </div>

          <div>

            <strong>
              AI Assistant filled this form for you
            </strong>

            <p>
              Please review the information carefully
              before saving the appointment.
            </p>

          </div>

        </div>

      )}


      {/* FORM */}

      <div className="form-card">

        <div className="card-header">

          <div>

            <h2>
              Add Appointment
            </h2>

            <p>
              Save details about your upcoming healthcare visit.
            </p>

          </div>

          <span className="card-icon">
            📅
          </span>

        </div>


        <form
          onSubmit={handleSubmit}
          className="professional-form"
        >

          {/* DOCTOR + HOSPITAL */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Doctor *
              </label>

              <input
                type="text"
                placeholder="Example: Dr. Sharma"
                value={doctor}
                onChange={(event) =>
                  setDoctor(event.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Hospital / Clinic
              </label>

              <input
                type="text"
                placeholder="Example: City Hospital"
                value={hospital}
                onChange={(event) =>
                  setHospital(event.target.value)
                }
              />

            </div>

          </div>


          {/* DATE + TIME */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Date *
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Time *
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(event.target.value)
                }
              />

            </div>

          </div>


          {/* TYPE */}

          <div className="form-group">

            <label>
              Appointment Type *
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >

              <option value="">
                Select appointment type
              </option>

              <option value="Consultation">
                Consultation
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Treatment">
                Treatment
              </option>

              <option value="Test / Scan">
                Test / Scan
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* NOTES */}

          <div className="form-group">

            <label>
              Notes
            </label>

            <textarea
              placeholder="Add additional information..."
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
          >

            Add Appointment

          </button>

        </form>

      </div>


      {/* UPCOMING APPOINTMENTS */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Upcoming Appointments
            </h2>

            <p>
              Your scheduled healthcare visits
            </p>

          </div>

          <span className="card-icon">
            📅
          </span>

        </div>


        {appointments.length === 0 ? (

          <div className="empty-state">

            <div>
              📅
            </div>

            <h3>
              No upcoming appointments
            </h3>

            <p>
              Add an appointment to see it here.
            </p>

          </div>

        ) : (

          <div className="record-list">

            {appointments.map(
              (appointment) => (

                <div
                  className="record-item"
                  key={appointment.id}
                >

                  <div className="record-main">

                    <div className="record-icon purple-icon">
                      📅
                    </div>

                    <div>

                      <h3>
                        {appointment.type}
                      </h3>

                      <p>
                        {appointment.doctor}
                      </p>

                      {appointment.hospital && (

                        <p>
                          {appointment.hospital}
                        </p>

                      )}

                      {appointment.notes && (

                        <p>
                          {appointment.notes}
                        </p>

                      )}

                    </div>

                  </div>


                  <div className="record-details">

                    <strong>
                      {appointment.date}
                    </strong>

                    <span>
                      {appointment.time}
                    </span>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteAppointment(
                          appointment.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>

  );

}

export default Appointments;