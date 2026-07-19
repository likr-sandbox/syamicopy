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

  // Export project with stripped note IDs
  const handleExport = () => {
    if (!currentProject) return;
    const cleanNotes = (currentProject.notes || []).map(
      ({ id, ...rest }) => rest
    );
    const cleanProject = { ...currentProject, notes: cleanNotes };
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(cleanProject, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${currentProject.name || 'project'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
                handleTimeSignatureChange('denominator', Number(e.target.value))
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

        <div className="flex justify-between items-center pt-4 border-t border-nouaiBlue/10">
          <button
            type="button"
            data-testid="settings-export-btn"
            onClick={handleExport}
            className="px-4 py-2 border border-nouaiBlue text-nouaiBlue rounded font-bold text-xs hover:bg-nouaiBlue hover:text-washiWhite transition-all"
          >
            エクスポート
          </button>
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
