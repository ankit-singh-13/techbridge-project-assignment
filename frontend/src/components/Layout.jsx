import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Layout() {
  const { user, logout, can } = useAuth();
  const { toggleTheme } = useTheme();
  return <div className="app-shell">
    <aside>
      <h2>QA Bridge</h2>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/test-cases">Test Cases</NavLink>
      <NavLink to="/suites">Suites</NavLink>
      {can('execute-tests') && <NavLink to="/executions">Executions</NavLink>}
      {can('manage-users') && <NavLink to="/users">Users</NavLink>}
    </aside>
    <main>
      <header>
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>
        <div className="header-actions">
          <button onClick={toggleTheme}>Toggle theme</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <Outlet />
    </main>
  </div>;
}
