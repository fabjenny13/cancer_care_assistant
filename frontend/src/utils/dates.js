// Date/time helpers for talking to the backend.

// Calendar date (YYYY-MM-DD) in the user's own timezone.
// Accepts a Date or an ISO timestamp string from the API.
export function toLocalDateString(value) {

  // The API sends microsecond precision ("...30.123456+00:00");
  // trim to milliseconds so every browser parses it.
  const date =
    value instanceof Date
      ? value
      : new Date(String(value).replace(/(\.\d{3})\d+/, "$1"));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// True if an ISO timestamp falls on today's date for the user.
export function isToday(isoTimestamp) {

  if (!isoTimestamp) {
    return false;
  }

  return (
    toLocalDateString(isoTimestamp) ===
    toLocalDateString(new Date())
  );
}

// "08:30:00" (API) -> "08:30" (what <input type="time"> uses)
export function toHHMM(time) {
  return time ? time.slice(0, 5) : "";
}
