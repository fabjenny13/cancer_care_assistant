import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Medications() {

  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");

  const [medications, setMedications] = useState(() => {

    try {

      const savedMedications =
        localStorage.getItem(
          "cancercare_medications"
        );

      return savedMedications
        ? JSON.parse(savedMedications)
        : [];

    } catch (error) {

      console.error(
        "Could not load medications:",
        error
      );

      return [];

    }

  });

  const [assistantFilled, setAssistantFilled] =
    useState(false);


  // -----------------------------------------
  // SAVE PERMANENTLY
  // -----------------------------------------

  useEffect(() => {

    localStorage.setItem(
      "cancercare_medications",
      JSON.stringify(medications)
    );

  }, [medications]);


  // -----------------------------------------
  // RECEIVE AI DATA
  // -----------------------------------------

  useEffect(() => {

    const prefill =
      location.state?.prefill;

    if (!prefill) {
      return;
    }

    if (prefill.name) {
      setName(prefill.name);
    }

    if (prefill.dosage) {
      setDosage(prefill.dosage);
    }

    if (prefill.frequency) {
      setFrequency(prefill.frequency);
    }

    if (prefill.time) {
      setTime(prefill.time);
    }

    setAssistantFilled(true);

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
  // ADD MEDICATION
  // -----------------------------------------

  function handleSubmit(event) {

    event.preventDefault();

    if (
      !name ||
      !dosage ||
      !frequency ||
      !time
    ) {

      alert(
        "Please fill in all required fields."
      );

      return;
    }

    const newMedication = {

      id: Date.now(),

      name,

      dosage,

      frequency,

      time,

      taken: false

    };

    setMedications(
      (previousMedications) => [
        ...previousMedications,
        newMedication
      ]
    );

    setName("");
    setDosage("");
    setFrequency("");
    setTime("");

    setAssistantFilled(false);

    alert(
      "Medication added successfully! 💊"
    );

  }


  // -----------------------------------------
  // MARK AS TAKEN
  // -----------------------------------------

  function toggleTaken(id) {

    setMedications(
      (previousMedications) =>
        previousMedications.map(
          (medicine) =>
            medicine.id === id
              ? {
                  ...medicine,
                  taken: !medicine.taken
                }
              : medicine
        )
    );

  }


  // -----------------------------------------
  // DELETE
  // -----------------------------------------

  function deleteMedication(id) {

    setMedications(
      (previousMedications) =>
        previousMedications.filter(
          (medicine) =>
            medicine.id !== id
        )
    );

  }


  return (

    <main className="main-content">

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Medications
          </p>

          <h1>
            Medications 💊
          </h1>

          <p className="subtitle">
            Manage your medication schedule and daily reminders.
          </p>

        </div>

      </div>


      {/* AI MESSAGE */}

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
              before saving the medication.
            </p>

          </div>

        </div>

      )}


      {/* FORM */}

      <div className="form-card">

        <div className="card-header">

          <div>

            <h2>
              Add Medication
            </h2>

            <p>
              Keep your medication information organized.
            </p>

          </div>

          <span className="card-icon">
            💊
          </span>

        </div>


        <form
          onSubmit={handleSubmit}
          className="professional-form"
        >

          <div className="form-row">

            <div className="form-group">

              <label>
                Medication Name *
              </label>

              <input
                type="text"
                placeholder="Example: Paracetamol"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Dosage *
              </label>

              <input
                type="text"
                placeholder="Example: 500 mg"
                value={dosage}
                onChange={(event) =>
                  setDosage(event.target.value)
                }
              />

            </div>

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>
                Frequency *
              </label>

              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value)
                }
              >

                <option value="">
                  Select frequency
                </option>

                <option value="Once daily">
                  Once daily
                </option>

                <option value="Twice daily">
                  Twice daily
                </option>

                <option value="Three times daily">
                  Three times daily
                </option>

                <option value="As needed">
                  As needed
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Reminder Time *
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


          <button
            type="submit"
            className="primary-button"
          >
            Add Medication
          </button>

        </form>

      </div>


      {/* MEDICATION LIST */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Today's Medications
            </h2>

            <p>
              Mark medications as taken when appropriate.
            </p>

          </div>

          <span className="card-icon">
            💊
          </span>

        </div>


        {medications.length === 0 ? (

          <div className="empty-state">

            <div>
              💊
            </div>

            <h3>
              No medications added
            </h3>

            <p>
              Your medication schedule will appear here.
            </p>

          </div>

        ) : (

          <div className="record-list">

            {medications.map((medicine) => (

              <div
                className={
                  medicine.taken
                    ? "record-item medication-taken"
                    : "record-item"
                }
                key={medicine.id}
              >

                <div className="record-main">

                  <div className="record-icon green-icon">
                    💊
                  </div>

                  <div>

                    <h3>
                      {medicine.name}
                    </h3>

                    <p>
                      {medicine.dosage} •{" "}
                      {medicine.frequency}
                    </p>

                    <p>
                      Reminder: {medicine.time}
                    </p>

                  </div>

                </div>


                <div className="record-details">

                  <button
                    type="button"
                    className={
                      medicine.taken
                        ? "taken-button"
                        : "take-button"
                    }
                    onClick={() =>
                      toggleTaken(
                        medicine.id
                      )
                    }
                  >

                    {medicine.taken
                      ? "✓ Taken"
                      : "Mark as Taken"}

                  </button>


                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      deleteMedication(
                        medicine.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );

}

export default Medications;