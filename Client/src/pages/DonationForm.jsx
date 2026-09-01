import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDonation, getDonationById, updateDonation } from '../api/donationApi';
import { ArrowLeft, AlertCircle, CheckCircle, CalendarDays } from 'lucide-react';

// Empty form state
const emptyForm = {
  donorName: '',
  email: '',
  phone: '',
  donationAmount: '',
  donationType: '',
  paymentMethod: '',
  donationDate: '',
  notes: '',
  currentStatus: 'Pending',
};

// Validation rules
const validate = (form) => {
  const errs = {};

  if (!form.donorName.trim())
    errs.donorName = 'Donor name is required.';
  else if (form.donorName.trim().length < 2)
    errs.donorName = 'Name must be at least 2 characters.';

  if (!form.email.trim())
    errs.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(form.email))
    errs.email = 'Please enter a valid email address.';

  if (!form.phone.trim())
    errs.phone = 'Phone number is required.';
  else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, '')))
    errs.phone = 'Enter a valid 10-digit phone number.';

  if (!form.donationAmount)
    errs.donationAmount = 'Donation amount is required.';
  else if (isNaN(form.donationAmount) || Number(form.donationAmount) < 1)
    errs.donationAmount = 'Amount must be at least ₹1.';

  if (!form.donationType)
    errs.donationType = 'Please select a donation type.';

  if (!form.paymentMethod)
    errs.paymentMethod = 'Please select a payment method.';

  if (!form.donationDate)
    errs.donationDate = 'Donation date is required.';

  if (!form.currentStatus)
    errs.currentStatus = 'Please select a status.';

  return errs;
};

export default function DonationForm() {
  const { id } = useParams();       // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        setFetching(true);
        const res = await getDonationById(id);
        const d = res.data.donation;
        setForm({
          donorName: d.donorName || '',
          email: d.email || '',
          phone: d.phone || '',
          donationAmount: d.donationAmount || '',
          donationType: d.donationType || '',
          paymentMethod: d.paymentMethod || '',
          donationDate: d.donationDate
            ? new Date(d.donationDate).toISOString().split('T')[0]
            : '',
          notes: d.notes || '',
          currentStatus: d.currentStatus || 'Pending',
        });
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to load donation.');
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [id, isEdit]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateDonation(id, form);
        setSuccess('Donation updated successfully!');
      } else {
        await createDonation(form);
        setSuccess('Donation added successfully!');
        setForm(emptyForm);
        setErrors({});
      }
      // Navigate to list after short delay
      setTimeout(() => navigate('/donations'), 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-overlay">
        <div className="spinner-custom"></div>
        <span>Loading donation data...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="card-custom">
        {/* Header */}
        <div className="card-header-custom">
          <h5>
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle-fill'} text-primary`}></i>
            {isEdit ? 'Edit Donation Record' : 'Add New Donor Details'}
          </h5>
          <button
            className="btn-outline-custom"
            onClick={() => navigate('/donations')}
          >
          <ArrowLeft size={15} /> Back to List
          </button>
        </div>

        <div className="card-body-custom">
          {/* API Feedback */}
          {apiError && (
            <div className="alert-custom alert-danger">
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}
          {success && (
            <div className="alert-custom alert-success">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">

              {/* Donor Name */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="donorName">
                  Donor Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="donorName"
                  name="donorName"
                  type="text"
                  className={`form-control-custom ${errors.donorName ? 'is-invalid' : ''}`}
                  placeholder="Please enter the donor name"
                  value={form.donorName}
                  onChange={handleChange}
                />
                {errors.donorName && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.donorName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="email">
                  Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="e.g. steve@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="phone">
                  Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-control-custom ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Donation Amount */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="donationAmount">
                  Donation Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="donationAmount"
                  name="donationAmount"
                  type="number"
                  min="1"
                  className={`form-control-custom ${errors.donationAmount ? 'is-invalid' : ''}`}
                  placeholder="e.g. 500"
                  value={form.donationAmount}
                  onChange={handleChange}
                />
                {errors.donationAmount && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.donationAmount}
                  </div>
                )}
              </div>

              {/* Donation Type */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="donationType">
                  Donation Type <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="donationType"
                  name="donationType"
                  className={`form-control-custom ${errors.donationType ? 'is-invalid' : ''}`}
                  value={form.donationType}
                  onChange={handleChange}
                >
                  <option value="">-- Select Type --</option>
                  <option value="Monthly">Monthly</option>
                  <option value="One Time">One Time</option>
                  <option value="Annual">Annual</option>
                  <option value="Festival">Festival</option>
                  <option value="In-Kind">In-Kind</option>
                </select>
                {errors.donationType && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.donationType}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="paymentMethod">
                  Payment Method <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className={`form-control-custom ${errors.paymentMethod ? 'is-invalid' : ''}`}
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">-- Select Method --</option>
                  <option value="Online">Online</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                {errors.paymentMethod && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.paymentMethod}
                  </div>
                )}
              </div>

              {/* Donation Date */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="donationDate">
                  Donation Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="form-date-wrapper">
                  <CalendarDays size={15} className="date-icon" />
                  <input
                    id="donationDate"
                    name="donationDate"
                    type="date"
                    className={`form-control-custom ${errors.donationDate ? 'is-invalid' : ''}`}
                    value={form.donationDate}
                    onChange={handleChange}
                  />
                </div>
                {errors.donationDate && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.donationDate}
                  </div>
                )}
              </div>

              {/* Current Status */}
              <div className="col-md-6">
                <label className="form-label-custom" htmlFor="currentStatus">
                  Status <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="currentStatus"
                  name="currentStatus"
                  className={`form-control-custom ${errors.currentStatus ? 'is-invalid' : ''}`}
                  value={form.currentStatus}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.currentStatus && (
                  <div className="invalid-feedback-custom">
                    <AlertCircle size={13} />
                    {errors.currentStatus}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="col-12">
                <label className="form-label-custom" htmlFor="notes">
                  Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="form-control-custom"
                  placeholder="Any additional notes about this donation..."
                  value={form.notes}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="col-12 form-actions d-flex gap-2 justify-content-end mt-2">
                <button
                  type="button"
                  className="btn-outline-custom"
                  onClick={() => navigate('/donations')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  id="submit-donation-btn"
                  type="submit"
                  className="btn-primary-custom"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {isEdit ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-circle'}`}></i>
                      {isEdit ? 'Update Donation' : 'Add Donation'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
