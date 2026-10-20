import { fireEvent, render, screen } from '@testing-library/react';
import React, { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import BunkafuExport from '../components/BunkafuView/BunkafuExport';
import BunkafuNote from '../components/BunkafuView/BunkafuNote';
import BunkafuView from '../components/BunkafuView/BunkafuView';
import NoteBlock from '../components/PianoRoll/NoteBlock';
import { PRESETS } from '../data/presets';
import { useNoteEditor } from '../hooks/useNoteEditor';
import { convertToShamisenNote } from '../utils/shamisen';

describe('R2 Bunkafu Domain & Notation Features', () => {
  describe('Polyphony across strings & same-string exclusivity in useNoteEditor', () => {
    it('allows polyphony across different strings at the exact same step', () => {
      let currentProject = {
        id: 'poly-proj',
        tuning: 'honchoshi',
        basePitch: 48,
        notes: []
      };

      const updateProject = vi.fn((fnOrFields) => {
        const update =
          typeof fnOrFields === 'function'
            ? fnOrFields(currentProject)
            : fnOrFields;
        if (update) {
          currentProject = { ...currentProject, ...update };
        }
      });

      const { addNote } = useNoteEditor(currentProject, updateProject);

      // Add pitch 60 on String 2 (tsubo 0) at step 0
      addNote({ id: 'note-str2', pitch: 60, step: 0, length: 4 });
      expect(currentProject.notes).toHaveLength(1);

      // Add pitch 53 on String 1 (tsubo 0) at step 0
      addNote({ id: 'note-str1', pitch: 53, step: 0, length: 4 });
      expect(currentProject.notes).toHaveLength(2);

      // Add pitch 48 on String 0 (tsubo 0) at step 0
      addNote({ id: 'note-str0', pitch: 48, step: 0, length: 4 });
      expect(currentProject.notes).toHaveLength(3);

      // All 3 notes coexist at step 0 because they are on different strings
      const step0Notes = currentProject.notes.filter((n) => n.step === 0);
      expect(step0Notes).toHaveLength(3);
    });

    it('enforces same-string exclusivity by trimming overlapping existing note', () => {
      let currentProject = {
        id: 'exclusive-proj',
        tuning: 'honchoshi',
        basePitch: 48,
        notes: [{ id: 'n1', pitch: 60, step: 0, length: 4 }] // String 2, interval [0, 4)
      };

      const updateProject = vi.fn((fnOrFields) => {
        const update =
          typeof fnOrFields === 'function'
            ? fnOrFields(currentProject)
            : fnOrFields;
        if (update) {
          currentProject = { ...currentProject, ...update };
        }
      });

      const { addNote } = useNoteEditor(currentProject, updateProject);

      // Add note on same String 2 at step 2, length 4: interval [2, 6)
      // Existing note [0, 4) should be trimmed to [0, 2)
      addNote({ id: 'n2', pitch: 62, step: 2, length: 4 });

      expect(currentProject.notes).toHaveLength(2);
      const n1 = currentProject.notes.find((n) => n.id === 'n1');
      const n2 = currentProject.notes.find((n) => n.id === 'n2');

      expect(n1.step).toBe(0);
      expect(n1.length).toBe(2); // trimmed from 4 to 2
      expect(n2.step).toBe(2);
      expect(n2.length).toBe(4);
    });

    it('splits existing note when a new note is added strictly inside its interval on the same string', () => {
      let currentProject = {
        id: 'split-proj',
        tuning: 'honchoshi',
        basePitch: 48,
        notes: [{ id: 'n1', pitch: 60, step: 0, length: 8 }] // String 2, interval [0, 8)
      };

      const updateProject = vi.fn((fnOrFields) => {
        const update =
          typeof fnOrFields === 'function'
            ? fnOrFields(currentProject)
            : fnOrFields;
        if (update) {
          currentProject = { ...currentProject, ...update };
        }
      });

      const { addNote } = useNoteEditor(currentProject, updateProject);

      // Add note on String 2 at step 2, length 2: interval [2, 4)
      addNote({ id: 'n2', pitch: 64, step: 2, length: 2 });

      // n1 should be split into [0, 2) and [4, 8)
      expect(currentProject.notes).toHaveLength(3);

      const part1 = currentProject.notes.find((n) => n.step === 0);
      const middle = currentProject.notes.find((n) => n.step === 2);
      const part2 = currentProject.notes.find((n) => n.step === 4);

      expect(part1.length).toBe(2);
      expect(middle.id).toBe('n2');
      expect(middle.length).toBe(2);
      expect(part2.length).toBe(4);
    });

    it('removes completely covered note when a longer note on the same string subsumes it', () => {
      let currentProject = {
        id: 'subsume-proj',
        tuning: 'honchoshi',
        basePitch: 48,
        notes: [{ id: 'n1', pitch: 60, step: 2, length: 2 }] // String 2, interval [2, 4)
      };

      const updateProject = vi.fn((fnOrFields) => {
        const update =
          typeof fnOrFields === 'function'
            ? fnOrFields(currentProject)
            : fnOrFields;
        if (update) {
          currentProject = { ...currentProject, ...update };
        }
      });

      const { addNote } = useNoteEditor(currentProject, updateProject);

      // Add note covering [0, 6) on String 2
      addNote({ id: 'n2', pitch: 62, step: 0, length: 6 });

      expect(currentProject.notes).toHaveLength(1);
      expect(currentProject.notes[0].id).toBe('n2');
      expect(currentProject.notes[0].step).toBe(0);
      expect(currentProject.notes[0].length).toBe(6);
    });
  });

  describe('BunkafuNote dotted notes rendering', () => {
    it('renders length 3 as dotted eighth note (1 underline + dot)', () => {
      const { container } = render(
        <BunkafuNote
          tsubo="3"
          length={3}
          isCurrent={false}
          x={20}
          y={16}
          isRest={false}
          stringIndex={2}
        />
      );

      // Check dot inside SVG
      const dot = container.querySelector('circle');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute('cx', '17');
      expect(dot).toHaveAttribute('cy', '12');

      // Check 1 underline border-b-2
      const underline = container.querySelector('.border-b-2');
      expect(underline).toBeInTheDocument();
    });

    it('renders length 6 as dotted quarter note (0 underlines + dot)', () => {
      const { container } = render(
        <BunkafuNote
          tsubo="3"
          length={6}
          isCurrent={false}
          x={20}
          y={16}
          isRest={false}
          stringIndex={2}
        />
      );

      // Check dot exists
      const dot = container.querySelector('circle');
      expect(dot).toBeInTheDocument();

      // Check NO underline
      const underline2 = container.querySelector('.border-b-2');
      const underline1 = container.querySelector('.border-b');
      expect(underline2).toBeNull();
      expect(underline1).toBeNull();
    });

    it('renders regular notes without dots', () => {
      const { container } = render(
        <BunkafuNote
          tsubo="3"
          length={4}
          isCurrent={false}
          x={20}
          y={16}
          isRest={false}
          stringIndex={2}
        />
      );

      const dot = container.querySelector('circle');
      expect(dot).toBeNull();
    });
  });

  describe('BunkafuView compound meter 6/8 & preferredString', () => {
    it('renders 6/8 compound meter rests and extension bars cleanly', () => {
      const notes = [
        // Note with length 4 in 6/8 meter (stepsPerBeat = 2)
        { id: 'n1', pitch: 60, step: 0, length: 4, preferredString: 2 }
      ];

      render(
        <BunkafuView
          notes={notes}
          tuning="honchoshi"
          basePitch={48}
          timeSignature={{ numerator: 6, denominator: 8 }}
          measureCount={1}
        />
      );

      // Main note at step 0
      expect(screen.getByTestId('bunkafu-note-0')).toBeInTheDocument();

      // Extension bar at step 2 (because stepsPerBeat = 2 and length = 4 > 2)
      expect(screen.getByTestId('bunkafu-extension-2')).toBeInTheDocument();

      // Rest should appear on unoccupied beat steps: 4, 6, 8, 10
      expect(screen.getByTestId('bunkafu-rest-4')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-rest-6')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-rest-8')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-rest-10')).toBeInTheDocument();
    });

    it('renders note on user-specified preferredString in BunkafuView', () => {
      // Pitch 60 is playable on String 0 (tsubo 10), String 1 (tsubo 6), String 2 (tsubo 0)
      const notes = [
        { id: 'n1', pitch: 60, step: 0, length: 4, preferredString: 0 }
      ];

      render(
        <BunkafuView
          notes={notes}
          tuning="honchoshi"
          basePitch={48}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={1}
        />
      );

      const noteElem = screen.getByTestId('bunkafu-note-0');
      expect(noteElem).toHaveAttribute('data-string-index', '0');
      expect(noteElem).toHaveTextContent('10');
    });
  });

  describe('BunkafuExport compound meter 6/8 & preferredString synchronization', () => {
    it('renders 6/8 compound meter rests and extension bars cleanly in BunkafuExport', () => {
      const notes = [
        // Note with length 4 in 6/8 meter (stepsPerBeat = 2)
        { id: 'exp-n1', pitch: 60, step: 0, length: 4, preferredString: 2 }
      ];

      render(
        <BunkafuExport
          notes={notes}
          tuning="honchoshi"
          basePitch={48}
          timeSignature={{ numerator: 6, denominator: 8 }}
          measureCount={1}
        />
      );

      // Main note at step 0
      expect(screen.getByTestId('bunkafu-export-note-0')).toBeInTheDocument();

      // Extension bar at step 2 (because stepsPerBeat = 2 and length = 4 > 2)
      expect(
        screen.getByTestId('bunkafu-export-extension-2')
      ).toBeInTheDocument();

      // Rest should appear on unoccupied beat steps: 4, 6, 8, 10
      expect(screen.getByTestId('bunkafu-export-rest-4')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-export-rest-6')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-export-rest-8')).toBeInTheDocument();
      expect(screen.getByTestId('bunkafu-export-rest-10')).toBeInTheDocument();
    });

    it('renders note on user-specified preferredString in BunkafuExport', () => {
      // Pitch 60 is playable on String 0 (tsubo 10), String 1 (tsubo 6), String 2 (tsubo 0)
      const notes = [
        { id: 'exp-n2', pitch: 60, step: 0, length: 4, preferredString: 0 }
      ];

      render(
        <BunkafuExport
          notes={notes}
          tuning="honchoshi"
          basePitch={48}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={1}
        />
      );

      const noteElem = screen.getByTestId('bunkafu-export-note-0');
      expect(noteElem).toHaveAttribute('data-string-index', '0');
      expect(noteElem).toHaveTextContent('10');
    });

    it('renders multi-line overflow extension bars with stepsPerBeat stride in BunkafuExport', () => {
      // In 4/4 meter, 1 line = 4 measures = 64 steps.
      // A note starting at step 60 with length 8 extends across line boundary (step 64).
      const notes = [
        { id: 'exp-n3', pitch: 60, step: 60, length: 8, preferredString: 2 }
      ];

      render(
        <BunkafuExport
          notes={notes}
          tuning="honchoshi"
          basePitch={48}
          timeSignature={{ numerator: 4, denominator: 4 }}
          measureCount={8}
        />
      );

      // Main note at step 60
      expect(screen.getByTestId('bunkafu-export-note-60')).toBeInTheDocument();
      // Extension bar at line 1 (step 64)
      expect(
        screen.getByTestId('bunkafu-export-extension-64')
      ).toBeInTheDocument();
    });
  });

  describe('NoteBlock string cycling and preservation', () => {
    it('cycles preferredString when string toggle badge is clicked', () => {
      const updateNote = vi.fn();
      const deleteNote = vi.fn();
      const playKeySound = vi.fn();

      // Pitch 60 can be played on String 2 (tsubo 0), String 1 (tsubo 6), String 0 (tsubo 10)
      const note = {
        id: 'block-note-1',
        pitch: 60,
        step: 0,
        length: 4,
        preferredString: 2
      };

      render(
        <NoteBlock
          note={note}
          deleteNote={deleteNote}
          updateNote={updateNote}
          totalSteps={16}
          tuning="honchoshi"
          basePitch={48}
          playKeySound={playKeySound}
        />
      );

      const toggleBadge = screen.getByTestId(
        'preferred-string-toggle-block-note-1'
      );
      expect(toggleBadge).toHaveTextContent('3-0'); // String 2 is rendered as "3" (1-indexed)

      // Click to cycle string
      fireEvent.click(toggleBadge);
      expect(updateNote).toHaveBeenCalledWith('block-note-1', {
        preferredString: 0
      });
    });
  });

  describe('All 10 preset songs have 0 out-of-range (×) notes', () => {
    it('verifies that no preset note produces null tsubo or × error in Bunkafu notation', () => {
      for (const [key, preset] of Object.entries(PRESETS)) {
        for (const note of preset.notes) {
          const shamiNote = convertToShamisenNote(
            note.pitch,
            preset.tuning,
            preset.basePitch,
            note.preferredString
          );
          expect(
            shamiNote,
            `Note ${note.id} in preset ${key} produced null (× in Bunkafu)`
          ).not.toBeNull();
          expect(shamiNote.tsubo).not.toBe('×');
          expect(shamiNote.stringIndex).toBeGreaterThanOrEqual(0);
          expect(shamiNote.stringIndex).toBeLessThanOrEqual(2);
        }
      }
    });
  });
});
