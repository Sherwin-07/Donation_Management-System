import { useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const pageMeta = {
  '/':              { title: 'Dashboard',        subtitle: 'Overview of all donation activity'        },
  '/add-donation':  { title: 'Add Donor Details', subtitle: 'Record a new donation entry'             },
  '/donations':     { title: 'Donor Lists',       subtitle: 'Search, filter and manage donor records' },
  '/edit-donation': { title: 'Edit Donation',     subtitle: 'Update an existing donation record'      },
};

export default function Topbar() {
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
      {/* Left — title only, no icon */}
      <div>
        <div className="topbar-title">{info.title}</div>
        <div className="topbar-subtitle">{info.subtitle}</div>
      </div>

      {/* Right — date pill + avatar */}
      <div className="topbar-right">
        <div className="topbar-pill">
          <Calendar size={13} strokeWidth={2.5} />
          {now}
        </div>

        <div className="topbar-divider" />

        <div className="topbar-avatar" title="Admin">
          <span>A</span>
        </div>
      </div>
    </header>
  );
}
