import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/donationApi';
import { useNavigate } from 'react-router-dom';
import {
  Heart, IndianRupee, CalendarCheck, TrendingUp,
  PieChart, CreditCard, Clock, ArrowRight,
  AlertCircle, Inbox,
} from 'lucide-react';

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const typeBadge = (t) => {
  const map = { 'One Time': 'badge-onetime', Monthly: 'badge-monthly', Annual: 'badge-annual', Festival: 'badge-festival', 'In-Kind': 'badge-inkind' };
  return map[t] || '';
};

const statusBadge = (s) => {
  const map = { Completed: 'badge-completed', Pending: 'badge-pending', Rejected: 'badge-rejected', Cancelled: 'badge-cancelled' };
  return map[s] || '';
};

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        setStats(res.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner-custom" />
      <span>Loading dashboard…</span>
    </div>
  );

  if (error) return (
    <div className="alert-custom alert-danger">
      <AlertCircle size={18} />
      {error}
    </div>
  );

  const {
    totalDonations = 0, totalAmount = 0,
    thisMonthDonations = 0, thisMonthAmount = 0,
    donationsByType = [], donationsByPayment = [],
    recentDonations = [],
  } = stats || {};

  const maxTypeCount = Math.max(...donationsByType.map((d) => d.count), 1);
  const maxPayCount  = Math.max(...donationsByPayment.map((d) => d.count), 1);

  const statCards = [
    {
      variant: 'primary', Icon: Heart,
      value: totalDonations, label: 'Total Donations (Completed)',
      trend: '+All time', trendDir: 'up',
    },
    {
      variant: 'success', Icon: IndianRupee,
      value: formatAmount(totalAmount), label: 'Total Amount Raised',
      trend: 'Verified', trendDir: 'up', smallVal: true,
    },
    {
      variant: 'warning', Icon: CalendarCheck,
      value: thisMonthDonations, label: "This Month's Donations",
      trend: 'Current month', trendDir: 'up',
    },
    {
      variant: 'info', Icon: TrendingUp,
      value: formatAmount(thisMonthAmount), label: "This Month's Amount",
      trend: 'Current month', trendDir: 'up', smallVal: true,
    },
  ];

  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {statCards.map(({ variant, Icon, value, label, trend, trendDir, smallVal }) => (
          <div key={label} className="col-6 col-xl-3">
            <div className={`stat-card ${variant}`}>
              <div className="stat-card-top">
                <div className={`stat-icon ${variant}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <span className={`stat-trend ${trendDir}`}>{trend}</span>
              </div>
              <div className="stat-value" style={smallVal ? { fontSize: 22 } : {}}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="row g-3 mb-4">
        {/* By Type */}
        <div className="col-md-6">
          <div className="card-custom h-100">
            <div className="card-header-custom">
              <h5>
                <PieChart size={16} strokeWidth={2.2} style={{ color: 'var(--primary)' }} />
                Donations by Type
              </h5>
            </div>
            <div className="card-body-custom">
              {donationsByType.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No data available</p>
              ) : (
                <div className="chart-bar-wrap">
                  {donationsByType.map((item) => (
                    <div key={item._id} className="chart-bar-item">
                      <span className="chart-bar-label">{item._id}</span>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill type" style={{ width: `${(item.count / maxTypeCount) * 100}%` }} />
                      </div>
                      <span className="chart-bar-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* By Payment */}
        <div className="col-md-6">
          <div className="card-custom h-100">
            <div className="card-header-custom">
              <h5>
                <CreditCard size={16} strokeWidth={2.2} style={{ color: 'var(--success)' }} />
                Donations by Payment
              </h5>
            </div>
            <div className="card-body-custom">
              {donationsByPayment.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No data available</p>
              ) : (
                <div className="chart-bar-wrap">
                  {donationsByPayment.map((item) => (
                    <div key={item._id} className="chart-bar-item">
                      <span className="chart-bar-label">{item._id}</span>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill payment" style={{ width: `${(item.count / maxPayCount) * 100}%` }} />
                      </div>
                      <span className="chart-bar-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Donations ── */}
      <div className="card-custom">
        <div className="card-header-custom">
          <h5>
            <Clock size={16} strokeWidth={2.2} style={{ color: 'var(--warning)' }} />
            Recent Donations
          </h5>
          <button className="btn-outline-custom" onClick={() => navigate('/donations')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body-custom recent-donations-body">
          {recentDonations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Inbox size={32} /></div>
              <h6>No donations yet</h6>
              <p>Start by adding a new donation record.</p>
            </div>
          ) : (
            recentDonations.map((d) => (
              <div key={d._id} className="recent-item">
                <div className="recent-left">
                  <div className="donor-avatar">{getInitials(d.donorName)}</div>
                  <div className="recent-donor-info">
                    <div className="recent-donor-name">{d.donorName}</div>
                    <div className="recent-donor-meta">
                      <span className="recent-donor-email">{d.email}</span>
                      <span className={`badge-custom recent-type-badge ${typeBadge(d.donationType)}`}>
                        <span className="badge-dot" />
                        {d.donationType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="recent-right">
                  <span className="recent-amount">
                    {formatAmount(d.donationAmount)}
                  </span>
                  <span className={`badge-custom recent-status-badge ${statusBadge(d.currentStatus)}`}>
                    <span className="badge-dot" />
                    {d.currentStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
