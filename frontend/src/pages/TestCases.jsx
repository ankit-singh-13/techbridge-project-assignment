import { useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { api } from '../utils/api.js';

const priorities = ['Low', 'Medium', 'High', 'Critical'];
const types = ['Functional', 'Integration', 'Regression', 'Smoke', 'UI', 'API'];
const defaultSteps = [{ action: '', expected_result: '' }];

export default function TestCases() {
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ project_id: '', title: '', description: '', priority: 'Medium', type: 'Functional', preconditions: '', postconditions: '', tags: '', steps: defaultSteps, assigned_to: '' });
  const { can } = useAuth();
  const { currentProject } = useProject();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (currentProject?.id) params.set('projectId', currentProject.id);
    if (search) params.set('search', search);
    if (priority) params.set('priority', priority);
    if (type) params.set('type', type);
    params.set('page', page);
    params.set('limit', limit);
    return params.toString();
  }, [currentProject, search, priority, type, page, limit]);

  const loadTestCases = useCallback(async () => {
    const data = await api(`/testcases?${queryString}`);
    setTestCases(data.data || data);
    setTotal(data.total || 0);
  }, [queryString]);

  useEffect(() => {
    loadTestCases();
    api('/projects').then((result) => setProjects(result.data || result));
    if (can('manage-tests')) api('/users').then(setUsers).catch(() => setUsers([]));
  }, [loadTestCases, can]);

  const resetForm = () => {
    setEditing(null);
    setForm({ project_id: currentProject?.id || '', title: '', description: '', priority: 'Medium', type: 'Functional', preconditions: '', postconditions: '', tags: '', steps: defaultSteps, assigned_to: '' });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      project_id: Number(form.project_id),
      tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean),
      steps: form.steps.filter((step) => step.action || step.expected_result)
    };
    try {
      if (editing) {
        await api(`/testcases/${editing}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/testcases', { method: 'POST', body: JSON.stringify(payload) });
      }
      resetForm();
      setShowForm(false);
      loadTestCases();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      project_id: item.project_id,
      title: item.title,
      description: item.description || '',
      priority: item.priority,
      type: item.type,
      preconditions: item.preconditions || '',
      postconditions: item.postconditions || '',
      tags: (item.tags || []).join(', '),
      steps: item.steps || defaultSteps,
      assigned_to: item.assigned_to || ''
    });
    setShowForm(true);
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const handleBulkAction = async (action) => {
    try {
      if (!selectedIds.length) return;
      if (action === 'delete') {
        await api('/testcases/bulk', { method: 'PATCH', body: JSON.stringify({ ids: selectedIds, action: 'delete' }) });
      } else if (action === 'priority') {
        await api('/testcases/bulk', { method: 'PATCH', body: JSON.stringify({ ids: selectedIds, action: 'priority', priority: 'High' }) });
      }
      setSelectedIds([]);
      loadTestCases();
    } catch (error) {
      console.error(error);
    }
  };

  const visible = useMemo(() => testCases.map((item) => ({ ...item, label: `${item.priority} · ${item.type}` })), [testCases]);
  const Row = ({ index, style }) => {
    const item = visible[index];
    return <div style={style} className="test-row">
      <label><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></label>
      <div>
        <strong>{item.title}</strong>
        <span>{item.label}</span>
      </div>
      <div className="row-actions">
        {can('manage-tests') ? <button type="button" onClick={() => handleEdit(item)}>Edit</button> : <button type="button" disabled>View only</button>}
      </div>
    </div>;
  };

  return <section>
    <div className="page-title">
      <div>
        <h1>Test Cases</h1>
        <span>{currentProject ? `Project: ${currentProject.name}` : 'All Projects'}</span>
      </div>
      {can('manage-tests') && <button onClick={() => { resetForm(); setShowForm((current) => !current); }}>{showForm ? 'Close form' : (editing ? 'Edit Test Case' : 'Create Test Case')}</button>}
    </div>
    <div className="toolbar">
      <input placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
      <select value={priority} onChange={(event) => setPriority(event.target.value)}>
        <option value="">All priorities</option>
        {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <select value={type} onChange={(event) => setType(event.target.value)}>
        <option value="">All types</option>
        {types.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      {can('manage-tests') && <button type="button" onClick={() => handleBulkAction('delete')} disabled={!selectedIds.length}>Delete selected</button>}
      {can('manage-tests') && <button type="button" onClick={() => handleBulkAction('priority')} disabled={!selectedIds.length}>Set High priority</button>}
    </div>
    {showForm && <div className="panel form-panel">
      <h3>{editing ? 'Edit Test Case' : 'Create Test Case'}</h3>
      <form onSubmit={handleFormSubmit} className="stacked-form">
        <select value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })} required>
          <option value="">Select project</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="input-row">
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
            {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {types.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <textarea placeholder="Preconditions" value={form.preconditions} onChange={(event) => setForm({ ...form, preconditions: event.target.value })} />
        <textarea placeholder="Postconditions" value={form.postconditions} onChange={(event) => setForm({ ...form, postconditions: event.target.value })} />
        <input placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        <select value={form.assigned_to} onChange={(event) => setForm({ ...form, assigned_to: event.target.value })}>
          <option value="">Assign to tester</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
        <div className="steps-panel">
          <h4>Test steps</h4>
          {form.steps.map((step, index) => <div key={index} className="step-row">
            <input placeholder={`Step ${index + 1} action`} value={step.action} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((value, idx) => idx === index ? { ...value, action: event.target.value } : value) }))} />
            <input placeholder="Expected result" value={step.expected_result} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((value, idx) => idx === index ? { ...value, expected_result: event.target.value } : value) }))} />
          </div>)}
          <button type="button" onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, { action: '', expected_result: '' }] }))}>Add step</button>
        </div>
        <div className="form-actions"><button type="submit">{editing ? 'Update' : 'Create'} test case</button></div>
      </form>
    </div>}
    <div className="panel">
      <div className="table header"><span></span><span>Title</span><span>Status</span><span>Assigned</span><span>Updated</span></div>
      {visible.map((item) => <div className="table-row" key={item.id}><label><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></label><span>{item.title}</span><span>{item.priority}</span><span>{item.assigned_to_name || 'unassigned'}</span><span>{new Date(item.updated_at).toLocaleDateString()}</span></div>)}
    </div>
    <div className="pagination">Page {page} of {Math.ceil(total / limit) || 1}
      <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
      <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((current) => current + 1)}>Next</button>
    </div>
  </section>;
}
