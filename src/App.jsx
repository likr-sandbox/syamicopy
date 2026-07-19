import html2canvas from 'html2canvas';
import React, { useState, useRef } from 'react';
import BunkafuExport from './components/BunkafuView/BunkafuExport';
import BunkafuView from './components/BunkafuView/BunkafuView';
import Drawer from './components/Drawer';
import Footer from './components/Footer';
import Header from './components/Header';
import NewProjectModal from './components/NewProjectModal';
import PianoRoll from './components/PianoRoll/PianoRoll';
import SettingsModal from './components/SettingsModal';
import TabBar from './components/common/TabBar';
import useAudio from './hooks/useAudio';
import useNoteEditor from './hooks/useNoteEditor';
import useProjects from './hooks/useProjects';
import { JA } from './i18n/ja';

function App() {
  const [activeTab, setActiveTab] = useState('piano-roll');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const {
    projects,
    currentProject,
    createProject,
    deleteProject,
    updateProject,
    selectProject,
    loadPreset
  } = useProjects();

  const {
    isPlaying,
    currentStep,
    startPlayback,
    stopPlayback,
    playKeySound,
    getAudioContext
  } = useAudio(
    currentProject?.notes,
    currentProject?.bpm,
    currentProject?.timeSignature,
    currentProject?.measureCount
  );

  const { addNote, deleteNote, updateNote } = useNoteEditor(
    currentProject,
    updateProject
  );

  const bunkafuRef = useRef(null);
  const exportRef = useRef(null);

  const handleSaveImage = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#FDFBF7',
        useCORS: true,
        scale: 2
      });
      const isDefaultName =
        !currentProject?.name || currentProject.name === '無題のプロジェクト';
      const link = document.createElement('a');
      link.download = `${isDefaultName ? 'shamisen' : currentProject.name}_score.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export Bunkafu image:', error);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleSelectProject = (id) => {
    if (isPlaying) {
      stopPlayback();
    }
    selectProject(id);
  };

  const handleDeleteProject = (id) => {
    if (isPlaying) {
      stopPlayback();
    }
    deleteProject(id);
  };

  const handleLoadPreset = (presetKey) => {
    if (isPlaying) {
      stopPlayback();
    }
    loadPreset(presetKey);
  };

  const handleCreateProject = (projectData) => {
    if (isPlaying) {
      stopPlayback();
    }
    return createProject(projectData);
  };

  const handleTranspose = (semitones) => {
    if (!currentProject?.notes) return;
    const updatedNotes = currentProject.notes.map((note) => {
      let newPitch = note.pitch + semitones;
      // Clamp to A3 (57) ~ A6 (93)
      newPitch = Math.max(57, Math.min(93, newPitch));
      return { ...note, pitch: newPitch };
    });
    updateProject({ notes: updatedNotes });
  };

  const tabs = [
    { id: 'piano-roll', label: JA.tabs.pianoRoll },
    { id: 'bunkafu', label: JA.tabs.bunkafu }
  ];

  return (
    <div className="h-screen max-h-screen bg-washiWhite text-nouaiBlue flex flex-col font-sans overflow-hidden">
      <Header
        projectName={currentProject?.name}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <main className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'piano-roll' && (
          <PianoRoll
            notes={currentProject?.notes || []}
            addNote={addNote}
            deleteNote={deleteNote}
            updateNote={updateNote}
            onTranspose={handleTranspose}
            currentStep={currentStep}
            isPlaying={isPlaying}
            tuning={currentProject?.tuning || 'honchoshi'}
            basePitch={currentProject?.basePitch || 48}
            bpm={currentProject?.bpm || 100}
            measureCount={currentProject?.measureCount || 8}
            timeSignature={
              currentProject?.timeSignature || { numerator: 4, denominator: 4 }
            }
            playKeySound={playKeySound}
            audioContext={getAudioContext()}
            bunkafuRef={bunkafuRef}
          />
        )}

        {activeTab === 'bunkafu' && (
          <div
            className="flex flex-col gap-4 w-full h-full flex-1 min-h-0"
            data-testid="bunkafu-view"
          >
            {/* Top Toolbar: Tuning & Base Pitch */}
            <div className="flex justify-between items-center bg-white p-2 border border-nouaiBlue/20 rounded text-xs font-semibold select-none flex-shrink-0">
              <span className="text-nouaiBlue font-bold">文化譜設定</span>
              <div className="flex gap-2">
                <select
                  data-testid="bunkafu-tuning-select"
                  value={currentProject?.tuning || 'honchoshi'}
                  onChange={(e) => updateProject({ tuning: e.target.value })}
                  className="px-2 py-1 border border-nouaiBlue/25 rounded bg-white text-xs text-nouaiBlue font-semibold cursor-pointer"
                >
                  <option value="honchoshi">本調子</option>
                  <option value="niagari">二上がり</option>
                  <option value="sansagari">三下り</option>
                </select>
                <select
                  data-testid="bunkafu-base-pitch-select"
                  value={currentProject?.basePitch || 48}
                  onChange={(e) =>
                    updateProject({ basePitch: Number(e.target.value) })
                  }
                  className="px-2 py-1 border border-nouaiBlue/25 rounded bg-white text-xs text-nouaiBlue font-semibold cursor-pointer"
                >
                  {Array.from({ length: 37 }, (_, i) => 45 + i).map((p) => (
                    <option key={p} value={p}>
                      基準音: {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <BunkafuView
              ref={bunkafuRef}
              notes={currentProject?.notes || []}
              tuning={currentProject?.tuning || 'honchoshi'}
              basePitch={currentProject?.basePitch || 48}
              currentStep={currentStep}
              timeSignature={
                currentProject?.timeSignature || {
                  numerator: 4,
                  denominator: 4
                }
              }
              measureCount={currentProject?.measureCount || 8}
            />
            {/* Save Image Button below preview */}
            <div className="flex justify-center mt-2 pb-4">
              <button
                type="button"
                onClick={handleSaveImage}
                data-testid="bunkafu-export-btn"
                className="bg-shamiRed hover:bg-shamiRed/80 text-washiWhite px-8 py-2.5 rounded-lg shadow-md text-sm font-bold transition-all active:scale-95 cursor-pointer"
              >
                {JA.importExport.exportImageBtn}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer
        isPlaying={isPlaying}
        currentStep={currentStep}
        bpm={currentProject?.bpm}
        timeSignature={currentProject?.timeSignature}
        onPlayToggle={handlePlayToggle}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projects={projects}
        currentProjectId={currentProject?.id}
        onSelectProject={handleSelectProject}
        onOpenNewProject={() => {
          setIsDrawerOpen(false);
          setIsNewProjectOpen(true);
        }}
        onDeleteProject={handleDeleteProject}
      />

      <NewProjectModal
        key={isNewProjectOpen}
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
        onLoadPreset={handleLoadPreset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentProject={currentProject}
        onUpdateProject={updateProject}
      />

      {/* Hidden area for image export */}
      <div className="absolute top-0 left-0 -translate-x-[9999px] pointer-events-none">
        <BunkafuExport
          ref={exportRef}
          notes={currentProject?.notes || []}
          tuning={currentProject?.tuning || 'honchoshi'}
          basePitch={currentProject?.basePitch || 48}
          timeSignature={
            currentProject?.timeSignature || { numerator: 4, denominator: 4 }
          }
          measureCount={currentProject?.measureCount || 8}
        />
      </div>
    </div>
  );
}

export default App;
