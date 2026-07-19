import React, { useRef } from 'react';
import { PRESETS } from '../data/presets';
import { JA } from '../i18n/ja';
import IconButton from './common/IconButton';

export function Drawer({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLoadPreset,
  currentProject
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    onCreateProject({
      name: JA.header.projectNamePlaceholder,
      notes: []
    });
  };

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    const message = JA.project.confirmDelete.replace('{name}', name);
    if (window.confirm(message)) {
      onDeleteProject(id);
    }
  };

  const handleExport = () => {
    if (!currentProject) return;
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentProject, null, 2)
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && typeof parsed === 'object') {
          if (!Array.isArray(parsed.notes)) {
            parsed.notes = [];
          }
          onCreateProject(parsed);
          alert(JA.importExport.importSuccess);
        } else {
          alert(JA.importExport.importFailed);
        }
      } catch {
        alert(JA.importExport.importFailed);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes drawer
    <div
      data-testid="drawer-overlay"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-nouaiBlue/40 backdrop-blur-xs flex transition-opacity duration-300 animate-fadeIn"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation of click */}
      <div
        data-testid="drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-80 max-w-full bg-washiWhite h-full border-r border-nouaiBlue/20 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-nouaiBlue/10 flex justify-between items-center bg-washiWhite">
          <h2 className="text-lg font-bold font-serif text-nouaiBlue">
            {JA.project.drawerTitle}
          </h2>
          <IconButton onClick={onClose} ariaLabel="閉じる" variant="ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>閉じる</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <button
            type="button"
            data-testid="drawer-new-project-btn"
            onClick={handleCreateNew}
            className="w-full py-2 bg-shamiRed text-washiWhite font-bold rounded hover:bg-shamiRed/95 transition-all text-sm shadow-sm"
          >
            {JA.project.newProjectBtn}
          </button>

          <div>
            <h3 className="text-xs font-bold text-nouaiBlue/55 tracking-wider uppercase mb-2">
              マイプロジェクト ({projects.length})
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto border border-nouaiBlue/10 rounded bg-white">
              {projects.map((proj) => {
                const isCurrent = proj.id === currentProjectId;
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: select project item
                  <div
                    key={proj.id}
                    data-testid={`drawer-project-item-${proj.id}`}
                    onClick={() => {
                      onSelectProject(proj.id);
                      onClose();
                    }}
                    className={`group flex items-center justify-between p-2 text-sm cursor-pointer border-l-4 transition-all ${
                      isCurrent
                        ? 'border-shamiRed bg-shamiRed/5 font-bold text-shamiRed'
                        : 'border-transparent text-nouaiBlue hover:bg-nouaiBlue/5'
                    }`}
                  >
                    <span className="truncate">
                      {proj.name || '無題のプロジェクト'}
                    </span>
                    <button
                      type="button"
                      data-testid={`delete-project-btn-${proj.id}`}
                      onClick={(e) => handleDelete(e, proj.id, proj.name)}
                      className="opacity-0 group-hover:opacity-100 text-nouaiBlue/50 hover:text-shamiRed p-1 transition-opacity"
                      aria-label={`${proj.name}を削除`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>{proj.name}を削除</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-nouaiBlue/55 tracking-wider uppercase mb-2">
              {JA.common.preset}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESETS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  data-testid={`drawer-preset-item-${key}`}
                  onClick={() => {
                    onLoadPreset(key);
                    onClose();
                  }}
                  className="p-2 border border-nouaiBlue/10 hover:border-shamiRed hover:bg-shamiRed/5 text-left text-xs rounded transition-all truncate text-nouaiBlue font-medium"
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-nouaiBlue/10 pt-4">
            <h3 className="text-xs font-bold text-nouaiBlue/55 tracking-wider uppercase mb-2">
              {JA.importExport.title}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="drawer-export-btn"
                onClick={handleExport}
                className="flex-1 py-1.5 border border-nouaiBlue text-nouaiBlue rounded text-xs hover:bg-nouaiBlue hover:text-washiWhite transition-all font-semibold"
              >
                {JA.importExport.exportBtn}
              </button>
              <button
                type="button"
                data-testid="drawer-import-btn"
                onClick={handleImportClick}
                className="flex-1 py-1.5 border border-nouaiBlue text-nouaiBlue rounded text-xs hover:bg-nouaiBlue hover:text-washiWhite transition-all font-semibold"
              >
                {JA.importExport.importBtn}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              data-testid="drawer-file-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drawer;
