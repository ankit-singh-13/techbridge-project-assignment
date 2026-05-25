import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { api } from '../utils/api.js';

export default function Suites() {
  const [suites, setSuites] = useState([]);
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_id: '', name: '', description: '' });
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [selectedCase, setSelectedCase] = useState('');
  const { can } = useAuth();
  const { currentProject } = useProject();

  const loadSuites = async () => {
    const query = currentProject?.id ? `?projectId=${currentProject.id}` : '';
    const data = await api(`/suites${query}`);
    setSuites(data.data || data);
  };

  useEffect(() => {
    loadSuites();
    const projectQuery = currentProject?.id ? `?projectId=${currentProject.id}` : '';
    api(`/testcases${projectQuery}`).then((result) => setCases(result.data || result));
  }, [currentProject]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, project_id: Number(form.project_id) };
    await api('/suites', { method: 'POST', body: JSON.stringify(payload) });
    setForm({ project_id: currentProject?.id || '', name: '', description: '' });
    setShowForm(false);
    loadSuites();
  };

  const handleAdd = async () => {
    if (!selectedSuite || !selectedCase) return;
    await api(`/suites/${selectedSuite}/cases`, { method: 'POST', body: JSON.stringify({ test_case_id: Number(selectedCase) }) });
    await loadSuites();
  };

  const handleRemove = async (suiteId, caseId) => {
    await api(`/suites/${suiteId}/cases/${caseId}`, { method: 'DELETE' });
    loadSuites();
  };

  const visibleCases = useMemo(() => cases.filter((testCase) => !selectedSuite || testCase.project_id === selectedSuite), [cases, selectedSuite]);

  return <section>
    <div className="page-title">
      <div>
        <h1>Test Suites</h1>
        <span>{currentProject ? `Project: ${currentProject.name}` : 'All projects'}</span>
      </div>
      {can('manage-tests') && <button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Cancel' : 'Create Suite'}</button>}
    </div>
    {showForm && <div className="panel form-panel">
      <h3>Create new suite</h3>
      <form onSubmit={handleSubmit} className="stacked-form">
        <select value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })} required>
          <option value="">Select project</option>
          {currentProject && <option value={currentProject.id}>{currentProject.name}</option>}
        </select>
        <input placeholder="Suite name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="form-actions"><button type="submit">Create suite</button></div>
      </form>
    </div>}
    <div className="panel grid-2">
      <div>
        <h3>Suites</h3>
        {suites.map((suite) => <article key={suite.id} className={`panel ${selectedSuite === suite.id ? 'selected' : ''}`} onClick={() => setSelectedSuite(suite.id)}>
          <h4>{suite.name}</h4>
          <p>{suite.description}</p>
          <span>{suite.case_count} test cases</span>
          <div className="suite-cases">
            {suite.cases?.map((testCase) => <div key={testCase.id} className="case-chip">
              <span>{testCase.title}</span>
              {can('manage-tests') && <button type="button" onClick={(event) => { event.stopPropagation(); handleRemove(suite.id, testCase.id); }}>Remove</button>}
            </div>)}
          </div>
        </article>)}
      </div>
      {can('manage-tests') && <div className="panel">
        <h3>Add case to suite</h3>
        <select value={selectedSuite || ''} onChange={(event) => setSelectedSuite(Number(event.target.value))}>
          <option value="">Select suite</option>
          {suites.map((suite) => <option key={suite.id} value={suite.id}>{suite.name}</option>)}
        </select>
        <select value={selectedCase} onChange={(event) => setSelectedCase(event.target.value)}>
          <option value="">Select test case</option>
          {cases.map((testCase) => <option key={testCase.id} value={testCase.id}>{testCase.title}</option>)}
        </select>
        <button type="button" disabled={!selectedSuite || !selectedCase} onClick={handleAdd}>Add case to suite</button>
      </div>}
    </div>
  </section>;
}
