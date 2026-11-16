import { useEffect, useRef, useState } from 'react';

// True once a sticky element has reached its `top` offset. Put the returned ref on an
// empty element placed directly above the sticky one.
export function useStuck(topPx) {
  const sentinel = useRef(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      rootMargin: `-${topPx + 1}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [topPx]);

  return [sentinel, stuck];
}
