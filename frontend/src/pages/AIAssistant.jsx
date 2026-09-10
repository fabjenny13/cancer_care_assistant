import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AIAssistant() {

  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);


  // const [messages, setMessages] = useState([
  //   {
  //     id: 1,
  //     sender: "ai",
  //     text: "Hello 💙 I'm your CancerCare AI Assistant. I'm here to listen, help you organize your health information, and guide you toward appropriate support."
  //   },
  //   {
  //     id: 2,
  //     sender: "ai",
  //     text: "You can type your thoughts or use the microphone 🎤 if you'd rather speak."
  //   }
  // ]);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const voiceSentRef = useRef(false);


  const suggestions = [
    "I'm feeling worried today",
    "Help me record a symptom",
    "I want to prepare for my appointment",
    "I need help organizing my medicines"
  ];

// =====================================================
// LOAD CONVERSATIONS
// =====================================================

useEffect(() => {
  async function loadConversations() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://localhost:8000/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();

      setConversations(data);

      // Load the most recent conversation initially
      if (data.length > 0) {
        setConversationId(data[0].id);
      } else {
        // No conversations yet → create one
        const createResponse = await fetch(
          "http://localhost:8000/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              title: "CancerCare Assistant"
            })
          }
        );

        if (!createResponse.ok) {
          throw new Error("Failed to create conversation");
        }

        const newConversation = await createResponse.json();

        setConversations([newConversation]);
        setConversationId(newConversation.id);
      }
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    }
  }

  loadConversations();
}, []);



// =====================================================
// LOAD MESSAGES FOR SELECTED CONVERSATION
// =====================================================

