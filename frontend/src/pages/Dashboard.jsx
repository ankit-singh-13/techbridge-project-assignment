import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import { api } from '../utils/api.js';

const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#64748b'];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [cache, setCache] = useState('');
  useEffect(() => { api('/analytics').then((result) => { setAnalytics(result.data); setCache(result.cache); }); }, []);

  const stats = useMemo(() => {
    const list = analytics?.summary || [];
    const total = list.reduce((sum, item) => sum + item.count, 0);
    const passed = list.find((item) => item.status === 'Pass')?.count || 0;
    return { total, passed, passRate: total ? Math.round((passed / total) * 100) : 0 };
  }, [analytics]);

  if (!analytics) return <div className="loader">Loading analytics...</div>;
  return <section>
    <div className="page-title"><h1>Dashboard</h1><span>Cache: {cache}</span></div>
    <div className="stats"><StatCard label="Total Tests" value={stats.total} /><StatCard label="Passed" value={stats.passed} /><StatCard label="Pass Rate" value={`${stats.passRate}%`} /><StatCard label="Defect Density" value={`${analytics.defects.defects}/${analytics.defects.test_cases}`} /></div>
    <div className="grid-3">
      <div className="panel"><h3>Status Distribution</h3><ResponsiveContainer height={260}><PieChart><Pie data={analytics.summary} dataKey="count" nameKey="status" label>{analytics.summary.map((_entry, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      <div className="panel"><h3>Execution Trends</h3><ResponsiveContainer height={260}><LineChart data={analytics.trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="count" stroke="#2563eb" /></LineChart></ResponsiveContainer></div>
      <div className="panel"><h3>Priority Distribution</h3><ResponsiveContainer height={260}><BarChart data={analytics.priority}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="priority" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#16a34a" /></BarChart></ResponsiveContainer></div>
    </div>
  </section>;
}
