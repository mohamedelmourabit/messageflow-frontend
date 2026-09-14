import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// ============================================
// SIGNUP PAGE
// ============================================

function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    businessType: 'restaurant',
    whatsappNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/signup`, formData);
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Account created! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💬 MessageFlow</h1>
        <h2>Get Started Free</h2>
        <p>30-day free trial. No credit card required.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Business name"
            value={formData.businessName}
            onChange={(e) =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            required
          />

          <select
            value={formData.businessType}
            onChange={(e) =>
              setFormData({ ...formData, businessType: e.target.value })
            }
          >
            <option value="restaurant">Restaurant</option>
            <option value="salon">Hair Salon</option>
            <option value="clinic">Medical Clinic</option>
            <option value="services">Services</option>
          </select>

          <input
            type="tel"
            placeholder="WhatsApp number (+971XXXXXXXXX)"
            value={formData.whatsappNumber}
            onChange={(e) =>
              setFormData({ ...formData, whatsappNumber: e.target.value })
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {message && (
          <p className={message.includes('❌') ? 'error' : 'success'}>
            {message}
          </p>
        )}

        <p className="footer-text">
          Already have account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

// ============================================
// LOGIN PAGE
// ============================================

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Logged in! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💬 MessageFlow</h1>
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <p className={message.includes('❌') ? 'error' : 'success'}>
            {message}
          </p>
        )}

        <p className="footer-text">
          Don't have account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE
// ============================================

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      setBookings(response.data.bookings || []);
      setMessages(response.data.messages || []);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>💬 MessageFlow</h1>
          <p>{user?.business_name}</p>
        </div>
        <div className="header-right">
          <span className={`status ${user?.subscription_status}`}>
            {user?.subscription_status?.toUpperCase()}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          💳 Billing
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab user={user} bookings={bookings} />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} onChanged={fetchDashboard} />
        )}
        {activeTab === 'messages' && <MessagesTab messages={messages} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
        {activeTab === 'billing' && <BillingTab user={user} />}
      </div>
    </div>
  );
}

function OverviewTab({ user, bookings }) {
  const confirmedBookings =
    bookings?.filter((b) => b.status === 'confirmed').length || 0;
  const pendingBookings =
    bookings?.filter((b) => b.status === 'pending').length || 0;

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: '#4caf50' }}>
            {confirmedBookings}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: '#ffc107' }}>
            {pendingBookings}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Plan</div>
          <div className="stat-value" style={{ textTransform: 'capitalize' }}>
            {user?.subscription_plan || 'Free Trial'}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, onChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stopEditing = () => {
    setEditingId(null);
    setError('');
  };

  const handleToggle = (booking) => {
    if (editingId === booking.id) {
      stopEditing();
      return;
    }
    setEditingId(booking.id);
    setEditDate(String(booking.booking_date).slice(0, 10));
    setEditTime(String(booking.start_time || booking.booking_time).slice(0, 5));
    setError('');
  };

  const handleSave = async (id) => {
    setSaving(true);
    setError('');
    try {
      await axios.patch(
        `${API_BASE}/api/bookings/${id}`,
        { bookingDate: editDate, bookingTime: editTime },
        authHeaders(),
      );
      stopEditing();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setSaving(true);
    setError('');
    try {
      await axios.patch(`${API_BASE}/api/bookings/${id}/cancel`, {}, authHeaders());
      stopEditing();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not cancel booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>📅 Bookings</h2>
      {bookings?.length ? (
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <React.Fragment key={booking.id}>
                <tr>
                  <td>
                    {booking.status !== 'cancelled' && (
                      <input
                        type="checkbox"
                        checked={editingId === booking.id}
                        onChange={() => handleToggle(booking)}
                      />
                    )}
                  </td>
                  <td>{booking.customer_name}</td>
                  <td>{booking.customer_phone}</td>
                  <td>
                    {String(booking.booking_date).slice(0, 10)}{' '}
                    {String(booking.start_time || booking.booking_time).slice(0, 5)}
                  </td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
                {editingId === booking.id && (
                  <tr className="booking-edit-row">
                    <td></td>
                    <td colSpan={4}>
                      <div className="booking-edit-form">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                        />
                        <button onClick={() => handleSave(booking.id)} disabled={saving}>
                          {saving ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancel(booking.id)}
                          disabled={saving}
                        >
                          Cancel booking
                        </button>
                        {error && <span className="booking-edit-error">{error}</span>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty-state">No bookings yet</p>
      )}
    </div>
  );
}

function MessagesTab({ messages }) {
  return (
    <div>
      <h2>💬 Messages</h2>
      <div className="messages-list">
        {messages?.length ? (
          messages.slice(0, 20).map((msg) => (
            <div key={msg.id} className={`message ${msg.direction}`}>
              <div className="message-header">
                <span className="phone">{msg.phone}</span>
                <span className="time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text">{msg.message_text}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No messages yet</p>
        )}
      </div>
    </div>
  );
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function authHeaders() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
}

function SettingsTab({ user }) {
  const [hours, setHours] = useState([]);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState('');

  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);

  useEffect(() => {
    fetchHours();
    fetchHolidays();
  }, []);

  const fetchHours = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/opening-hours`, authHeaders());
      setHours(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setHoursLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/holidays`, authHeaders());
      setHolidays(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const updateDay = (dayOfWeek, changes) => {
    setHours((prev) =>
      prev.map((day) => (day.day_of_week === dayOfWeek ? { ...day, ...changes } : day)),
    );
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    setHoursMessage('');
    try {
      const payload = hours.map((day) => ({
        day_of_week: day.day_of_week,
        is_open: day.is_open,
        open_time: day.is_open ? (day.open_time || '09:00').slice(0, 5) : null,
        close_time: day.is_open ? (day.close_time || '18:00').slice(0, 5) : null,
      }));
      const response = await axios.put(
        `${API_BASE}/api/opening-hours`,
        { hours: payload },
        authHeaders(),
      );
      setHours(response.data);
      setHoursMessage('Hours saved.');
    } catch (err) {
      setHoursMessage(err.response?.data?.error || 'Could not save hours.');
    } finally {
      setSavingHours(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayDate) return;
    setSavingHoliday(true);
    try {
      await axios.post(
        `${API_BASE}/api/holidays`,
        { date: holidayDate, reason: holidayReason || null },
        authHeaders(),
      );
      setHolidayDate('');
      setHolidayReason('');
      fetchHolidays();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/holidays/${id}`, authHeaders());
      fetchHolidays();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <h2>⚙️ Business Hours &amp; Holidays</h2>

      <div className="form-section">
        <h3>Weekly Opening Hours</h3>
        {hoursLoading ? (
          <p className="empty-state">Loading...</p>
        ) : (
          <>
            <div className="hours-grid">
              {hours.map((day) => (
                <div className="hours-row" key={day.day_of_week}>
                  <label className="hours-day">
                    <input
                      type="checkbox"
                      checked={day.is_open}
                      onChange={(e) =>
                        updateDay(day.day_of_week, {
                          is_open: e.target.checked,
                          open_time: day.open_time || '09:00',
                          close_time: day.close_time || '18:00',
                        })
                      }
                    />
                    {DAY_NAMES[day.day_of_week]}
                  </label>
                  {day.is_open ? (
                    <div className="hours-times">
                      <input
                        type="time"
                        value={(day.open_time || '09:00').slice(0, 5)}
                        onChange={(e) => updateDay(day.day_of_week, { open_time: e.target.value })}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={(day.close_time || '18:00').slice(0, 5)}
                        onChange={(e) => updateDay(day.day_of_week, { close_time: e.target.value })}
                      />
                    </div>
                  ) : (
                    <span className="hours-closed">Closed</span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSaveHours} disabled={savingHours}>
              {savingHours ? 'Saving...' : 'Save Hours'}
            </button>
            {hoursMessage && <p className="hours-message">{hoursMessage}</p>}
          </>
        )}
      </div>

      <div className="form-section">
        <h3>Holidays &amp; Closed Dates</h3>
        <form className="holiday-form" onSubmit={handleAddHoliday}>
          <input
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Reason (optional, e.g. 'Eid al-Fitr')"
            value={holidayReason}
            onChange={(e) => setHolidayReason(e.target.value)}
          />
          <button type="submit" disabled={savingHoliday}>
            {savingHoliday ? 'Adding...' : 'Add Closed Date'}
          </button>
        </form>

        {holidays.length ? (
          <div className="holiday-list">
            {holidays.map((h) => (
              <div className="holiday-row" key={h.id}>
                <span className="holiday-date">{String(h.holiday_date).slice(0, 10)}</span>
                {h.reason && <span className="holiday-reason">{h.reason}</span>}
                <button className="cancel-btn" onClick={() => handleDeleteHoliday(h.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No holidays configured</p>
        )}
      </div>
    </div>
  );
}

function BillingTab({ user }) {
  return (
    <div>
      <h2>💳 Billing</h2>
      <div className="billing-card">
        <h3>Current Plan</h3>
        <div className="plan-info">
          <p>
            <strong>Status:</strong> {user?.subscription_status?.toUpperCase()}
          </p>
          <p>
            <strong>Plan:</strong>{' '}
            {user?.subscription_plan?.charAt(0).toUpperCase() +
              user?.subscription_plan?.slice(1) || 'Free Trial'}
          </p>
          {user?.trial_end_date && (
            <p>
              <strong>Trial Ends:</strong>{' '}
              {new Date(user.trial_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
        {user?.subscription_status === 'free_trial' && (
          <button className="upgrade-btn">Upgrade Plan</button>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

function App() {
  const [currentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/login') return 'login';
    if (path === '/dashboard') return 'dashboard';
    return 'signup';
  });

  return (
    <div className="app">
      {currentPage === 'signup' && <SignupPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'dashboard' && <DashboardPage />}
    </div>
  );
}

export default App;
