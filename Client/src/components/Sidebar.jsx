import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Heart } from 'lucide-react';

const navItems = [
  {
    section: 'Main',
    links: [
      { path: '/',             label: 'Home',             Icon: LayoutDashboard },
    ],
  },
  {
    section: 'Donations',
    links: [
      { path: '/add-donation', label: 'Add Donor Details', Icon: PlusCircle },
      { path: '/donations',    label: 'Donor Lists',       Icon: Users },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <a
        className="sidebar-brand"
        href="/"
        onClick={(e) => { e.preventDefault(); navigate('/'); }}
      >
        <div className="sidebar-brand-icon">
          <Heart size={20} strokeWidth={2.5} fill="white" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">DonationMS</span>
          <span className="sidebar-brand-sub">Management System</span>
        </div>
      </a>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.links.map(({ path, label, Icon }) => {
              const isActive =
                path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(path);

              return (
                <button
                  key={path}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(path)}
                >
                  <Icon size={17} strokeWidth={2.2} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">© 2026 Donation MS</p>
      </div>
    </aside>
  );
}
