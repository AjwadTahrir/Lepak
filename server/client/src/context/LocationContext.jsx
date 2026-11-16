import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AREAS } from '../data/areas.js';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [place, setPlace] = useState({ ...AREAS[0], source: 'default' });
  const [status, setStatus] = useState('idle');      // idle | locating | denied | unavailable

  const chooseArea = useCallback((area) => {
    setPlace({ ...area, source: 'area' });
    setStatus('idle');
  }, []);

  // Only asks for permission when the user taps "Use my location"
  const locateMe = useCallback(() => new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return resolve(false);
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPlace({ id: 'gps', label: 'Near you', lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps' });
        setStatus('idle');
        resolve(true);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
        resolve(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }), []);

  const value = useMemo(() => ({ place, status, chooseArea, locateMe }), [place, status, chooseArea, locateMe]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used inside LocationProvider');
  return ctx;
}
