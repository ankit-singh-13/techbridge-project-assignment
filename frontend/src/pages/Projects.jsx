import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { api } from '../utils/api.js';

const defaultForm = { name: '', description: '', version: '1.0.0', status: 'active', memberIds: [] };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const { can } = useAuth();
  const { currentProject, setCurrentProject } = useProject();

  const loadProjects = useCallback(async () => {
    const result = await api('/projects');
    setProjects(result.data || result);
  }, []);

  useEffect(() => {
    loadProjects();
    if (can('manage-users')) {
      api('/users').then(setUsers).catch(() => setUsers([]));
    }
  }, [loadProjects, can]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const payload = { ...form, memberIds: form.memberIds.filter(Boolean) };
      const created = await api('/projects', { method: 'POST', body: JSON.stringify(payload) });
      setProjects((current) => [created, ...current]);
      setCurrentProject(created);
      setShowForm(false);
      setForm(defaultForm);
      setMessage('Project created successfully');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const memberOptions = useMemo(() => users.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` })), [users]);

  return <section>
    <div className="page-title">
      <div>
        <h1>Projects</h1>
        {currentProject && <span>Selected: {currentProject.name}</span>}
      </div>
      {can('manage-projects') && <button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cancel' : 'Create Project'}</button>}
    </div>
    {showForm && <div className="panel form-panel">
      <h3>Create new project</h3>
      <form onSubmit={handleSubmit} className="stacked-form">
        <input placeholder="Project name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="input-row">
          <input placeholder="Version" value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </div>
        {can('manage-users') && <select multiple value={form.memberIds} onChange={(event) => setForm({ ...form, memberIds: Array.from(event.target.selectedOptions, (option) => Number(option.value)) })}>
          {memberOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>}
        <div className="form-actions"><button type="submit">Save project</button></div>
        {message && <p className="small">{message}</p>}
      </form>
    </div>}
    <div className="cards">{projects.map((project) => <article className={`panel ${currentProject?.id === project.id ? 'selected' : ''}`} key={project.id} onClick={() => setCurrentProject(project)}>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <span>v{project.version} · {project.status}</span>
    </article>)}</div>
  </section>;
}
