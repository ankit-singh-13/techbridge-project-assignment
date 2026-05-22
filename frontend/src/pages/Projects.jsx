import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProject } from '../context/ProjectContext.jsx';
import { api } from '../utils/api.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const { can } = useAuth();
  const { currentProject, setCurrentProject } = useProject();
  useEffect(() => { api('/projects').then((result) => setProjects(result.data)); }, []);
  return <section>
    <div className="page-title"><h1>Projects</h1>{can('manage-projects') && <button>Create Project</button>}</div>
    <div className="cards">{projects.map((project) => <article className={`panel ${currentProject?.id === project.id ? 'selected' : ''}`} key={project.id} onClick={() => setCurrentProject(project)}><h3>{project.name}</h3><p>{project.description}</p><span>v{project.version} · {project.status}</span></article>)}</div>
  </section>;
}
