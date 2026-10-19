import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useApiList } from "../utils/useApiList";

// The API stores the day as `logged_on`; this page works with `date`.
function fromApi(symptom) {
  return {
    id: symptom.id,
    symptom: symptom.symptom,
    severity: symptom.severity,
    date: symptom.logged_on,
    notes: symptom.notes ?? ""
  };
}

function Symptoms() {

  const location = useLocation();
  const navigate = useNavigate();

  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const {
    items: symptoms,
    setItems: setSymptoms,
    loading,
    loadError,
    reload: loadSymptoms
  } = useApiList(
    "/symptoms",
    fromApi
  );

  const [saving, setSaving] = useState(false);

  const [assistantFilled, setAssistantFilled] =
    useState(false);


  // -----------------------------------------
  // RECEIVE DATA FROM AI ASSISTANT
  // -----------------------------------------

  useEffect(() => {

    const prefill =
      location.state?.prefill;

    if (!prefill) {
      return;
    }

    if (prefill.symptom) {
      setSymptom(prefill.symptom);
    }

    if (prefill.severity) {
      setSeverity(prefill.severity);
    }

    if (prefill.date) {
      setDate(prefill.date);
    }

    if (prefill.notes) {
      setNotes(prefill.notes);
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
  // SAVE SYMPTOM
  // -----------------------------------------

  async function handleSubmit(event) {

    event.preventDefault();

    if (!symptom || !severity || !date) {

      alert(
        "Please fill in symptom, severity and date."
      );

      return;
    }

    setSaving(true);

    try {

      await apiRequest("/symptoms", {
        method: "POST",
        body: JSON.stringify({
          symptom,
          severity,
          logged_on: date,
          notes: notes || null
        })
      });

      await loadSymptoms();

    } catch (error) {

      alert(error.message);

      return;

    } finally {

      setSaving(false);

    }

    setSymptom("");
    setSeverity("");
    setDate("");
    setNotes("");

    setAssistantFilled(false);

    alert("Symptom saved successfully! 🩺");
  }


  // -----------------------------------------
  // DELETE SYMPTOM
  // -----------------------------------------

  async function deleteSymptom(id) {

    try {

      await apiRequest(`/symptoms/${id}`, { method: "DELETE" });

      setSymptoms(
        (previousSymptoms) =>
          previousSymptoms.filter(
            (item) => item.id !== id
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
            Home / Symptom Diary
          </p>

          <h1>
            Symptom Diary 
          </h1>

          <p className="subtitle">
            Record and monitor how you're feeling.
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
              before saving your symptom.
            </p>

          </div>

        </div>

      )}


      {/* FORM */}

      <div className="form-card">

        <div className="card-header">

          <div>

            <h2>
              Log a Symptom
            </h2>

            <p>
              Record your symptoms to maintain your health history.
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
                Symptom *
              </label>

              <input
                type="text"
                placeholder="Example: Headache"
                value={symptom}
                onChange={(event) =>
                  setSymptom(event.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Severity *
              </label>

              <select
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value)
                }
              >

                <option value="">
                  Select severity
                </option>

                <option value="Mild">
                  Mild
                </option>

                <option value="Moderate">
                  Moderate
                </option>

                <option value="Severe">
                  Severe
                </option>

              </select>

            </div>

          </div>


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
              Additional Notes
            </label>

            <textarea
              placeholder="Describe anything else you'd like to remember..."
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            Save Symptom
          </button>

        </form>

      </div>


      {/* HISTORY */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Symptom History
            </h2>

            <p>
              Your recently recorded symptoms
            </p>

          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            <h3>Loading...</h3>
          </div>

        ) : loadError ? (

          <div className="empty-state">
            <h3>Could not load your symptoms</h3>
            <p>{loadError}</p>
          </div>

        ) : symptoms.length === 0 ? (

          <div className="empty-state">

            <div>
              🩺
            </div>

            <h3>
              No symptoms recorded
            </h3>

            <p>
              Your symptom history will appear here.
            </p>

          </div>

        ) : (

          <div className="record-list">

            {symptoms.map((item) => (

              <div
                className="record-item"
                key={item.id}
              >

                <div className="record-main">

                  <div className="record-icon">
                    🩺
                  </div>

                  <div>

                    <h3>
                      {item.symptom}
                    </h3>

                    <p>
                      {item.notes ||
                        "No additional notes"}
                    </p>

                  </div>

                </div>


                <div className="record-details">

                  <span
                    className={`severity ${item.severity.toLowerCase()}`}
                  >
                    {item.severity}
                  </span>

                  <span>
                    {item.date}
                  </span>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      deleteSymptom(item.id)
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

export default Symptoms;