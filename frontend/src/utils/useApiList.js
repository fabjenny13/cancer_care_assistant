import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "../api";

// Loads a list from the backend and keeps it in state.
//
//   endpoint  e.g. "/symptoms"
//   fromApi   converts one API record into the shape the page renders
//             (must be a stable reference, e.g. defined at module level)
//
// Returns the items plus loading / error state, `setItems` for local
// changes (e.g. after a delete), and `reload` to re-fetch from the server
// (e.g. after a create, so the list keeps the server's ordering).
export function useApiList(endpoint, fromApi) {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const reload = useCallback(async () => {

    try {

      const data = await apiRequest(endpoint);

      setItems(data.map(fromApi));
      setLoadError("");

    } catch (error) {

      setLoadError(error.message);

    } finally {

      setLoading(false);

    }

  }, [endpoint, fromApi]);

  // Initial load. `ignore` stops a late response from updating state
  // after the page has been left (or the effect re-run).
  useEffect(() => {

    let ignore = false;

    apiRequest(endpoint)
      .then((data) => {

        if (!ignore) {
          setItems(data.map(fromApi));
          setLoadError("");
        }

      })
      .catch((error) => {

        if (!ignore) {
          setLoadError(error.message);
        }

      })
      .finally(() => {

        if (!ignore) {
          setLoading(false);
        }

      });

    return () => {
      ignore = true;
    };

  }, [endpoint, fromApi]);

  return { items, setItems, loading, loadError, reload };
}
