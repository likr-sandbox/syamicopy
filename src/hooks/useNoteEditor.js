import React, { useEffect, useRef, useState } from 'react';
import { MAX_PITCH, MIN_PITCH } from '../utils/constants';
import { convertToShamisenNote } from '../utils/shamisen';

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);
};

const getNoteStringIndex = (n, tuning, basePitch) => {
  const info = convertToShamisenNote(
    n.pitch,
    tuning,
    basePitch,
    n.preferredString
  );
  return info ? info.stringIndex : null;
};

const shareStringOrPitch = (a, b, tuning, basePitch) => {
  const aStr = getNoteStringIndex(a, tuning, basePitch);
  const bStr = getNoteStringIndex(b, tuning, basePitch);
  if (aStr !== null && bStr !== null) {
    return aStr === bStr;
  }
  return a.pitch === b.pitch;
};

const resolveOverlapsWithTarget = (
  existingNotes,
  targetNote,
  tuning,
  basePitch
) => {
  const tStart = targetNote.step;
  const tEnd = targetNote.step + targetNote.length;
  const result = [];

  for (const existing of existingNotes) {
    if (!shareStringOrPitch(existing, targetNote, tuning, basePitch)) {
      result.push(existing);
      continue;
    }

    const eStart = existing.step;
    const eEnd = existing.step + existing.length;

    // Check if intervals [eStart, eEnd) and [tStart, tEnd) overlap
    if (Math.max(eStart, tStart) >= Math.min(eEnd, tEnd)) {
      result.push(existing);
      continue;
    }

    // Overlapping on same string!
    // Case 1: Existing note encloses target note -> split into two
    if (eStart < tStart && eEnd > tEnd) {
      result.push({
        ...existing,
        step: eStart,
        length: tStart - eStart
      });
      result.push({
        ...existing,
        id: generateId(),
        step: tEnd,
        length: eEnd - tEnd
      });
    }
    // Case 2: Existing note starts before target note and ends at or before target note ends -> trim end
    else if (eStart < tStart && eEnd <= tEnd) {
      if (tStart - eStart > 0) {
        result.push({
          ...existing,
          step: eStart,
          length: tStart - eStart
        });
      }
    }
    // Case 3: Existing note starts at or after target note starts and ends after target note ends -> trim start
    else if (eStart >= tStart && eStart < tEnd && eEnd > tEnd) {
      if (eEnd - tEnd > 0) {
        result.push({
          ...existing,
          step: tEnd,
          length: eEnd - tEnd
        });
      }
    }
    // Case 4: Existing note is completely covered by target note (tStart <= eStart && eEnd <= tEnd) -> subsumed
  }

  return result;
};

const useNoteEditorHook = (currentProject, updateProject) => {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [lastNoteLength, setLastNoteLength] = useState(4);

  const prevProjectIdRef = useRef(currentProject?.id);
  useEffect(() => {
    if (currentProject?.id !== prevProjectIdRef.current) {
      prevProjectIdRef.current = currentProject?.id;
      setPast([]);
      setFuture([]);
    }
  }, [currentProject?.id]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushSnapshot = (notes) => {
    setPast((prev) => {
      const clone = (notes || []).map((n) => ({ ...n }));
      const updated = [...prev, clone];
      return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
    });
    setFuture([]);
  };

  const addNote = (note) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const isIdentical = currentNotes.some(
      (n) =>
        n.pitch === note.pitch &&
        n.step === note.step &&
        n.preferredString === note.preferredString
    );
    if (isIdentical) return;

    pushSnapshot(currentNotes);
    if (note.length) {
      setLastNoteLength(note.length);
    }

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      const tuning = prevProject.tuning || 'honchoshi';
      const basePitch = prevProject.basePitch ?? 48;

      const newNote = {
        id: note.id || generateId(),
        pitch: note.pitch,
        step: note.step,
        length: note.length,
        ...(note.preferredString !== undefined
          ? { preferredString: note.preferredString }
          : {})
      };

      const resolved = resolveOverlapsWithTarget(
        notes,
        newNote,
        tuning,
        basePitch
      );
      const updatedNotes = [...resolved, newNote].sort(
        (a, b) => a.step - b.step || a.pitch - b.pitch
      );
      return { notes: updatedNotes };
    });
  };

  const deleteNote = (id) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const exists = currentNotes.some((n) => n.id === id);
    if (!exists) return;

    pushSnapshot(currentNotes);

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      return { notes: notes.filter((n) => n.id !== id) };
    });
  };

  const updateNote = (id, fields) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const target = currentNotes.find((n) => n.id === id);
    if (!target) return;

    pushSnapshot(currentNotes);
    if (fields.length) {
      setLastNoteLength(fields.length);
    }

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      const currentTarget = notes.find((n) => n.id === id);
      if (!currentTarget) return null;

      const tuning = prevProject.tuning || 'honchoshi';
      const basePitch = prevProject.basePitch ?? 48;

      const updatedTarget = { ...currentTarget, ...fields };
      const otherNotes = notes.filter((n) => n.id !== id);

      const resolved = resolveOverlapsWithTarget(
        otherNotes,
        updatedTarget,
        tuning,
        basePitch
      );
      const updatedNotes = [...resolved, updatedTarget].sort(
        (a, b) => a.step - b.step || a.pitch - b.pitch
      );
      return { notes: updatedNotes };
    });
  };

  const transposeNotes = (semitones) => {
    if (!currentProject) return;
    const notes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    if (notes.length === 0) return;

    pushSnapshot(notes);

    const updatedNotes = notes.map((note) => {
      let newPitch = note.pitch + semitones;
      newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, newPitch));
      return { ...note, pitch: newPitch };
    });

    updateProject({ notes: updatedNotes });
  };

  const undo = () => {
    if (past.length === 0) return;
    const previousNotes = past[past.length - 1];
    const currentNotes = (currentProject?.notes || []).map((n) => ({ ...n }));
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => {
      const updated = [...prev, currentNotes];
      return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
    });
    updateProject({ notes: previousNotes.map((n) => ({ ...n })) });
  };

  const redo = () => {
    if (future.length === 0) return;
    const nextNotes = future[future.length - 1];
    const currentNotes = (currentProject?.notes || []).map((n) => ({ ...n }));
    setFuture((prev) => prev.slice(0, -1));
    setPast((prev) => {
      const updated = [...prev, currentNotes];
      return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
    });
    updateProject({ notes: nextNotes.map((n) => ({ ...n })) });
  };

  return {
    addNote,
    deleteNote,
    updateNote,
    transposeNotes,
    undo,
    redo,
    canUndo,
    canRedo,
    lastNoteLength,
    setLastNoteLength
  };
};

