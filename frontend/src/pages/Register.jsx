import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

const roles = ['tester', 'read-only', 'test-lead', 'admin'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tester' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { can } = useAuth();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setSuccess('Account created. You may login now.');
      setForm({ name: '', email: '', password: '', role: 'tester' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  return <section className="auth-page">
    <form onSubmit={submit} className="panel auth-card">
      <h1>Register</h1>
      <input placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
      <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
      {can('manage-users') && <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
      </select>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <button>Create account</button>
      <p className="small">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  </section>;
}
