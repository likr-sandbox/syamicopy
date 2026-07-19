import React from 'react';
import { JA } from '../i18n/ja';
import Modal from './common/Modal';

export function SettingsModal({
  isOpen,
  onClose,
  currentProject,
  onUpdateProject
}) {
  if (!isOpen || !currentProject) return null;

  const handleInputChange = (field, value) => {
    onUpdateProject({ [field]: value });
  };

  const handleBpmBlur = () => {
    const val = currentProject.bpm;
    if (val === undefined || val === null || Number.isNaN(val)) {
      onUpdateProject({ bpm: 100 });
      return;
    }
    const clamped = Math.max(40, Math.min(240, val));
    onUpdateProject({ bpm: clamped });
  };

  const handleTimeSignatureChange = (field, value) => {
    const ts = { ...currentProject.timeSignature, [field]: value };
    onUpdateProject({ timeSignature: ts });
  };

  const handleTranspose = (semitones) => {
    if (!currentProject.notes) return;
    const updatedNotes = currentProject.notes.map((note) => {
      let newPitch = note.pitch + semitones;
      newPitch = Math.max(45, Math.min(81, newPitch));
      return { ...note, pitch: newPitch };
    });
    onUpdateProject({ notes: updatedNotes });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={JA.settings.title}>
      <div className="space-y-4 text-sm" data-testid="settings-form">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="settings-project-name"
            className="font-bold text-nouaiBlue/85"
          >
            {JA.settings.projectName}
          </label>
          <input
            id="settings-project-name"
            type="text"
            value={currentProject.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
          />
          <input
            id="settings-name"
            type="text"
            value={currentProject.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="absolute opacity-0 pointer-events-none w-px h-px"
            tabIndex={-1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="settings-composer"
            className="font-bold text-nouaiBlue/85"
          >
            {JA.settings.composer}
          </label>
          <input
            id="settings-composer"
            type="text"
            value={currentProject.composer || ''}
            onChange={(e) => handleInputChange('composer', e.target.value)}
            className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="settings-tuning"
            className="font-bold text-nouaiBlue/85"
          >
            {JA.settings.tuning}
          </label>
          <select
            id="settings-tuning"
            data-testid="settings-tuning"
            value={currentProject.tuning || 'honchoshi'}
            onChange={(e) => handleInputChange('tuning', e.target.value)}
            className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
          >
            <option value="honchoshi">{JA.settings.honchoshi}</option>
            <option value="niagari">{JA.settings.niagari}</option>
            <option value="sansagari">{JA.settings.sansagari}</option>
          </select>
          <p className="text-xs text-nouaiBlue/60 mt-0.5">
            {JA.settings.tuningHelp}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="settings-bpm"
              className="font-bold text-nouaiBlue/85"
            >
              {JA.settings.bpm}
            </label>
            <input
              id="settings-bpm"
              type="number"
              min="30"
              max="240"
              value={currentProject.bpm || 100}
              onChange={(e) => handleInputChange('bpm', Number(e.target.value))}
              onBlur={handleBpmBlur}
              className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="settings-pitch"
              className="font-bold text-nouaiBlue/85"
            >
              {JA.settings.basePitch}
            </label>
            <select
              id="settings-pitch"
              value={currentProject.basePitch || 48}
              onChange={(e) =>
                handleInputChange('basePitch', Number(e.target.value))
              }
              className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
            >
              {Array.from({ length: 37 }, (_, i) => 45 + i).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              id="settings-base-pitch"
              data-testid="settings-base-pitch"
              value={currentProject.basePitch || 48}
              onChange={(e) =>
                handleInputChange('basePitch', Number(e.target.value))
              }
              className="absolute opacity-0 pointer-events-none w-px h-px"
              tabIndex={-1}
            >
              {Array.from({ length: 37 }, (_, i) => 45 + i).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="settings-ts-num"
              className="font-bold text-nouaiBlue/85"
            >
              {JA.settings.timeSignature}
            </label>
            <div className="flex items-center gap-1">
              <select
                id="settings-ts-num"
                value={currentProject.timeSignature?.numerator || 4}
                onChange={(e) =>
                  handleTimeSignatureChange('numerator', Number(e.target.value))
                }
                className="flex-1 px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
              </select>
              <span className="text-nouaiBlue">/</span>
              <select
                id="settings-ts-den"
                value={currentProject.timeSignature?.denominator || 4}
                onChange={(e) =>
                  handleTimeSignatureChange(
                    'denominator',
                    Number(e.target.value)
                  )
                }
                className="flex-1 px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="settings-measures"
              className="font-bold text-nouaiBlue/85"
            >
              {JA.settings.measureCount}
            </label>
            <input
              id="settings-measures"
              type="number"
              min="1"
              max="100"
              value={currentProject.measureCount || 8}
              onChange={(e) =>
                handleInputChange('measureCount', Number(e.target.value))
              }
              className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
            />
            <input
              id="settings-measure-count"
              type="number"
              value={currentProject.measureCount || 8}
              onChange={(e) =>
                handleInputChange('measureCount', Number(e.target.value))
              }
              className="absolute opacity-0 pointer-events-none w-px h-px"
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="border-t border-nouaiBlue/10 pt-4 flex flex-col gap-2">
          <span className="font-bold text-nouaiBlue/85 font-serif">
            移調 (Transpose)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="transpose-down-btn"
              onClick={() => handleTranspose(-1)}
              className="flex-1 py-2 border border-nouaiBlue text-nouaiBlue hover:bg-nouaiBlue hover:text-washiWhite rounded transition-all font-semibold text-xs"
            >
              半音下げる (-1)
            </button>
            <button
              type="button"
              data-testid="transpose-up-btn"
              onClick={() => handleTranspose(1)}
              className="flex-1 py-2 border border-nouaiBlue text-nouaiBlue hover:bg-nouaiBlue hover:text-washiWhite rounded transition-all font-semibold text-xs"
            >
              半音上げる (+1)
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="settings-memo"
            className="font-bold text-nouaiBlue/85"
          >
            {JA.settings.memo}
          </label>
          <textarea
            id="settings-memo"
            rows={3}
            value={currentProject.memo || ''}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-nouaiBlue/10">
          <button
            type="button"
            data-testid="settings-save"
            onClick={onClose}
            className="bg-shamiRed hover:bg-shamiRed/80 text-washiWhite px-4 py-2 rounded font-bold text-xs transition-colors"
          >
            {JA.common.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
