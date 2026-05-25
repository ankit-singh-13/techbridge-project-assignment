import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const demos = ['admin@example.com', 'lead@example.com', 'tester@example.com', 'readonly@example.com'];

export default function Login() {
  const [email, setEmail] = useState(demos[0]);
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return <section className="login-page">
    <form onSubmit={submit} className="panel login-card">
      <h1>Test Case Management</h1>
      <p>Use any demo account. Password: <code>Password123!</code></p>
      <select value={email} onChange={(event) => setEmail(event.target.value)}>{demos.map((item) => <option key={item}>{item}</option>)}</select>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      {error && <p className="error">{error}</p>}
      <button>Login</button>
      <p className="small">Need an account? <Link to="/register">Register</Link></p>
    </form>
  </section>;
}
