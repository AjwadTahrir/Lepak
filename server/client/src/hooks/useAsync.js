import { useCallback, useEffect, useRef, useState } from 'react';

// Runs `fn` whenever `key` changes and tracks loading / data / error.
// `loading` is derived (the stored result belongs to an older key), so no state is set during render.
export function useAsync(fn, key) {
  const [result, setResult] = useState({ key: null });
  const [attempt, setAttempt] = useState(0);
  const fullKey = `${key}#${attempt}`;

  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  useEffect(() => {
    let alive = true;
    fnRef.current().then(
      (data) => alive && setResult({ key: fullKey, data }),
      (error) => alive && setResult({ key: fullKey, error }),
    );
    return () => { alive = false; };
  }, [fullKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = result.key !== fullKey;
  return { loading, data: loading ? undefined : result.data, error: loading ? undefined : result.error, retry };
}