useEffect(() => {
  if (!conversationId) return;

  let cancelled = false;

  async function loadMessages() {
    const token = localStorage.getItem("access_token");

    setLoadingMessages(true);
    setMessages([]);

    try {
      const response = await fetch(
        `http://localhost:8000/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const savedMessages = await response.json();

      // Ignore this response if user switched conversations
      if (cancelled) return;

      setMessages(
        savedMessages.map((message) => ({
          id: message.id,
          sender:
            message.sender === "ASSISTANT"
              ? "ai"
              : "user",
          text: message.content
        }))
      );

    } catch (error) {
      // Ignore errors from cancelled requests
      if (cancelled) return;

      console.error(
        "Failed to load messages:",
        error
      );

      setMessages([]);

    } finally {
      if (!cancelled) {
        setLoadingMessages(false);
      }
    }
  }

  loadMessages();

  // Runs when conversationId changes
  return () => {
    cancelled = true;
  };

}, [conversationId]);


  // =====================================================
  // DATE HELPER
  // =====================================================

  function getDateString(dayOffset = 0) {

    const date = new Date();

    date.setDate(date.getDate() + dayOffset);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  // =====================================================
  // TIME HELPER
  // =====================================================

  function convertTimeTo24Hour(timeText) {

    const match = timeText.match(
      /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i
    );

    if (!match) {
      return "";
    }

    let hour = parseInt(match[1], 10);

    const minutes = match[2] || "00";

    const period = match[3]?.toLowerCase();

    if (period === "pm" && hour < 12) {
      hour += 12;
    }

    if (period === "am" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  }


  // =====================================================
  // EXTRACT APPOINTMENT INFORMATION
  // =====================================================

  function parseAppointmentCommand(text) {

    const lower = text.toLowerCase();

    const isAppointmentCommand =
      lower.includes("add an appointment") ||
      lower.includes("add appointment") ||
      lower.includes("book an appointment") ||
      lower.includes("book appointment") ||
      lower.includes("schedule an appointment") ||
      lower.includes("schedule appointment") ||
      lower.includes("create an appointment") ||
      lower.includes("create appointment");

    if (!isAppointmentCommand) {
      return null;
    }


    // -------------------------------------------------
    // DOCTOR
    // -------------------------------------------------

    let doctor = "";

    const doctorMatch = text.match(
      /\b(?:with|doctor|dr\.?)\s+(?:dr\.?\s*)?([A-Za-z]+(?:\s+[A-Za-z]+)?)(?=\s+(?:tomorrow|today|on|at|\d{1,2}(?::\d{2})?\s*(?:am|pm)|consultation|follow[- ]?up|treatment|test|scan)\b|$)/i
    );

    if (doctorMatch) {

      const doctorName =
        doctorMatch[1].trim();

      doctor =
        `Dr. ${doctorName}`;

    }


    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    let date = "";

    if (/\btomorrow\b/i.test(text)) {

      date = getDateString(1);

    } else if (/\btoday\b/i.test(text)) {

      date = getDateString(0);

    } else {

      const isoDateMatch = text.match(
        /\b(20\d{2}-\d{2}-\d{2})\b/
      );

      if (isoDateMatch) {
        date = isoDateMatch[1];
      }

    }


    // -------------------------------------------------
    // TIME
    // -------------------------------------------------

    let time = "";

    const timeMatch = text.match(
      /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i
    );

    if (timeMatch) {

      time = convertTimeTo24Hour(
        timeMatch[1]
      );

    }


    // -------------------------------------------------
    // APPOINTMENT TYPE
    // -------------------------------------------------

    let type = "Consultation";

    if (
      /\bfollow[- ]?up\b/i.test(text)
    ) {

      type = "Follow-up";

    } else if (
      /\btreatment\b/i.test(text)
    ) {

      type = "Treatment";

    } else if (
      /\b(?:test|scan)\b/i.test(text)
    ) {

      type = "Test / Scan";

    } else if (
      /\bother\b/i.test(text)
    ) {

      type = "Other";

    }


    // -------------------------------------------------
    // RETURN DATA
    // -------------------------------------------------

    return {
      doctor,
      hospital: "",
      date,
      time,
      type,
      notes: "Added with help from AI Assistant."
    };

  }


  // =====================================================
  // AI RESPONSE
  // =====================================================

  function getAIResponse(userMessage) {

    const text =
      userMessage.toLowerCase();


    if (
      text.includes("worried") ||
      text.includes("anxious") ||
      text.includes("scared") ||
      text.includes("stress")
    ) {

      return "I'm sorry you're feeling this way 💙. It's okay to take things one step at a time. You can tell me more about what's worrying you, or we can help you prepare what you'd like to discuss with your healthcare professional.";

    }


    if (
      text.includes("symptom") ||
      text.includes("pain") ||
      text.includes("tired") ||
      text.includes("nausea")
    ) {

      return "Thank you for sharing that with me 💙. You can record what you're experiencing in your Symptom Diary, including the severity and any notes. If a symptom is severe, sudden, worsening, or concerning, please seek appropriate medical care.";

    }


    if (
      text.includes("medicine") ||
      text.includes("medication") ||
      text.includes("tablet") ||
      text.includes("dose")
    ) {

      return "I can help you stay organized with your medication schedule 💊. You can use the Medications section to record the medicine name, dosage, frequency and reminder time. For questions about changing or stopping medication, please speak with your healthcare professional.";

    }


    if (
      text.includes("appointment") ||
      text.includes("doctor") ||
      text.includes("hospital")
    ) {

      return "Of course 📅. I can help you organize your appointment details, including your doctor, date, time and appointment type.";

    }


    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {

      return "Hello! 😊 I'm glad you reached out. How can I support you today?";

    }


    if (text.includes("thank")) {

      return "You're very welcome 💙. I'm here whenever you need help organizing your health information.";

    }


    return "Thank you for sharing that with me 💙. I can help you organize information, track symptoms, prepare for appointments, and manage your wellbeing information. For urgent or serious concerns, please contact your healthcare team or appropriate emergency services.";

  }


  // =====================================================
  // TEXT TO SPEECH
  // =====================================================

  function speakResponse(text) {

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);

  }


  function stopSpeaking() {

    if ("speechSynthesis" in window) {

      window.speechSynthesis.cancel();

      setIsSpeaking(false);

    }

  }


  // =====================================================
  // HANDLE COMMAND
  // =====================================================

  function handleCommand(text) {

    const lower =
      text.toLowerCase();


    // -----------------------------------------------
    // ADD APPOINTMENT
    // -----------------------------------------------

    const appointmentData =
      parseAppointmentCommand(text);

    if (appointmentData) {

      navigate("/appointments", {
        state: {
          prefill: appointmentData,
          fromAssistant: true
        }
      });

      return "I've opened your Appointments section 📅 and filled in the information I could understand. Please review the details and click Add Appointment when everything is correct.";

    }


    // -----------------------------------------------
    // OPEN APPOINTMENTS
    // -----------------------------------------------

    if (
      lower.includes("open my appointments") ||
      lower.includes("open appointments") ||
      lower.includes("go to appointments") ||
      lower.includes("show my appointments")
    ) {

      navigate("/appointments");

      return "I've opened your Appointments section 📅.";

    }


    // -----------------------------------------------
    // OPEN SYMPTOMS
    // -----------------------------------------------

    if (
      lower.includes("open symptoms") ||
      lower.includes("open symptom diary") ||
      lower.includes("go to symptoms") ||
      lower.includes("show my symptoms")
    ) {

      navigate("/symptoms");

      return "I've opened your Symptom Diary 🩺.";

    }


    // -----------------------------------------------
    // OPEN MEDICATIONS
    // -----------------------------------------------

    if (
      lower.includes("open medications") ||
      lower.includes("open medicines") ||
      lower.includes("go to medications") ||
      lower.includes("show my medications")
    ) {

      navigate("/medications");

      return "I've opened your Medications section 💊.";

    }


    // -----------------------------------------------
    // OPEN MOOD
    // -----------------------------------------------

    if (
      lower.includes("open mood") ||
      lower.includes("open wellness") ||
      lower.includes("go to mood") ||
      lower.includes("show my mood")
    ) {

      navigate("/mood");

      return "I've opened your Mood & Wellness section 😊.";

    }


    // -----------------------------------------------
    // HELP RECORD SYMPTOM
    // -----------------------------------------------

    if (
      lower.includes("help me record a symptom") ||
      lower.includes("record a symptom")
    ) {

      navigate("/symptoms");

      return "I've opened your Symptom Diary 🩺. You can enter the symptom details there.";

    }


    // -----------------------------------------------
    // PREPARE APPOINTMENT
    // -----------------------------------------------

    if (
      lower.includes("prepare for my appointment") ||
      lower.includes("prepare for appointment")
    ) {

      navigate("/appointments");

      return "I've opened your Appointments section 📅 so you can review your appointment details and prepare your questions.";

    }


    // -----------------------------------------------
    // ORGANIZE MEDICINES
    // -----------------------------------------------

    if (
      lower.includes("organizing my medicines") ||
      lower.includes("organize my medicines") ||
      lower.includes("organize my medication")
    ) {

      navigate("/medications");

      return "I've opened your Medications section 💊 so you can organize your medication schedule.";

    }


    return null;

  }

 
  // =====================================================
  // SEND MESSAGE
  // =====================================================


   function generateConversationTitle(text) {
  const cleanedText = text.trim();

  if (cleanedText.length <= 35) {
    return cleanedText;
  }

  return cleanedText.substring(0, 35).trim() + "...";
}


async function sendMessage(textToSend = message) {
  const text = textToSend.trim();

  if (!text || !conversationId) return;

  const token = localStorage.getItem("access_token");
  
  const isFirstMessage = messages.length === 0;


  setMessage("");

  try {
    // 1. Save user message to backend
    const userResponse = await fetch(
      `http://localhost:8000/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: text
        })
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to save user message");
    }

    const savedUserMessage = await userResponse.json();

    // 2. Display user message
    setMessages((prev) => [
      ...prev,
      {
        id: savedUserMessage.id,
        sender: "user",
        text: savedUserMessage.content
      }
    ]);


    if (isFirstMessage) {
  const newTitle = generateConversationTitle(text);

  try {
    const titleResponse = await fetch(
      `http://localhost:8000/conversations/${conversationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle
        })
      }
    );

    if (titleResponse.ok) {
      const updatedConversation =
        await titleResponse.json();

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: updatedConversation.title
              }
            : conversation
        )
      );
    }
  } catch (error) {
    console.error(
      "Failed to update conversation title:",
      error
    );
  }
}

    // 3. command handling
    const commandResponse = handleCommand(text);

    // 4. Generate AI response
    setTimeout(async () => {
      const aiText = commandResponse || getAIResponse(text);

      // Display AI response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: aiText
        }
      ]);

      // 5. Save AI response to backend
      try {
        await fetch(
          `http://localhost:8000/conversations/${conversationId}/messages/ai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              content: aiText
            })
          }
        );
      } catch (error) {
        console.error("Failed to save AI message:", error);
      }

      speakText(aiText);
    }, 500);

  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

  // =====================================================
  // VOICE INPUT
  // =====================================================

  function startListening() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;

    }


    if (isListening) {

      recognitionRef.current?.stop();

      setIsListening(false);

      return;

    }


    const recognition =
      new SpeechRecognition();


    recognitionRef.current =
      recognition;


    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.lang = "en-IN";


    voiceSentRef.current = false;


    recognition.onstart = () => {

      setIsListening(true);

    };


    recognition.onresult = (event) => {

      let finalTranscript = "";

      let interimTranscript = "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const transcript =
          event.results[i][0].transcript;


        if (
          event.results[i].isFinal
        ) {

          finalTranscript += transcript;

        } else {

          interimTranscript += transcript;

        }

      }


      const currentText =
        finalTranscript ||
        interimTranscript;


      setMessage(currentText);


      // Automatically send final voice message

      if (
        finalTranscript.trim() &&
        !voiceSentRef.current
      ) {

        voiceSentRef.current = true;

        sendMessage(
          finalTranscript.trim()
        );

      }

    };


    recognition.onend = () => {

      setIsListening(false);

    };


    recognition.onerror = (event) => {

      console.log(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

    };


    try {

      recognition.start();

    } catch (error) {

      console.log(
        "Could not start speech recognition:",
        error
      );

      setIsListening(false);

    }

  }


  // =====================================================
  // ENTER KEY
  // =====================================================

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <main className="main-content ai-page">

      <div className="top-header">

        <div>

          <p className="breadcrumb">
            Home / AI Assistant
          </p>

          <h1>
            AI Assistant 🤖
          </h1>

          <p className="subtitle">
            A supportive space to ask questions, share concerns,
            and organize your health information.
          </p>

        </div>

      </div>


      <section className="ai-welcome-card">

        <div className="ai-avatar-large">
          🤖
        </div>

        <div>

          <div className="ai-status">

            <span className="status-dot"></span>

            CancerCare AI Assistant

          </div>

          <h2>
            I'm here to listen. 💙
          </h2>

          <p>
            Type your thoughts or use the microphone
            if you'd rather speak.
          </p>

        </div>

      </section>


      <section className="chat-card">

        <div className="chat-layout">

        {/* ================= CHAT HISTORY ================= */}

        <aside className="chat-history">

          <div className="history-header">
            <h3>Chat History</h3>

            <button
              className="new-chat-button"
              onClick={async () => {
                const token = localStorage.getItem("access_token");
              
                try {
                  const response = await fetch(
                    "http://localhost:8000/conversations",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        title: "CancerCare Assistant"
                      })
                    }
                  );
                
                  if (!response.ok) {
                    throw new Error("Failed to create conversation");
                  }
                
                  const newConversation = await response.json();
                
                  setConversations((prev) => [
                    newConversation,
                    ...prev
                  ]);
                
                  setConversationId(newConversation.id);
                
                } catch (error) {
                  console.error(
                    "Failed to create conversation:",
                    error
                  );
                }
              }}
            >
              + New Chat
            </button>
          </div>
            
            
          <div className="conversation-list">
            
            {conversations.map((conversation) => (
            
              <button
                key={conversation.id}
                className={
                  conversation.id === conversationId
                    ? "conversation-item active"
                    : "conversation-item"
                }
                onClick={() => {
                  setConversationId(conversation.id);
                }}
              >
                <span className="conversation-icon">
                  💬
                </span>
              
                <span className="conversation-title">
                  {conversation.title || "CancerCare Assistant"}
                </span>
              </button>

            ))}

    </div>

  </aside>


  {/* ================= ACTUAL CHAT ================= */}

  <div className="chat-main">

        <div className="chat-header">

      <div className="chat-title">
        <div className="chat-avatar">
          🤖
        </div>

        <div>
          <h2>
            CancerCare Assistant
          </h2>

          <span>
            Voice & Text Support • Patient-friendly
          </span>
        </div>
      </div>

      <div className="online-status">
        <span></span>
        Online
      </div>

        </div>

        <div className="chat-messages">

  {loadingMessages ? (
    <div className="messages-loader">
      <div className="loader-spinner"></div>
      <p>Loading conversation...</p>
    </div>
  ) : (
    messages.map((item) => (
      <div
        key={item.id}
        className={
          item.sender === "user"
            ? "message-row user-message-row"
            : "message-row"
        }
      >
        {item.sender === "ai" && (
          <div className="message-avatar">
            🤖
          </div>
        )}

        <div
          className={
            item.sender === "user"
              ? "message-bubble user-bubble"
              : "message-bubble ai-bubble"
          }
        >
          {item.text}
        </div>

        {item.sender === "ai" && (
          <button
            className="speak-message-button"
            onClick={() => speakResponse(item.text)}
            title="Read response aloud"
          >
            🔊
          </button>
        )}

        {item.sender === "user" && (
          <div className="message-avatar user-avatar-chat">
            P
          </div>
        )}
      </div>
    ))
  )}

