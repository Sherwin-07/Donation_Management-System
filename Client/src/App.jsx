import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import DonationForm from './pages/DonationForm';
import DonationList from './pages/DonationList';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="page-content">
          <Routes>
            {/* Home → Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Add New Donation */}
            <Route path="/add-donation" element={<DonationForm />} />

            {/* Edit Existing Donation */}
            <Route path="/edit-donation/:id" element={<DonationForm />} />

            {/* Donor List */}
            <Route path="/donations" element={<DonationList />} />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="empty-state" style={{ marginTop: 80 }}>
                  <div className="empty-state-icon" style={{ width: 80, height: 80, margin: '0 auto 20px', color: '#d1d5db' }}>
                    <SearchX size={40} />
                  </div>
                  <h6>Page Not Found</h6>
                  <p>The page you are looking for does not exist.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

