import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { api } from './services/api';
import { UserProfile } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { RolesPage } from './pages/RolesPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { TrackerPage } from './pages/TrackerPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUser = async () => {
    try {
      const data = await api.getProfile();
      setUser(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
        {/* Left Side Navigation */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navigation */}
          <Navbar user={user} onUserUpdate={fetchUser} />

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardPage user={user} />} />
              <Route path="/profile" element={<ProfilePage user={user} onUserUpdate={fetchUser} />} />
              <Route path="/roles" element={<RolesPage user={user} onUserUpdate={fetchUser} />} />
              <Route path="/analysis" element={<AnalysisPage user={user} />} />
              <Route path="/roadmap" element={<RoadmapPage user={user} />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/tracker" element={<TrackerPage user={user} />} />
              <Route path="/about" element={<AboutPage onUserUpdate={fetchUser} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

