import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonations, getDonationById, deleteDonation } from '../api/donationApi';
import {
  Eye, Pencil, Trash2, Search, RotateCcw, PlusCircle,
  Users, Inbox, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X,
  TriangleAlert, CalendarDays,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────
const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

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

// ── View Modal ────────────────────────────────────────────────────────
function ViewModal({ donation, onClose }) {
  if (!donation) return null;

  const row = (label, value) => (
    <div className="modal-detail-row">
      <span className="modal-detail-label">{label}</span>
      <span className="modal-detail-value">{value || '—'}</span>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h4>
            <div className="donor-avatar">{getInitials(donation.donorName)}</div>
            <span>{donation.donorName}</span>
          </h4>
          <button className="btn-close-custom" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body-custom">
          {row('Email',           donation.email)}
          {row('Phone',           donation.phone)}
          {row('Amount',          formatAmount(donation.donationAmount))}
          {row('Donation Type',   donation.donationType)}
          {row('Payment Method',  donation.paymentMethod)}
          {row('Donation Date',   formatDate(donation.donationDate))}
          {row('Status',          donation.currentStatus)}
          {row('Notes',           donation.notes)}
          {row('Recorded On',     formatDate(donation.createdAt))}
        </div>
        <div className="modal-footer-custom">
          <button className="btn-outline-custom" onClick={onClose}>
            <X size={14} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────
function DeleteModal({ donation, onClose, onConfirm, deleting }) {
  if (!donation) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h4 style={{ color: 'var(--danger)' }}>
            <Trash2 size={18} /> Confirm Delete
          </h4>
          <button className="btn-close-custom" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body-custom">
          <div className="alert-custom alert-danger">
            <TriangleAlert size={16} />
            This action cannot be undone.
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-main)' }}>
            Are you sure you want to delete the donation record for{' '}
            <strong>{donation.donorName}</strong>?
          </p>
        </div>
        <div className="modal-footer-custom">
          <button className="btn-outline-custom" onClick={onClose} disabled={deleting}>Cancel</button>
          <button
            className="btn-primary-custom"
            style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <><span className="spinner-border spinner-border-sm me-1"></span>Deleting...</>
            ) : (
              <><Trash2 size={14} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main DonationList Component ────────────────────────────────────────
export default function DonationList() {
  const navigate = useNavigate();

  // List state
  const [donations, setDonations]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const limit = 8;

  // Filters
  const [searchInput, setSearchInput]   = useState('');  // raw typed value
  const [search, setSearch]             = useState('');  // debounced value (triggers API)
  const [donationType, setDonationType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [fromDate, setFromDate]       = useState('');
  const [toDate, setToDate]           = useState('');

  // Modals
  const [viewDonation, setViewDonation]     = useState(null);
  const [deleteDonationData, setDeleteDonationData] = useState(null);
  const [deleting, setDeleting]             = useState(false);
  const [loadingView, setLoadingView]       = useState(false);

  // ── Fetch list ────────────────────────────────────────────────────
  const fetchDonations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await getDonations({ page, limit, search, donationType, paymentMethod, currentStatus, fromDate, toDate });
      setDonations(res.data.donations);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  }, [search, donationType, paymentMethod, currentStatus, fromDate, toDate]);

  // ── Debounce search input (500ms) ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer); // cleanup on every keystroke
  }, [searchInput]);

  // Fetch on filter change (reset to page 1)
  useEffect(() => {
    fetchDonations(1);
  }, [fetchDonations]);

  // ── View ──────────────────────────────────────────────────────────
  const handleView = async (id) => {
    try {
      setLoadingView(true);
      const res = await getDonationById(id);
      setViewDonation(res.data.donation);
    } catch {
      setError('Could not load donation details.');
    } finally {
      setLoadingView(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteDonation(deleteDonationData._id);
      setDeleteDonationData(null);
      setSuccessMsg('Donation deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchDonations(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Reset filters ─────────────────────────────────────────────────
  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setDonationType('');
    setPaymentMethod('');
    setCurrentStatus('');
    setFromDate('');
    setToDate('');
  };

  // ── Pagination ────────────────────────────────────────────────────
  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            className={`page-btn ${i === currentPage ? 'active' : ''}`}
            onClick={() => fetchDonations(i)}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - 2 ||
        i === currentPage + 2
      ) {
        buttons.push(<span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>);
      }
    }
    return buttons;
  };

  return (
    <>
      {/* Modals */}
      {viewDonation && <ViewModal donation={viewDonation} onClose={() => setViewDonation(null)} />}
      {deleteDonationData && (
        <DeleteModal
          donation={deleteDonationData}
          onClose={() => setDeleteDonationData(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}

      {/* Alerts */}
      {successMsg && (
        <div className="alert-custom alert-success mb-3">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="alert-custom alert-danger mb-3">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        {/* Premium Search */}
        <div className="search-input-wrapper">
          <Search size={15} strokeWidth={2.2} className="search-icon" />
          <input
            id="search-input"
            type="text"
            className="form-control-custom"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              className="search-clear-btn"
              onClick={() => { setSearchInput(''); setSearch(''); }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type */}
        <select
          id="filter-type"
          className="form-control-custom filter-select"
          value={donationType}
          onChange={(e) => setDonationType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Monthly">Monthly</option>
          <option value="One Time">One Time</option>
          <option value="Annual">Annual</option>
          <option value="Festival">Festival</option>
          <option value="In-Kind">In-Kind</option>
        </select>

        {/* Payment */}
        <select
          id="filter-payment"
          className="form-control-custom filter-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="Online">Online</option>
          <option value="UPI">UPI</option>
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        {/* Status */}
        <select
          id="filter-status"
          className="form-control-custom filter-select"
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Date Range */}
        <div className="date-input-wrapper filter-date">
          <CalendarDays size={14} className="date-icon" />
          <input
            id="filter-from-date"
            type="date"
            className="form-control-custom"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From date"
          />
        </div>
        <div className="date-input-wrapper filter-date">
          <CalendarDays size={14} className="date-icon" />
          <input
            id="filter-to-date"
            type="date"
            className="form-control-custom"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To date"
          />
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          {/* Search */}
          <button
            id="search-cta-btn"
            className="btn-primary-custom"
            onClick={() => { setSearch(searchInput); setPage(1); }}
            title="Search records"
          >
            <Search size={14} /> Search
          </button>

          {/* Reset */}
          <button
            id="reset-cta-btn"
            className="btn-outline-custom"
            onClick={resetFilters}
            title="Reset filters"
          >
            <RotateCcw size={14} /> Reset
          </button>

          {/* Add New */}
          <button
            id="add-donation-btn"
            className="btn-primary-custom"
            onClick={() => navigate('/add-donation')}
          >
            <PlusCircle size={15} /> Add Donation
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card-custom">
        <div className="card-header-custom">
          <h5>
            <Users size={16} strokeWidth={2.2} style={{ color: 'var(--primary)' }} />
            Donor Records
          </h5>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {total} record{total !== 1 ? 's' : ''} found
          </span>
        </div>

        {loading || loadingView ? (
          <div className="loading-overlay">
            <div className="spinner-custom"></div>
            <span>Loading...</span>
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Inbox size={32} /></div>
            <h6>No donations found</h6>
            <p>Try adjusting your search filters or add a new donation.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, idx) => (
                  <tr key={d._id}>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="donor-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                          {getInitials(d.donorName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{d.donorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{d.phone}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {formatAmount(d.donationAmount)}
                    </td>
                    <td>
                      <span className={`badge-custom ${typeBadge(d.donationType)}`}>
                        <span className="badge-dot" />
                        {d.donationType}
                      </span>
                    </td>
                    <td>{d.paymentMethod}</td>
                    <td>{formatDate(d.donationDate)}</td>
                    <td>
                      <span className={`badge-custom ${statusBadge(d.currentStatus)}`}>
                        <span className="badge-dot" />
                        {d.currentStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="action-btn view" title="View" onClick={() => handleView(d._id)}>
                          <Eye size={14} strokeWidth={2.2} />
                        </button>
                        <button className="action-btn edit" title="Edit" onClick={() => navigate(`/edit-donation/${d._id}`)}
                        >
                          <Pencil size={14} strokeWidth={2.2} />
                        </button>
                        <button className="action-btn delete" title="Delete" onClick={() => setDeleteDonationData(d)}>
                          <Trash2 size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="pagination-custom">
            <span className="pagination-info">
              Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total} records
            </span>
            <div className="pagination-buttons">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => fetchDonations(currentPage - 1)} title="Previous">
                <ChevronLeft size={15} />
              </button>
              {renderPageButtons()}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => fetchDonations(currentPage + 1)} title="Next">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
