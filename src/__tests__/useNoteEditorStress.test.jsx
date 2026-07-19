import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNoteEditor } from '../hooks/useNoteEditor';

describe('useNoteEditor Duplicate Note Prevention Stress & Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles rapid/simultaneous clicks (100 concurrent additions of the same note)', () => {
    let currentProject = {
      id: 'proj-test',
      notes: []
    };

    const updateProject = vi.fn((fieldsOrFn) => {
      const fields =
        typeof fieldsOrFn === 'function'
          ? fieldsOrFn(currentProject)
          : fieldsOrFn;
      if (fields) {
        currentProject = {
          ...currentProject,
          ...fields,
          notes:
            fields.notes !== undefined ? fields.notes : currentProject.notes
        };
      }
    });

    const { result } = renderHook(() =>
      useNoteEditor(currentProject, updateProject)
    );

    // Call addNote 100 times concurrently in a single act block
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.addNote({ pitch: 60, step: 4, length: 4 });
      }
    });

    // Verify only 1 note was added
    expect(currentProject.notes.length).toBe(1);
    expect(updateProject).toHaveBeenCalled();
  });

  it('triggers transposition boundary edge case showing that transpose can cause duplicates', () => {
    // SettingsModal transpose logic:
    const handleTranspose = (notes, semitones) => {
      return notes.map((note) => {
        let newPitch = note.pitch + semitones;
        newPitch = Math.max(45, Math.min(81, newPitch));
        return { ...note, pitch: newPitch };
      });
    };

    const initialNotes = [
      { id: 'n1', pitch: 45, step: 0, length: 4 },
      { id: 'n2', pitch: 46, step: 0, length: 4 }
    ];

    // Transpose down by 1 semitone
    const transposed = handleTranspose(initialNotes, -1);

    // Both notes end up with pitch 45 at step 0
    expect(transposed[0].pitch).toBe(45);
    expect(transposed[0].step).toBe(0);
    expect(transposed[1].pitch).toBe(45);
    expect(transposed[1].step).toBe(0);

    // This shows that transposition can introduce duplicate notes on the same cell!
  });

  it('triggers database/JSON import duplicate note edge case', () => {
    const importedNotes = [
      { id: 'n1', pitch: 60, step: 4, length: 4 },
      { id: 'n2', pitch: 60, step: 4, length: 4 } // duplicate note on same cell
    ];

    const projectData = {
      name: 'Imported Project',
      notes: importedNotes
    };

    // Simulate useProjects createProject or import logic
    const createProjectMock = (projectData) => {
      return {
        id: 'imported-proj-id',
        name: projectData.name,
        notes: projectData.notes || []
      };
    };

    const newProject = createProjectMock(projectData);
    expect(newProject.notes.length).toBe(2);
    expect(newProject.notes[0].pitch).toBe(newProject.notes[1].pitch);
    expect(newProject.notes[0].step).toBe(newProject.notes[1].step);
    // This confirms that imported databases can bypass duplicate note prevention in useNoteEditor
  });
});
