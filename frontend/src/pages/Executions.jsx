import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Executions() {
  const [history, setHistory] = useState([]);
  const { can } = useAuth();
  useEffect(() => { api('/executions').then(setHistory); }, []);
  return <section>
    <div className="page-title"><h1>Execution History</h1>{can('execute-tests') ? <button>Record Execution</button> : <button disabled>Read only</button>}</div>
    <div className="panel table">{history.map((item) => <div className="table-row" key={item.id}><strong>{item.title}</strong><span>{item.status}</span><span>{item.tester_name}</span><span>{new Date(item.executed_at).toLocaleString()}</span></div>)}</div>
  </section>;
}
