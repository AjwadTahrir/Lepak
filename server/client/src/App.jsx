import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import Explore from './pages/Explore.jsx';
import Events from './pages/Events.jsx';
import Saved from './pages/Saved.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { SavedProvider } from './context/SavedContext.jsx';

// Future screens slot in here: /results, /surprise, /events/new, /login, /admin
export default function App() {
  return (
    <LocationProvider>
      <SavedProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Explore />} />
              <Route path="events" element={<Events />} />
              <Route path="saved" element={<Saved />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SavedProvider>
    </LocationProvider>
  );
}
