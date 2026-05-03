import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api';
import useAuth from '../hooks/useAuth';

export default function Signup() {
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await signup(form);
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-logo">Task<span>Flow</span></h1>
        <p className="auth-sub">Create your account</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Jane Smith" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@team.io" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Min 6 characters" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}