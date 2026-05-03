import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-logo">Task<span>Flow</span></h1>
        <p className="auth-sub">Sign in to your account</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
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
              placeholder="Password" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}