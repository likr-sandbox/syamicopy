import { useEffect, useState } from 'react';
import { PRESETS } from '../data/presets';
import {
  DEFAULT_BASE_PITCH,
  DEFAULT_BPM,
  DEFAULT_MEASURE_COUNT,
  DEFAULT_TIME_SIGNATURE,
  DEFAULT_TUNING
} from '../utils/constants';
import {
  loadCurrentProjectId,
  loadProjects,
  saveCurrentProjectId,
  saveProjects
} from '../utils/storage';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Initialize on mount
  useEffect(() => {
    let loadedProjects = loadProjects();
    let loadedId = loadCurrentProjectId();

    if (loadedProjects.length === 0) {
      const defaultProj = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
        name: '無題のプロジェクト',
        composer: '',
        memo: '',
        tuning: DEFAULT_TUNING,
        basePitch: DEFAULT_BASE_PITCH,
        timeSignature: DEFAULT_TIME_SIGNATURE,
        bpm: DEFAULT_BPM,
        measureCount: DEFAULT_MEASURE_COUNT,
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      loadedProjects = [defaultProj];
      loadedId = defaultProj.id;
      saveProjects(loadedProjects);
      saveCurrentProjectId(loadedId);
    }

    setProjects(loadedProjects);

    const exists = loadedProjects.some((p) => p.id === loadedId);
    if (!exists && loadedProjects.length > 0) {
      loadedId = loadedProjects[0].id;
      saveCurrentProjectId(loadedId);
    }
    setCurrentProjectId(loadedId);
  }, []);

  const currentProject =
    projects.find((p) => p.id === currentProjectId) || null;

  const createProject = (projectData = {}) => {
    const newProj = {
      id:
        projectData.id ||
        (crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9)),
      name: projectData.name || '無題のプロジェクト',
      composer: projectData.composer || '',
      memo: projectData.memo || '',
      tuning: projectData.tuning || DEFAULT_TUNING,
      basePitch:
        projectData.basePitch !== undefined
          ? projectData.basePitch
          : DEFAULT_BASE_PITCH,
      timeSignature: projectData.timeSignature || { ...DEFAULT_TIME_SIGNATURE },
      bpm: projectData.bpm !== undefined ? projectData.bpm : DEFAULT_BPM,
      measureCount:
        projectData.measureCount !== undefined
          ? projectData.measureCount
          : DEFAULT_MEASURE_COUNT,
      notes: projectData.notes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedList = [...projects, newProj];
    setProjects(updatedList);
    setCurrentProjectId(newProj.id);
    saveProjects(updatedList);
    saveCurrentProjectId(newProj.id);
    return newProj;
  };

  const deleteProject = (id) => {
    const filteredList = projects.filter((p) => p.id !== id);
    let nextId = currentProjectId;

    if (currentProjectId === id) {
      if (filteredList.length > 0) {
        nextId = filteredList[0].id;
      } else {
        const defaultProj = {
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9),
          name: '無題のプロジェクト',
          composer: '',
          memo: '',
          tuning: DEFAULT_TUNING,
          basePitch: DEFAULT_BASE_PITCH,
          timeSignature: DEFAULT_TIME_SIGNATURE,
          bpm: DEFAULT_BPM,
          measureCount: DEFAULT_MEASURE_COUNT,
          notes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        filteredList.push(defaultProj);
        nextId = defaultProj.id;
      }
    }

    setProjects(filteredList);
    setCurrentProjectId(nextId);
    saveProjects(filteredList);
    saveCurrentProjectId(nextId);
  };

  const updateProject = (fieldsOrFn) => {
    if (!currentProjectId) return;
    setProjects((prevProjects) => {
      let changed = false;
      const updatedList = prevProjects.map((p) => {
        if (p.id === currentProjectId) {
          const fields =
            typeof fieldsOrFn === 'function' ? fieldsOrFn(p) : fieldsOrFn;
          if (!fields || Object.keys(fields).length === 0) {
            return p;
          }
          changed = true;
          return {
            ...p,
            ...fields,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      if (changed) {
        saveProjects(updatedList);
        return updatedList;
      }
      return prevProjects;
    });
  };

  const selectProject = (id) => {
    setCurrentProjectId(id);
    saveCurrentProjectId(id);
  };

  const loadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return null;

    const newProj = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      name: preset.name,
      composer: preset.composer || '',
      memo: preset.memo || '',
      tuning: preset.tuning || DEFAULT_TUNING,
      basePitch:
        preset.basePitch !== undefined ? preset.basePitch : DEFAULT_BASE_PITCH,
      timeSignature: preset.timeSignature || { ...DEFAULT_TIME_SIGNATURE },
      bpm: preset.bpm !== undefined ? preset.bpm : DEFAULT_BPM,
      measureCount:
        preset.measureCount !== undefined
          ? preset.measureCount
          : DEFAULT_MEASURE_COUNT,
      notes: preset.notes ? JSON.parse(JSON.stringify(preset.notes)) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = [...projects, newProj];
    setProjects(updatedList);
    setCurrentProjectId(newProj.id);
    saveProjects(updatedList);
    saveCurrentProjectId(newProj.id);
    return newProj;
  };

  return {
    projects,
    currentProject,
    createProject,
    deleteProject,
    updateProject,
    selectProject,
    loadPreset
  };
};

export default useProjects;
