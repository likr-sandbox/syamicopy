export const useNoteEditor = (currentProject, updateProject) => {
  const addNote = (note) => {
    if (!currentProject) return;
    console.log('addNote called for', note.pitch, note.step);
    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      const exists = notes.some(
        (n) => n.pitch === note.pitch && n.step === note.step
      );
      console.log(
        'addNote evaluation: exists =',
        exists,
        'notes count =',
        notes.length
      );
      if (exists) return null; // do nothing

      const newNote = {
        id:
          note.id ||
          (crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9)),
        pitch: note.pitch,
        step: note.step,
        length: note.length
      };
      return { notes: [...notes, newNote] };
    });
  };

  const deleteNote = (id) => {
    if (!currentProject) return;
    console.log('deleteNote called for', id);
    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      console.log('deleteNote evaluation: notes count before =', notes.length);
      return { notes: notes.filter((n) => n.id !== id) };
    });
  };

  const updateNote = (id, fields) => {
    if (!currentProject) return;
    updateProject((prevProject) => {
      const notes = Array.isArray(prevProject.notes) ? prevProject.notes : [];
      return {
        notes: notes.map((n) => (n.id === id ? { ...n, ...fields } : n))
      };
    });
  };

  return {
    addNote,
    deleteNote,
    updateNote
  };
};

export default useNoteEditor;
