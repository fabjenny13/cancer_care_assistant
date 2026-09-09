function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getTomorrowDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function parseDate(text) {

  const lowerText = text.toLowerCase();

  if (lowerText.includes("today")) {
    return getTodayDate();
  }

  if (lowerText.includes("tomorrow")) {
    return getTomorrowDate();
  }

  const dateMatch = text.match(
    /\b(20\d{2})-(\d{2})-(\d{2})\b/
  );

  if (dateMatch) {
    return dateMatch[0];
  }

  return "";
}


function parseTime(text) {

  const lowerText = text.toLowerCase();

  const match = lowerText.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/
  );

  if (!match) {
    return "";
  }

  let hour = parseInt(match[1]);
  const minute = match[2] || "00";
  const period = match[3];

  if (period === "pm" && hour !== 12) {
    hour += 12;
  }

  if (period === "am" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${minute}`;
}


/* =========================================
   PAGE NAVIGATION
========================================= */

export function getNavigationCommand(message) {

  const text = message.toLowerCase().trim();


  if (
    text.includes("open dashboard") ||
    text.includes("go to dashboard") ||
    text.includes("show dashboard") ||
    text === "dashboard"
  ) {
    return {
      path: "/dashboard",
      response: "Of course 💙. I've opened your Dashboard."
    };
  }


  if (
    text.includes("open symptom") ||
    text.includes("go to symptom") ||
    text.includes("show symptom") ||
    text.includes("symptom diary")
  ) {
    return {
      path: "/symptoms",
      response: "I've opened your Symptom Diary 🩺."
    };
  }


  if (
    text.includes("open appointment") ||
    text.includes("go to appointment") ||
    text.includes("show appointment") ||
    text === "appointments"
  ) {
    return {
      path: "/appointments",
      response: "I've opened your Appointments page 📅."
    };
  }


  if (
    text.includes("open medication") ||
    text.includes("open medicine") ||
    text.includes("go to medication") ||
    text.includes("go to medicine") ||
    text.includes("show medication") ||
    text.includes("show medicine")
  ) {
    return {
      path: "/medications",
      response: "I've opened your Medications page 💊."
    };
  }


  if (
    text.includes("open mood") ||
    text.includes("go to mood") ||
    text.includes("mood tracker") ||
    text.includes("wellness")
  ) {
    return {
      path: "/mood",
      response: "I've opened your Mood & Wellness page 😊."
    };
  }


  if (
    text.includes("open ai assistant") ||
    text.includes("go to ai assistant")
  ) {
    return {
      path: "/ai-assistant",
      response: "You're already using the AI Assistant 🤖."
    };
  }

  return null;
}


/* =========================================
   APPOINTMENT COMMAND
========================================= */

export function parseAppointmentCommand(message) {

  const text = message.toLowerCase();

  const appointmentWords = [
    "add appointment",
    "book appointment",
    "schedule appointment",
    "create appointment"
  ];

  const isAppointmentCommand =
    appointmentWords.some((word) =>
      text.includes(word)
    );

  if (!isAppointmentCommand) {
    return null;
  }


  let doctor = "";

  const doctorMatch = message.match(
    /(?:with|doctor|dr\.?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );

  if (doctorMatch) {
    doctor = doctorMatch[1];

    if (!doctor.toLowerCase().startsWith("dr")) {
      doctor = `Dr. ${doctor}`;
    }
  }


  let type = "";

  if (text.includes("follow-up") || text.includes("follow up")) {
    type = "Follow-up";
  } else if (text.includes("treatment")) {
    type = "Treatment";
  } else if (
    text.includes("test") ||
    text.includes("scan")
  ) {
    type = "Test / Scan";
  } else {
    type = "Consultation";
  }


  const date = parseDate(message);
  const time = parseTime(message);


  return {
    path: "/appointments",

    prefill: {
      doctor,
      hospital: "",
      date,
      time,
      type,
      notes: ""
    },

    response:
      "I've opened Appointments and filled in the information I could understand. Please review it before saving."
  };
}


/* =========================================
   SYMPTOM COMMAND
========================================= */

export function parseSymptomCommand(message) {

  const text = message.toLowerCase();


  const symptomWords = [
    "record symptom",
    "log symptom",
    "add symptom",
    "save symptom",
    "record pain",
    "log pain"
  ];


  const isSymptomCommand =
    symptomWords.some((word) =>
      text.includes(word)
    );


  if (!isSymptomCommand) {
    return null;
  }


  let severity = "";

  if (text.includes("severe")) {
    severity = "Severe";
  } else if (text.includes("moderate")) {
    severity = "Moderate";
  } else if (text.includes("mild")) {
    severity = "Mild";
  }


  let symptom = "";

  const symptomMatch = message.match(
    /(?:record|log|add|save)\s+(?:a\s+)?(?:symptom\s+)?([A-Za-z\s]+?)(?:\s+(?:mild|moderate|severe))?(?:\s+(?:today|tomorrow|\d{4}-\d{2}-\d{2}))?$/i
  );


  if (symptomMatch) {
    symptom = symptomMatch[1].trim();
  }


  if (
    !symptom ||
    symptom.toLowerCase() === "symptom"
  ) {
    symptom = "";
  }


  return {
    path: "/symptoms",

    prefill: {
      symptom,
      severity,
      date: parseDate(message),
      notes: ""
    },

    response:
      "I've opened your Symptom Diary and filled in the information I could understand. Please review it before saving."
  };
}


/* =========================================
   MEDICATION COMMAND
========================================= */

export function parseMedicationCommand(message) {

  const text = message.toLowerCase();


  const medicationWords = [
    "add medication",
    "add medicine",
    "record medication",
    "record medicine",
    "save medication",
    "save medicine"
  ];


  const isMedicationCommand =
    medicationWords.some((word) =>
      text.includes(word)
    );


  if (!isMedicationCommand) {
    return null;
  }


  let frequency = "";

  if (
    text.includes("three times") ||
    text.includes("3 times")
  ) {
    frequency = "Three times daily";
  } else if (
    text.includes("twice") ||
    text.includes("two times")
  ) {
    frequency = "Twice daily";
  } else if (
    text.includes("once daily") ||
    text.includes("once a day")
  ) {
    frequency = "Once daily";
  } else if (text.includes("as needed")) {
    frequency = "As needed";
  }


  let dosage = "";

  const dosageMatch = message.match(
    /\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|mL)\b/i
  );

  if (dosageMatch) {
    dosage = dosageMatch[0];
  }


  let time = parseTime(message);


  let name = "";

  const nameMatch = message.match(
    /(?:add|record|save)\s+(?:medication|medicine)?\s*([A-Za-z][A-Za-z\s]*?)(?=\s+\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|mL)\b|\s+(?:once|twice|three times|as needed)|\s+at\s+|\s*$)/i
  );


  if (nameMatch) {
    name = nameMatch[1].trim();
  }


  return {
    path: "/medications",

    prefill: {
      name,
      dosage,
      frequency,
      time
    },

    response:
      "I've opened Medications and filled in the information I could understand. Please review it before saving."
  };
}


/* =========================================
   MAIN COMMAND DETECTOR
========================================= */

export function getAssistantCommand(message) {

  const appointmentCommand =
    parseAppointmentCommand(message);

  if (appointmentCommand) {
    return appointmentCommand;
  }


  const symptomCommand =
    parseSymptomCommand(message);

  if (symptomCommand) {
    return symptomCommand;
  }


  const medicationCommand =
    parseMedicationCommand(message);

  if (medicationCommand) {
    return medicationCommand;
  }


  return getNavigationCommand(message);
}