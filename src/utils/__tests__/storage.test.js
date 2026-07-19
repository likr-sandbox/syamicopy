import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportAllData,
  exportProjectNotes,
  importAllData,
  importProjectNotes,
  loadCurrentProjectId,
  loadProjects,
  saveCurrentProjectId,
  saveProjects
} from '../storage';

describe('storage utility persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('projects persistence', () => {
    it('returns empty array when no projects exist', () => {
      expect(loadProjects()).toEqual([]);
    });

    it('saves and loads projects array successfully', () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', notes: [] },
        { id: '2', name: 'Project 2', notes: [] }
      ];
      saveProjects(mockProjects);
      expect(loadProjects()).toEqual(mockProjects);
    });

    it('returns empty array when local storage JSON is malformed', () => {
      localStorage.setItem('syamicopy_projects', '{invalid-json');
      expect(loadProjects()).toEqual([]);
    });

    it('returns empty array when local storage JSON is not an array', () => {
      localStorage.setItem('syamicopy_projects', '123');
      expect(loadProjects()).toEqual([]);

      localStorage.setItem('syamicopy_projects', '"string"');
      expect(loadProjects()).toEqual([]);

      localStorage.setItem('syamicopy_projects', '{}');
      expect(loadProjects()).toEqual([]);

      localStorage.setItem('syamicopy_projects', 'null');
      expect(loadProjects()).toEqual([]);
    });
  });

  describe('current project ID persistence', () => {
    it('returns null when current project ID is not set', () => {
      expect(loadCurrentProjectId()).toBeNull();
    });

    it('saves and loads current project ID successfully', () => {
      const testId = 'test-uuid-1234';
      saveCurrentProjectId(testId);
      expect(loadCurrentProjectId()).toBe(testId);
    });

    it('saves valid falsy values like 0 and empty string successfully', () => {
      saveCurrentProjectId(0);
      expect(loadCurrentProjectId()).toBe('0');

      saveCurrentProjectId('');
      expect(loadCurrentProjectId()).toBe('');
    });

    it('removes current project ID when saved with null or undefined', () => {
      saveCurrentProjectId('some-id');
      expect(loadCurrentProjectId()).toBe('some-id');
      saveCurrentProjectId(null);
      expect(loadCurrentProjectId()).toBeNull();

      saveCurrentProjectId('some-id');
      expect(loadCurrentProjectId()).toBe('some-id');
      saveCurrentProjectId(undefined);
      expect(loadCurrentProjectId()).toBeNull();
    });
  });

  describe('bulk data export and import', () => {
    it('exports all data as a serialized JSON string', () => {
      const mockProjects = [{ id: '1', name: 'P1', notes: [] }];
      saveProjects(mockProjects);
      saveCurrentProjectId('1');

      const exported = exportAllData();
      const parsed = JSON.parse(exported);
      expect(parsed).toEqual({
        projects: mockProjects,
        currentProjectId: '1'
      });
    });

    it('imports all data successfully from valid JSON', () => {
      const dataToImport = {
        projects: [{ id: '9', name: 'Imported Project', notes: [] }],
        currentProjectId: '9'
      };
      const result = importAllData(JSON.stringify(dataToImport));
      expect(result).toBe(true);
      expect(loadProjects()).toEqual(dataToImport.projects);
      expect(loadCurrentProjectId()).toBe('9');
    });

    it('returns false and does not crash on malformed import JSON', () => {
      const result = importAllData('{invalid');
      expect(result).toBe(false);
    });

    it('returns false when projects array is missing in import', () => {
      const invalidData = {
        currentProjectId: '1'
      };
      const result = importAllData(JSON.stringify(invalidData));
      expect(result).toBe(false);
    });
  });

  describe('project notes export and import', () => {
    it('exports notes array as JSON string', () => {
      const notes = [
        { id: 'n1', pitch: 48, step: 0, length: 4 },
        { id: 'n2', pitch: 53, step: 4, length: 4 }
      ];
      const exported = exportProjectNotes(notes);
      expect(JSON.parse(exported)).toEqual(notes);
    });

    it('imports notes array successfully', () => {
      const notes = [
        { id: 'n1', pitch: 48, step: 0, length: 4 },
        { id: 'n2', pitch: 53, step: 4, length: 4 }
      ];
      const imported = importProjectNotes(JSON.stringify(notes));
      expect(imported).toEqual(notes);
    });

    it('returns empty array when notes JSON is malformed', () => {
      expect(importProjectNotes('{invalid')).toEqual([]);
    });

    it('returns empty array when notes JSON is not an array', () => {
      expect(importProjectNotes(JSON.stringify({ not: 'an array' }))).toEqual(
        []
      );
    });
  });
});
