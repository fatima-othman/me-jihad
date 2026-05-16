import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../services/feature2Service';
import { storage } from '../../utils/storage';
import '../styles/feature2.css';

const ProfileSettings = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(formData);
      storage.setUser(updatedUser);
      await refreshUser().catch(() => null);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section">
      <div className="container feature2-narrow">
        <section className="card">
          <h1>Profile Settings</h1>
          <p>Manage your account details used across StrategAI reports and dashboards.</p>
          {error ? <p className="form-alert">{error}</p> : null}
          {message ? <p className="feature2-success">{message}</p> : null}
          <form onSubmit={handleSubmit} noValidate>
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input id="profile-name" name="name" className="input" value={formData.name} onChange={handleChange} />

            <label className="form-label" htmlFor="profile-email">Email</label>
            <input id="profile-email" name="email" className="input" value={formData.email} onChange={handleChange} />

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ProfileSettings;
