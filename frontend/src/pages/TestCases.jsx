import { useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function TestCases() {
  const [testCases, setTestCases] = useState([]);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const { can } = useAuth();

  const load = useCallback(async () => {
    const params = new URLSearchParams({ search, ...(priority ? { priority } : {}) });
    const result = await api(`/testcases?${params}`);
    setTestCases(result.data);
  }, [search, priority]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => testCases.map((item) => ({ ...item, label: `${item.priority} · ${item.type}` })), [testCases]);
  const Row = ({ index, style }) => {
    const item = visible[index];
    return <div style={style} className="test-row"><div><strong>{item.title}</strong><span>{item.label}</span></div>{can('manage-tests') ? <button>Edit</button> : <button disabled>View only</button>}</div>;
  };

  return <section>
    <div className="page-title"><h1>Test Cases</h1>{can('manage-tests') && <button>Create Test Case</button>}</div>
    <div className="toolbar"><input placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} /><select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>{can('manage-tests') && <button>Bulk Update</button>}</div>
    <div className="panel"><FixedSizeList height={460} itemCount={visible.length} itemSize={74} width="100%">{Row}</FixedSizeList></div>
  </section>;
}
