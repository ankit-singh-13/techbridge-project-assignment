import { createContext, useContext, useMemo, useState } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const value = useMemo(() => ({ currentProject, setCurrentProject }), [currentProject]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export const useProject = () => useContext(ProjectContext);
