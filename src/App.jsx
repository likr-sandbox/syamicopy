import html2canvas from 'html2canvas';
import React, { useState, useRef } from 'react';
import BunkafuExport from './components/BunkafuView/BunkafuExport';
import BunkafuView from './components/BunkafuView/BunkafuView';
import Drawer from './components/Drawer';
import Footer from './components/Footer';
import Header from './components/Header';
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

  const tabs = [
    { id: 'piano-roll', label: JA.tabs.pianoRoll },
    { id: 'bunkafu', label: JA.tabs.bunkafu }
  ];

  return (
    <div className="min-h-screen bg-washiWhite text-nouaiBlue flex flex-col font-sans">
      <Header
        projectName={currentProject?.name}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'piano-roll' && (
          <PianoRoll
            notes={currentProject?.notes || []}
            addNote={addNote}
            deleteNote={deleteNote}
            updateNote={updateNote}
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
          <div className="flex flex-col gap-4" data-testid="bunkafu-view">
            <div className="flex justify-end pr-2">
              <button
                type="button"
                onClick={handleSaveImage}
                data-testid="bunkafu-export-btn"
                className="bg-shamiRed hover:bg-shamiRed/80 text-washiWhite px-4 py-1.5 rounded shadow-sm text-xs font-bold transition-colors"
              >
                {JA.importExport.exportImageBtn}
              </button>
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
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onLoadPreset={handleLoadPreset}
        currentProject={currentProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentProject={currentProject}
        onUpdateProject={updateProject}
      />

      {/* Hidden area for image export */}
      <div className="absolute top-0 left-0 -translate-x-[9999px] pointer-events-none opacity-0">
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