const createNoteEditorPlain = (currentProject, updateProject) => {
  let past = [];
  let future = [];
  let lastNoteLength = 4;

  const pushSnapshot = (notes) => {
    const clone = (notes || []).map((n) => ({ ...n }));
    past.push(clone);
    if (past.length > 50) past = past.slice(past.length - 50);
    future = [];
  };

  const addNote = (note) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const isIdentical = currentNotes.some(
      (n) =>
        n.pitch === note.pitch &&
        n.step === note.step &&
        n.preferredString === note.preferredString
    );
    if (isIdentical) return;

    pushSnapshot(currentNotes);
    if (note.length) lastNoteLength = note.length;

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      const tuning = prevProject.tuning || 'honchoshi';
      const basePitch = prevProject.basePitch ?? 48;

      const newNote = {
        id: note.id || generateId(),
        pitch: note.pitch,
        step: note.step,
        length: note.length,
        ...(note.preferredString !== undefined
          ? { preferredString: note.preferredString }
          : {})
      };

      const resolved = resolveOverlapsWithTarget(
        notes,
        newNote,
        tuning,
        basePitch
      );
      const updatedNotes = [...resolved, newNote].sort(
        (a, b) => a.step - b.step || a.pitch - b.pitch
      );
      return { notes: updatedNotes };
    });
  };

  const deleteNote = (id) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const exists = currentNotes.some((n) => n.id === id);
    if (!exists) return;

    pushSnapshot(currentNotes);

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      return { notes: notes.filter((n) => n.id !== id) };
    });
  };

  const updateNote = (id, fields) => {
    if (!currentProject) return;
    const currentNotes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    const target = currentNotes.find((n) => n.id === id);
    if (!target) return;

    pushSnapshot(currentNotes);
    if (fields.length) lastNoteLength = fields.length;

    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      const currentTarget = notes.find((n) => n.id === id);
      if (!currentTarget) return null;

      const tuning = prevProject.tuning || 'honchoshi';
      const basePitch = prevProject.basePitch ?? 48;

      const updatedTarget = { ...currentTarget, ...fields };
      const otherNotes = notes.filter((n) => n.id !== id);

      const resolved = resolveOverlapsWithTarget(
        otherNotes,
        updatedTarget,
        tuning,
        basePitch
      );
      const updatedNotes = [...resolved, updatedTarget].sort(
        (a, b) => a.step - b.step || a.pitch - b.pitch
      );
      return { notes: updatedNotes };
    });
  };

  const transposeNotes = (semitones) => {
    if (!currentProject) return;
    const notes = Array.isArray(currentProject.notes)
      ? currentProject.notes
      : [];
    if (notes.length === 0) return;

    pushSnapshot(notes);

    const updatedNotes = notes.map((note) => {
      let newPitch = note.pitch + semitones;
      newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, newPitch));
      return { ...note, pitch: newPitch };
    });

    updateProject({ notes: updatedNotes });
  };

  const undo = () => {
    if (past.length === 0) return;
    const previousNotes = past.pop();
    const currentNotes = (currentProject?.notes || []).map((n) => ({ ...n }));
    future.push(currentNotes);
    updateProject({ notes: previousNotes.map((n) => ({ ...n })) });
  };

  const redo = () => {
    if (future.length === 0) return;
    const nextNotes = future.pop();
    const currentNotes = (currentProject?.notes || []).map((n) => ({ ...n }));
    past.push(currentNotes);
    updateProject({ notes: nextNotes.map((n) => ({ ...n })) });
  };

  return {
    addNote,
    deleteNote,
    updateNote,
    transposeNotes,
    undo,
    redo,
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    get lastNoteLength() {
      return lastNoteLength;
    },
    setLastNoteLength(len) {
      lastNoteLength = len;
    }
  };
};

export const useNoteEditor = (currentProject, updateProject) => {
  const inReact = Boolean(
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      ?.ReactCurrentDispatcher?.current
  );
  if (inReact) {
    return useNoteEditorHook(currentProject, updateProject);
  }
  return createNoteEditorPlain(currentProject, updateProject);
};

export default useNoteEditor;
