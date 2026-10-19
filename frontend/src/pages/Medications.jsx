import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useApiList } from "../utils/useApiList";
import { isToday, toHHMM } from "../utils/dates";

// The API stores `time_of_day` and `last_taken_at`; this page works with
// `time` and a simple `taken` flag ("taken today", in the user's timezone).
function fromApi(medication) {
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    time: toHHMM(medication.time_of_day),
    taken: isToday(medication.last_taken_at)
  };
}

function Medications() {

  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");

  const {
    items: medications,
    setItems: setMedications,
    loading,
    loadError,
    reload: loadMedications
  } = useApiList(
    "/medications",
    fromApi
  );

  const [saving, setSaving] = useState(false);

  const [assistantFilled, setAssistantFilled] =
    useState(false);


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

  async function handleSubmit(event) {

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

    setSaving(true);

    try {

      await apiRequest("/medications", {
        method: "POST",
        body: JSON.stringify({
          name,
          dosage,
          frequency,
          time_of_day: time
        })
      });

      await loadMedications();

    } catch (error) {

      alert(error.message);

      return;

    } finally {

      setSaving(false);

    }

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

  async function toggleTaken(id) {

    const medicine = medications.find(
      (item) => item.id === id
    );

    if (!medicine) {
      return;
    }

    try {

      const updated = await apiRequest(
        `/medications/${id}/taken`,
        {
          method: "PUT",
          body: JSON.stringify({ taken: !medicine.taken })
        }
      );

      setMedications(
        (previousMedications) =>
          previousMedications.map(
            (item) =>
              item.id === id
                ? fromApi(updated)
                : item
          )
      );

    } catch (error) {

      alert(error.message);

    }

  }


  // -----------------------------------------
  // DELETE
  // -----------------------------------------

  async function deleteMedication(id) {

    try {

      await apiRequest(`/medications/${id}`, { method: "DELETE" });

      setMedications(
        (previousMedications) =>
          previousMedications.filter(
            (medicine) => medicine.id !== id
          )
      );

    } catch (error) {

      alert(error.message);

    }

  }


  return (

    <main className="main-content">

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Medications
          </p>

          <h1>
            Medications 
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
            disabled={saving}
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


        </div>


        {loading ? (

          <div className="empty-state">
            <h3>Loading...</h3>
          </div>

        ) : loadError ? (

          <div className="empty-state">
            <h3>Could not load your medications</h3>
            <p>{loadError}</p>
          </div>

        ) : medications.length === 0 ? (

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