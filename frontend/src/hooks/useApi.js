import { useCallback, useEffect, useRef, useState } from "react";

export default function useApi(asyncFunc, { immediate = false, params } = {}) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError("");
      try {
        const res = await asyncFunc(
          ...(args.length ? args : params ? [params] : [])
        );
        if (mounted.current) setData(res);
        return res;
      } catch (err) {
        if (mounted.current) setError(err.message || "Request failed");
        throw err;
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [asyncFunc, params]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { data, error, loading, run, reset, setData };
}
