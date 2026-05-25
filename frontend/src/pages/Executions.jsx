import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { api } from '../utils/api.js';

const statuses = ['Pass', 'Fail', 'Blocked', 'Skipped'];

export default function Executions() {
  const [history, setHistory] = useState([]);
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ test_case_id: '', status: 'Pass', comments: '', defect_title: '', defect_description: '' });
  const [attachments, setAttachments] = useState([]);
  const { can } = useAuth();
  const { currentProject } = useProject();

  const loadHistory = async () => {
    const query = currentProject?.id ? `?projectId=${currentProject.id}` : '';
    setHistory(await api(`/executions${query}`));
  };

  useEffect(() => {
    loadHistory();
    const query = currentProject?.id ? `?projectId=${currentProject.id}` : '';
    api(`/testcases${query}`).then((result) => setCases(result.data || result));
  }, [currentProject]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append('test_case_id', form.test_case_id);
    data.append('status', form.status);
    data.append('comments', form.comments);
    if (form.status === 'Fail') {
      data.append('defect_title', form.defect_title);
      data.append('defect_description', form.defect_description);
    }
    attachments.forEach((file) => data.append('attachments', file));
    await api('/executions', { method: 'POST', body: data });
    setForm({ test_case_id: '', status: 'Pass', comments: '', defect_title: '', defect_description: '' });
    setAttachments([]);
    setShowForm(false);
    loadHistory();
  };

  const showDefectFields = form.status === 'Fail';
  const projectName = currentProject ? `Project: ${currentProject.name}` : 'All projects';

  const rows = useMemo(() => history.map((item) => ({ ...item, executedAt: new Date(item.executed_at).toLocaleString() })), [history]);

  return <section>
    <div className="page-title">
      <div>
        <h1>Execution History</h1>
        <span>{projectName}</span>
      </div>
      {can('execute-tests') ? <button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Record Execution'}</button> : <button disabled>Read only</button>}
    </div>
    {showForm && can('execute-tests') && <div className="panel form-panel">
      <h3>Record execution</h3>
      <form onSubmit={handleSubmit} className="stacked-form">
        <select value={form.test_case_id} onChange={(event) => setForm({ ...form, test_case_id: event.target.value })} required>
          <option value="">Select test case</option>
          {cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <textarea placeholder="Comments" value={form.comments} onChange={(event) => setForm({ ...form, comments: event.target.value })} />
        {showDefectFields && <>
          <input placeholder="Defect title" value={form.defect_title} onChange={(event) => setForm({ ...form, defect_title: event.target.value })} />
          <textarea placeholder="Defect description" value={form.defect_description} onChange={(event) => setForm({ ...form, defect_description: event.target.value })} />
        </>}
        <input type="file" multiple onChange={(event) => setAttachments(Array.from(event.target.files))} />
        <button type="submit">Submit execution</button>
      </form>
    </div>}
    <div className="panel table">
      <div className="table-row header"><span>Test case</span><span>Status</span><span>Tester</span><span>Executed at</span></div>
      {rows.map((item) => <div className="table-row" key={item.id}><span>{item.title || item.test_case_id}</span><span>{item.status}</span><span>{item.tester_name}</span><span>{item.executedAt}</span></div>)}
    </div>
  </section>;
}
