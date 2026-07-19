import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { Drawer } from '../components/Drawer';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { SettingsModal } from '../components/SettingsModal';
import { IconButton } from '../components/common/IconButton';
import { Modal } from '../components/common/Modal';
import { TabBar } from '../components/common/TabBar';

// Mock Web Audio Context & Utilities
vi.mock('../utils/audio', () => ({
  createAudioContext: vi.fn(() => ({
    state: 'suspended',
    resume: vi.fn().mockResolvedValue(),
    close: vi.fn().mockResolvedValue()
  })),
  playShamisenSound: vi.fn()
}));

// Mock window.confirm & alert
const confirmMock = vi.fn();
const alertMock = vi.fn();
window.confirm = confirmMock;
window.alert = alertMock;

describe('Presentation & Layout Shared UI Components', () => {
  describe('IconButton Component', () => {
    it('renders child icon elements', () => {
      render(
        <IconButton ariaLabel="Test Icon">
          <span data-testid="icon-child">★</span>
        </IconButton>
      );
      expect(screen.getByTestId('icon-child')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Test Icon' })
      ).toBeInTheDocument();
    });

    it('handles mouse click triggers', () => {
      const clickHandler = vi.fn();
      render(
        <IconButton ariaLabel="Click Me" onClick={clickHandler}>
          <span>★</span>
        </IconButton>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('respects the disabled state constraint', () => {
      const clickHandler = vi.fn();
      render(
        <IconButton ariaLabel="Blocked" onClick={clickHandler} disabled>
          <span>★</span>
        </IconButton>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Modal Component', () => {
    it('does not render content when closed', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={vi.fn()} title="Closed Title">
          <div>Content</div>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders layout and content when active', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Open Title">
          <div data-testid="modal-inner">Nested text</div>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Open Title')).toBeInTheDocument();
      expect(screen.getByTestId('modal-inner')).toBeInTheDocument();
    });

    it('triggers onClose when backdrop overlay is clicked', () => {
      const closeHandler = vi.fn();
      render(
        <Modal isOpen={true} onClose={closeHandler} title="Overlay Test">
          <div>Content</div>
        </Modal>
      );
      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(closeHandler).toHaveBeenCalledTimes(1);
    });

    it('triggers onClose when close button is clicked', () => {
      const closeHandler = vi.fn();
      render(
        <Modal isOpen={true} onClose={closeHandler} title="Close Button Test">
          <div>Content</div>
        </Modal>
      );
      fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
      expect(closeHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('TabBar Component', () => {
    const mockTabs = [
      { id: 'tab1', label: 'Tab One' },
      { id: 'tab2', label: 'Tab Two' }
    ];

    it('renders all tab choices and marks active selection with classes', () => {
      render(<TabBar tabs={mockTabs} activeTab="tab1" onChange={vi.fn()} />);
      const tab1 = screen.getByTestId('tab-tab1');
      const tab2 = screen.getByTestId('tab-tab2');

      expect(tab1).toHaveTextContent('Tab One');
      expect(tab2).toHaveTextContent('Tab Two');

      // Check for active visual markers (Tailwind styling classes)
      expect(tab1.className).toContain('text-shamiRed');
      expect(tab1.className).toContain('border-shamiRed');
      expect(tab2.className).not.toContain('text-shamiRed');
    });

    it('emits selection change actions', () => {
      const changeHandler = vi.fn();
      render(
        <TabBar tabs={mockTabs} activeTab="tab1" onChange={changeHandler} />
      );
      fireEvent.click(screen.getByTestId('tab-tab2'));
      expect(changeHandler).toHaveBeenCalledWith('tab2');
    });
  });
});

describe('Shell Layout Structural Components', () => {
  describe('Header Component', () => {
    it('renders logo and project metadata correctly', () => {
      render(
        <Header
          projectName="さくらさくら"
          onOpenDrawer={vi.fn()}
          onOpenSettings={vi.fn()}
        />
      );
      expect(screen.getByTestId('header-logo')).toHaveTextContent(
        'シャミコピー'
      );
      expect(screen.getByTestId('header-project-name')).toHaveTextContent(
        'さくらさくら'
      );
    });

    it('triggers structural modal and drawer control events', () => {
      const drawerMock = vi.fn();
      const settingsMock = vi.fn();
      render(
        <Header
          projectName="さくらさくら"
          onOpenDrawer={drawerMock}
          onOpenSettings={settingsMock}
        />
      );
      fireEvent.click(screen.getByTestId('drawer-toggle-btn'));
      expect(drawerMock).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('settings-toggle-btn'));
      expect(settingsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer Component', () => {
    const timeSig = { numerator: 4, denominator: 4 };

    it('correctly formats measure indices and current playing step indexes', () => {
      render(
        <Footer
          isPlaying={false}
          currentStep={18} // Step 18 = Measure 2, Beat 1 inside a 4/4 sig (16 steps per measure)
          bpm={120}
          timeSignature={timeSig}
          onPlayToggle={vi.fn()}
        />
      );
      expect(screen.getByTestId('current-measure-display')).toHaveTextContent(
        '小節: 2'
      );
      expect(screen.getByTestId('current-step-display')).toHaveTextContent(
        'ステップ: 18'
      );
      expect(screen.getByTestId('current-tempo-display')).toHaveTextContent(
        'テンポ: 120 BPM'
      );
    });

    it('visualizes play toggle button text & switches indicators', () => {
      const toggleMock = vi.fn();
      const { rerender } = render(
        <Footer
          isPlaying={false}
          currentStep={0}
          bpm={100}
          timeSignature={timeSig}
          onPlayToggle={toggleMock}
        />
      );
      expect(screen.getByTestId('play-toggle-btn')).toHaveTextContent('再生');
      fireEvent.click(screen.getByTestId('play-toggle-btn'));
      expect(toggleMock).toHaveBeenCalledTimes(1);

      rerender(
        <Footer
          isPlaying={true}
          currentStep={0}
          bpm={100}
          timeSignature={timeSig}
          onPlayToggle={toggleMock}
        />
      );
      expect(screen.getByTestId('play-toggle-btn')).toHaveTextContent('停止');
    });
  });

  describe('Drawer Component (Project Management)', () => {
    const mockProjects = [
      { id: 'p1', name: 'Song One' },
      { id: 'p2', name: 'Song Two' }
    ];

    it('lists available projects, loaded presets, and emits load requests', () => {
      const selectMock = vi.fn();
      const loadPresetMock = vi.fn();
      const closeMock = vi.fn();

      render(
        <Drawer
          isOpen={true}
          onClose={closeMock}
          projects={mockProjects}
          currentProjectId="p1"
          onSelectProject={selectMock}
          onCreateProject={vi.fn()}
          onDeleteProject={vi.fn()}
          onLoadPreset={loadPresetMock}
        />
      );

      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
      expect(screen.getByText('かえるの合唱')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('drawer-project-item-p2'));
      expect(selectMock).toHaveBeenCalledWith('p2');
      expect(closeMock).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('drawer-preset-item-kaeru'));
      expect(loadPresetMock).toHaveBeenCalledWith('kaeru');
    });

    it('handles new project actions and delete confirm clicks', () => {
      const createMock = vi.fn();
      const deleteMock = vi.fn();
      confirmMock.mockReturnValue(true);

      render(
        <Drawer
          isOpen={true}
          onClose={vi.fn()}
          projects={mockProjects}
          currentProjectId="p1"
          onSelectProject={vi.fn()}
          onCreateProject={createMock}
          onDeleteProject={deleteMock}
          onLoadPreset={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('drawer-new-project-btn'));
      expect(createMock).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('delete-project-btn-p2'));
      expect(confirmMock).toHaveBeenCalled();
      expect(deleteMock).toHaveBeenCalledWith('p2');
    });
  });

  describe('SettingsModal Component', () => {
    const currentProj = {
      name: 'さくらさくら',
      composer: '日本古謡',
      tuning: 'honchoshi',
      bpm: 80,
      basePitch: 48,
      timeSignature: { numerator: 4, denominator: 4 },
      measureCount: 14,
      notes: [{ id: 'n1', pitch: 60, step: 0, length: 4 }]
    };

    it('populates fields and triggers updates on blur or change', () => {
      const updateMock = vi.fn();
      render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
          currentProject={currentProj}
          onUpdateProject={updateMock}
        />
      );

      const nameInput = screen.getByLabelText('プロジェクト名');
      expect(nameInput.value).toBe('さくらさくら');

      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      expect(updateMock).toHaveBeenCalledWith({ name: 'New Name' });

      const tuningSelect = screen.getByLabelText('調弦 (調子)');
      fireEvent.change(tuningSelect, { target: { value: 'niagari' } });
      expect(updateMock).toHaveBeenCalledWith({ tuning: 'niagari' });
    });

    it('emits pitch transpose operations', () => {
      const updateMock = vi.fn();
      render(
        <SettingsModal
          isOpen={true}
          onClose={vi.fn()}
          currentProject={currentProj}
          onUpdateProject={updateMock}
        />
      );

      // Transpose up (+1 semitone)
      fireEvent.click(screen.getByTestId('transpose-up-btn'));
      expect(updateMock).toHaveBeenCalledWith({
        notes: [{ id: 'n1', pitch: 61, step: 0, length: 4 }]
      });
    });
  });
});

describe('App Integration Test Layout', () => {
  it('opens and closes settings modal & project drawer from interface triggers', async () => {
    render(<App />);

    // Drawer is closed by default
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();

    // Open Drawer
    fireEvent.click(screen.getByTestId('drawer-toggle-btn'));
    expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();

    // Close Drawer via overlay click
    fireEvent.click(screen.getByTestId('drawer-overlay'));
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();

    // Modal is closed by default
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();

    // Open Settings Modal
    fireEvent.click(screen.getByTestId('settings-toggle-btn'));
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });

  it('switches between edit panels when tabs are selected', () => {
    render(<App />);

    const bunkaTab = screen.getByTestId('tab-bunkafu');

    // Default tab
    expect(screen.getByTestId('piano-roll')).toBeInTheDocument();
    expect(screen.queryByTestId('bunkafu-view')).not.toBeInTheDocument();

    // Switch tab
    fireEvent.click(bunkaTab);
    expect(screen.queryByTestId('piano-roll')).not.toBeInTheDocument();
    expect(screen.getByTestId('bunkafu-view')).toBeInTheDocument();
  });
});
