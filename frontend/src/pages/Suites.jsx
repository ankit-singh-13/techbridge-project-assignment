import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Suites() {
  const [suites, setSuites] = useState([]);
  const { can } = useAuth();
  useEffect(() => { api('/suites').then((result) => setSuites(result.data)); }, []);
  return <section>
    <div className="page-title"><h1>Test Suites</h1>{can('manage-tests') && <button>Create Suite</button>}</div>
    <div className="cards">{suites.map((suite) => <article className="panel" key={suite.id}><h3>{suite.name}</h3><p>{suite.description}</p><span>{suite.case_count} test cases</span>{can('execute-tests') && <button>Execute Suite</button>}</article>)}</div>
  </section>;
}
