import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

const defaultForm = { name: '', email: '', password: '', role: 'tester' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const { can } = useAuth();

  useEffect(() => {
    api('/users').then(setUsers).catch(() => setUsers([]));
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setMessage('User created successfully.');
      setForm(defaultForm);
      const updated = await api('/users');
      setUsers(updated);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return <section>
    <div className="page-title"><h1>Users</h1></div>
    <div className="grid-2">
      <div className="panel">
        <h3>All users</h3>
        <div className="table">
          <div className="table-row header"><span>Name</span><span>Email</span><span>Role</span></div>
          {users.map((user) => <div key={user.id} className="table-row"><span>{user.name}</span><span>{user.email}</span><span>{user.role}</span></div>)}
        </div>
      </div>
      {can('manage-users') && <div className="panel">
        <h3>Create new user</h3>
        <form onSubmit={submit} className="stacked-form">
          <input placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="tester">tester</option>
            <option value="read-only">read-only</option>
            <option value="test-lead">test-lead</option>
            <option value="admin">admin</option>
          </select>
          <button type="submit">Create user</button>
        </form>
        {message && <p className="small">{message}</p>}
      </div>}
    </div>
  </section>;
}
