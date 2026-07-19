import { describe, expect, it } from 'vitest';
import { AI_PROMPT_TEMPLATE } from '../data/aiPrompt';
import { PRESETS } from '../data/presets';
import DefaultJA, { ja as NamedJa, JA as NamedJA } from '../i18n/ja';
import { convertToShamisenNote } from '../utils/shamisen';

describe('Datasets and Localization verification', () => {
  describe('presets.js verification', () => {
    it('contains exactly 10 songs', () => {
      const songKeys = Object.keys(PRESETS);
      expect(songKeys.length).toBe(10);
    });

    it('validates each song structure and notes playability', () => {
      for (const [key, song] of Object.entries(PRESETS)) {
        // Verify correct fields are present and valid
        expect(song, `Song "${key}" should have a name`).toHaveProperty('name');
        expect(typeof song.name).toBe('string');
        expect(song.name.length).toBeGreaterThan(0);

        expect(song, `Song "${key}" should have a composer`).toHaveProperty(
          'composer'
        );
        expect(typeof song.composer).toBe('string');
        expect(song.composer.length).toBeGreaterThan(0);

        expect(song, `Song "${key}" should have a memo`).toHaveProperty('memo');
        expect(typeof song.memo).toBe('string');
        expect(song.memo.length).toBeGreaterThan(0);

        expect(song, `Song "${key}" should have a tuning`).toHaveProperty(
          'tuning'
        );
        expect(typeof song.tuning).toBe('string');
        expect(['honchoshi', 'niagari', 'sansagari']).toContain(song.tuning);

        expect(song, `Song "${key}" should have a basePitch`).toHaveProperty(
          'basePitch'
        );
        expect(typeof song.basePitch).toBe('number');
        expect(song.basePitch).toBeGreaterThan(0);

        expect(
          song,
          `Song "${key}" should have a timeSignature`
        ).toHaveProperty('timeSignature');
        expect(typeof song.timeSignature).toBe('object');
        expect(typeof song.timeSignature.numerator).toBe('number');
        expect(typeof song.timeSignature.denominator).toBe('number');

        expect(song, `Song "${key}" should have a bpm`).toHaveProperty('bpm');
        expect(typeof song.bpm).toBe('number');
        expect(song.bpm).toBeGreaterThan(0);

        expect(song, `Song "${key}" should have a measureCount`).toHaveProperty(
          'measureCount'
        );
        expect(typeof song.measureCount).toBe('number');
        expect(song.measureCount).toBeGreaterThan(0);

        expect(song, `Song "${key}" should have a notes array`).toHaveProperty(
          'notes'
        );
        expect(Array.isArray(song.notes)).toBe(true);

        // Verify each note is playable and correctly structured
        for (const note of song.notes) {
          expect(note, `Note in "${key}" should have an id`).toHaveProperty(
            'id'
          );
          expect(typeof note.id).toBe('string');
          expect(note.id.length).toBeGreaterThan(0);

          expect(note, `Note in "${key}" should have a pitch`).toHaveProperty(
            'pitch'
          );
          expect(typeof note.pitch).toBe('number');

          expect(note, `Note in "${key}" should have a step`).toHaveProperty(
            'step'
          );
          expect(typeof note.step).toBe('number');
          expect(note.step).toBeGreaterThanOrEqual(0);

          expect(note, `Note in "${key}" should have a length`).toHaveProperty(
            'length'
          );
          expect(typeof note.length).toBe('number');
          expect(note.length).toBeGreaterThan(0);

          // Verify note is mathematically playable
          const shamisenNote = convertToShamisenNote(
            note.pitch,
            song.tuning,
            song.basePitch
          );
          expect(
            shamisenNote,
            `Note ${note.id} (pitch: ${note.pitch}) in song "${key}" is not playable under tuning "${song.tuning}" with base pitch ${song.basePitch}`
          ).not.toBeNull();
          expect(shamisenNote.stringIndex).toBeGreaterThanOrEqual(0);
          expect(shamisenNote.stringIndex).toBeLessThanOrEqual(2);
          expect(typeof shamisenNote.tsubo).toBe('string');
        }
      }
    });
  });

  describe('aiPrompt.js verification', () => {
    it('exports AI_PROMPT_TEMPLATE as a non-empty string', () => {
      expect(AI_PROMPT_TEMPLATE).toBeDefined();
      expect(typeof AI_PROMPT_TEMPLATE).toBe('string');
      expect(AI_PROMPT_TEMPLATE.length).toBeGreaterThan(0);
      expect(AI_PROMPT_TEMPLATE).toContain('JSON Schema');
      expect(AI_PROMPT_TEMPLATE).toContain('Bunkafu');
    });
  });

  describe('ja.js verification', () => {
    it('exports default, named ja and Named JA, all containing correct localization data', () => {
      expect(DefaultJA).toBeDefined();
      expect(NamedJa).toBe(DefaultJA);
      expect(NamedJA).toBe(DefaultJA);

      // Verify essential localization keys are present
      expect(DefaultJA).toHaveProperty('app');
      expect(DefaultJA.app.title).toBe('シャミコピー (Syamicopy)');
      expect(DefaultJA.app.subtitle).toBe(
        '三味線 ピアノロール＆文化譜エディタ'
      );

      expect(DefaultJA).toHaveProperty('common');
      expect(DefaultJA.common.save).toBe('保存');
      expect(DefaultJA.common.cancel).toBe('キャンセル');

      expect(DefaultJA).toHaveProperty('header');
      expect(DefaultJA.header.projectNamePlaceholder).toBe(
        '無題のプロジェクト'
      );

      expect(DefaultJA).toHaveProperty('tabs');
      expect(DefaultJA.tabs.pianoRoll).toBe('ピアノロール');
      expect(DefaultJA.tabs.bunkafu).toBe('文化譜');

      expect(DefaultJA).toHaveProperty('footer');
      expect(DefaultJA.footer.play).toBe('再生');

      expect(DefaultJA).toHaveProperty('settings');
      expect(DefaultJA.settings.title).toBe('プロジェクト設定');

      expect(DefaultJA).toHaveProperty('project');
      expect(DefaultJA.project.drawerTitle).toBe('プロジェクト管理');

      expect(DefaultJA).toHaveProperty('importExport');
      expect(DefaultJA.importExport.title).toBe('データの入出力');

      expect(DefaultJA).toHaveProperty('editor');
      expect(DefaultJA.editor.clearNotesBtn).toBe('すべてのノーツをクリア');

      expect(DefaultJA).toHaveProperty('bunkafu');
      expect(DefaultJA.bunkafu.exportPdf).toBe('PDF出力');
    });
  });
});
