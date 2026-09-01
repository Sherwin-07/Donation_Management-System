import { useLocation } from 'react-router-dom';
import { Calendar, Menu } from 'lucide-react';

const pageMeta = {
  '/':              { title: 'Dashboard',        subtitle: 'Overview of all donation activity'        },
  '/add-donation':  { title: 'Add Donor Details', subtitle: 'Record a new donation entry'             },
  '/donations':     { title: 'Donor Lists',       subtitle: 'Search, filter and manage donor records' },
  '/edit-donation': { title: 'Edit Donation',     subtitle: 'Update an existing donation record'      },
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();

  const matchKey =
    Object.keys(pageMeta).find(
      (k) => location.pathname.startsWith(k) && k !== '/'
    ) || (location.pathname === '/' ? '/' : null);

  const info = pageMeta[matchKey] || { title: 'Donation MS', subtitle: '' };

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <header className="topbar">
      {/* Left — Hamburger button on mobile + title */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-headings">
          <div className="topbar-title">{info.title}</div>
          <div className="topbar-subtitle">{info.subtitle}</div>
        </div>
      </div>

      {/* Right — date pill + avatar */}
      <div className="topbar-right">
        <div className="topbar-pill">
          <Calendar size={13} strokeWidth={2.5} />
          <span>{now}</span>
        </div>

        <div className="topbar-divider" />

        <div className="topbar-avatar" title="Admin">
          <span>A</span>
        </div>
      </div>
    </header>
  );
}

