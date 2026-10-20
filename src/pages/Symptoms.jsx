import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Symptoms() {

  const location = useLocation();
  const navigate = useNavigate();

  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const [symptoms, setSymptoms] = useState(() => {

    try {
      const savedSymptoms =
        localStorage.getItem("cancercare_symptoms");

      return savedSymptoms
        ? JSON.parse(savedSymptoms)
        : [];

    } catch (error) {

      console.error(
        "Could not load symptoms:",
        error
      );

      return [];
    }
  });

  const [assistantFilled, setAssistantFilled] =
    useState(false);


  // -----------------------------------------
  // SAVE SYMPTOMS PERMANENTLY
  // -----------------------------------------

  useEffect(() => {

    localStorage.setItem(
      "cancercare_symptoms",
      JSON.stringify(symptoms)
    );

  }, [symptoms]);


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

  function handleSubmit(event) {

    event.preventDefault();

    if (!symptom || !severity || !date) {

      alert(
        "Please fill in symptom, severity and date."
      );

      return;
    }

    const newSymptom = {

      id: Date.now(),

      symptom,

      severity,

      date,

      notes

    };

    setSymptoms(
      (previousSymptoms) => [
        ...previousSymptoms,
        newSymptom
      ]
    );

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

  function deleteSymptom(id) {

    setSymptoms(
      (previousSymptoms) =>
        previousSymptoms.filter(
          (item) => item.id !== id
        )
    );

  }


  return (

    <main className="main-content">

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / Symptom Diary
          </p>

          <h1>
            Symptom Diary 🩺
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

          <span className="card-icon">
            🩺
          </span>

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

          <span className="card-icon">
            📋
          </span>

        </div>


        {symptoms.length === 0 ? (

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