</div>


        <div className="suggestions-section">

          <span>
            You can ask:
          </span>

          <div className="suggestion-list">

            {suggestions.map((suggestion) => (

              <button
                key={suggestion}
                onClick={() =>
                  sendMessage(suggestion)
                }
              >
                {suggestion}
              </button>

            ))}

          </div>

        </div>


        <div className="chat-input-section">

          <div className="typing-box">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening... speak now 🎤"
                  : "Type or speak what you'd like to share..."
              }
              rows="2"
            />


            <button
              className={
                isListening
                  ? "mic-button listening"
                  : "mic-button"
              }
              onClick={startListening}
              title={
                isListening
                  ? "Stop listening"
                  : "Speak your message"
              }
            >

              {isListening
                ? "⏹️"
                : "🎤"}

            </button>


            <button
              className="send-button"
              onClick={() =>
                sendMessage()
              }
              disabled={!message.trim()}
              title="Send message"
            >

              ➤

            </button>

          </div>


          <p className="typing-hint">

            {isListening
              ? "Listening to your voice..."
              : "Type your message or click 🎤 to speak • Press Enter to send"}

          </p>


          {isSpeaking && (

            <div className="speaking-indicator">

              🔊 Assistant is speaking...

              <button
                onClick={stopSpeaking}
              >
                Stop
              </button>

            </div>

          )}

        </div>


        <div className="ai-disclaimer">

          <span>
            🛡️
          </span>

          <div>

            <strong>
              Important
            </strong>

            <p>
              This AI Assistant provides supportive information
              and organizational help. It is not a doctor and
              does not provide a medical diagnosis. For urgent
              or serious concerns, contact your healthcare
              professional or appropriate emergency services.
            </p>

          </div>

        </div>

      </div> {/* chat-main */}

        </div> {/* chat-layout */}

      </section>

    </main>

  );

}

export default AIAssistant;