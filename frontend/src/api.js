const API_URL = import.meta.env.VITE_API_URL;

// FastAPI sends `detail` as a string for most errors, but as a list of
// objects for validation errors (422). Turn either into readable text.
function getErrorMessage(data) {

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        const field = item.loc?.slice(1).join(".");
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join(", ");
  }

  return "Something went wrong";
}

export async function apiRequest(
  endpoint,
  options = {}
) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // A non-JSON body (e.g. a 500 error page) shouldn't crash with a
  // parse error; fall through to the generic message instead.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}