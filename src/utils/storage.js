const PROJECTS_KEY = 'syamicopy_projects';
const CURRENT_PROJECT_ID_KEY = 'syamicopy_current_project_id';

export const saveProjects = (projects) => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
};

export const loadProjects = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
};

export const saveCurrentProjectId = (id) => {
  if (id !== undefined && id !== null) {
    try {
      localStorage.setItem(CURRENT_PROJECT_ID_KEY, String(id));
    } catch (e) {
      console.error('Failed to save current project ID to localStorage:', e);
    }
  } else {
    try {
      localStorage.removeItem(CURRENT_PROJECT_ID_KEY);
    } catch (e) {
      console.error(
        'Failed to remove current project ID from localStorage:',
        e
      );
    }
  }
};

export const loadCurrentProjectId = () => {
  try {
    return localStorage.getItem(CURRENT_PROJECT_ID_KEY);
  } catch (_e) {
    return null;
  }
};

export const exportAllData = () => {
  const projects = loadProjects();
  const currentProjectId = loadCurrentProjectId();
  return JSON.stringify({ projects, currentProjectId }, null, 2);
};

export const importAllData = (json) => {
  try {
    const data = JSON.parse(json);
    if (data && Array.isArray(data.projects)) {
      saveProjects(data.projects);
      if (data.currentProjectId !== undefined) {
        saveCurrentProjectId(data.currentProjectId);
      }
      return true;
    }
    return false;
  } catch (_e) {
    return false;
  }
};

export const exportProjectNotes = (notes) => {
  return JSON.stringify(notes, null, 2);
};

export const importProjectNotes = (json) => {
  try {
    const notes = JSON.parse(json);
    return Array.isArray(notes) ? notes : [];
  } catch (_e) {
    return [];
  }
};
