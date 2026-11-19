import { useCallback, useEffect, useRef, useState } from "react";

// Loads data from an async function and exposes loading / error state.
//
//   const { data, loading, error, reload } = useApi(() => listMyApplications());
//
// `deps` re-runs the request when they change. A failed request never
// leaves the page in a permanent loading state. `loading` starts true, so
// the first render shows the loading UI without an extra state update.
export default function useApi(fetcher, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
  });

  const [reloadCount, setReloadCount] = useState(0);

  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        setState({
          data: null,
          loading: false,
          error: error.message || "Something went wrong.",
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setReloadCount((count) => count + 1);
  }, []);

  return { ...state, reload };
}
