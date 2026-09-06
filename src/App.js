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
        {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
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

function BookingsTab({ bookings }) {
  return (
    <div>
      <h2>📅 Bookings</h2>
      {bookings?.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.customer_name}</td>
                <td>{booking.customer_phone}</td>
                <td>
                  {booking.booking_date} {booking.booking_time}
                </td>
                <td>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
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

function SettingsTab({ user }) {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/templates`,
        {
          templateName,
          templateText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTemplateName('');
      setTemplateText('');
      fetchTemplates();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>⚙️ Auto-Response Templates</h2>

      <div className="form-section">
        <h3>Create New Template</h3>
        <form onSubmit={handleSaveTemplate}>
          <input
            type="text"
            placeholder="Template name (e.g., 'Welcome')"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
          />
          <textarea
            placeholder="Template text"
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </form>
      </div>

      <div className="templates-section">
        <h3>Your Templates</h3>
        {templates.length ? (
          templates.map((t) => (
            <div key={t.id} className="template-card">
              <h4>{t.template_name}</h4>
              <p>{t.template_text}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No templates yet</p>
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
  const [currentPage, setCurrentPage] = useState(() => {
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
