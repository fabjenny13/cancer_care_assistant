import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useApiList } from "../utils/useApiList";
import { toLocalDateString } from "../utils/dates";

// The API stores `emotion` and a timestamp; this page works with `mood`
// and a calendar date in the user's own timezone.
function fromApi(entry) {
  return {
    id: entry.id,
    mood: entry.emotion,
    date: toLocalDateString(entry.created_at)
  };
}

function Mood() {

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] =
    useState("");

  const {
    items: moodHistory,
    setItems: setMoodHistory,
    loading,
    loadError,
    reload: loadMoods
  } = useApiList(
    "/mood?source=MANUAL",
    fromApi
  );

  const [saving, setSaving] = useState(false);


  const [assistantFilled, setAssistantFilled] =
    useState(false);


  const moods = [

    {
      value: "Very Low",
      emoji: "😢"
    },

    {
      value: "Low",
      emoji: "😟"
    },

    {
      value: "Neutral",
      emoji: "😐"
    },

    {
      value: "Good",
      emoji: "🙂"
    },

    {
      value: "Very Good",
      emoji: "😄"
    }

  ];


  // -----------------------------------------
  // RECEIVE AI PREFILL
  // -----------------------------------------

  useEffect(() => {

    const prefill =
      location.state?.prefill;

    if (!prefill) {
      return;
    }

    if (prefill.mood) {

      const validMood =
        moods.find(
          (item) =>
            item.value.toLowerCase() ===
            prefill.mood.toLowerCase()
        );

      if (validMood) {

        setSelectedMood(
          validMood.value
        );

        setAssistantFilled(true);

      }

    }

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
  // SAVE MOOD
  // -----------------------------------------

  async function saveMood() {

    if (!selectedMood) {

      alert(
        "Please select your mood first."
      );

      return;

    }


    setSaving(true);

    try {

      await apiRequest("/mood", {
        method: "POST",
        body: JSON.stringify({
          emotion: selectedMood,
          source: "MANUAL"
        })
      });

      await loadMoods();

    } catch (error) {

      alert(error.message);

      return;

    } finally {

      setSaving(false);

    }


    setSelectedMood("");

    setAssistantFilled(false);


    alert(
      `Today's mood saved as ${selectedMood}. 😊`
    );

  }


  // -----------------------------------------
  // DELETE MOOD
  // -----------------------------------------

  async function deleteMood(id) {

    try {

      await apiRequest(`/mood/${id}`, { method: "DELETE" });

      setMoodHistory(
        (previousMoods) =>
          previousMoods.filter(
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
            Home / Mood & Wellness
          </p>

          <h1>
            Mood & Wellness 
          </h1>

          <p className="subtitle">
            Take a moment to check in with your emotional wellbeing.
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
              AI Assistant selected your mood
            </strong>

            <p>
              Please review the selection before saving.
            </p>

          </div>

        </div>

      )}


      {/* MOOD SELECTION */}

      <div className="dashboard-card mood-card">

        <div className="card-header">

          <div>

            <h2>
              How are you feeling today?
            </h2>

            <p>
              Select the option that best describes how you feel.
            </p>

          </div>


        </div>


        <div className="mood-options">

          {moods.map((mood) => (

            <button
              type="button"
              key={mood.value}
              className={
                selectedMood === mood.value
                  ? "mood-option selected"
                  : "mood-option"
              }
              onClick={() =>
                setSelectedMood(
                  mood.value
                )
              }
            >

              <span>
                {mood.emoji}
              </span>

              <small>
                {mood.value}
              </small>

            </button>

          ))}

        </div>


        <button
          type="button"
          className="primary-button mood-save"
          onClick={saveMood}
          disabled={saving}
        >
          Save Today's Mood
        </button>

      </div>


      {/* MOOD HISTORY */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>

            <h2>
              Mood History
            </h2>

            <p>
              Your recorded wellbeing check-ins
            </p>

          </div>


        </div>


        {loading ? (

          <div className="empty-state">
            <h3>Loading...</h3>
          </div>

        ) : loadError ? (

          <div className="empty-state">
            <h3>Could not load your mood history</h3>
            <p>{loadError}</p>
          </div>

        ) : moodHistory.length === 0 ? (

          <div className="empty-state">

            <div>
              📊
            </div>

            <h3>
              No mood history yet
            </h3>

            <p>
              Continue recording your mood to build your wellness history.
            </p>

          </div>

        ) : (

          <div className="record-list">

            {moodHistory.map((item) => {

              const mood =
                moods.find(
                  (moodItem) =>
                    moodItem.value ===
                    item.mood
                );

              return (

                <div
                  className="record-item"
                  key={item.id}
                >

                  <div className="record-main">

                    <div className="record-icon">
                      {mood?.emoji || "😊"}
                    </div>

                    <div>

                      <h3>
                        {item.mood}
                      </h3>

                      <p>
                        Wellness check-in
                      </p>

                    </div>

                  </div>


                  <div className="record-details">

                    <strong>
                      {item.date}
                    </strong>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteMood(
                          item.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>


      {/* WELLNESS NOTE */}

      <div className="wellness-note">

        <span>
          💙
        </span>

        <div>

          <strong>
            Remember
          </strong>

          <p>
            Your mood entries are intended to help you reflect
            on your wellbeing over time. They are not a medical diagnosis.
          </p>

        </div>

      </div>

    </main>

  );

}

export default Mood;