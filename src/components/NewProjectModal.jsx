import React, { useState, useRef } from 'react';
import { PRESETS } from '../data/presets';
import { JA } from '../i18n/ja';
import { importAllData } from '../utils/storage';
import Modal from './common/Modal';
import aiPromptText from '../data/aiPrompt.txt?raw';

export function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  onLoadPreset
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'preset', 'create', 'restore'

  // Create New Project Form State
  const [name, setName] = useState('');
  const [composer, setComposer] = useState('');
  const [tuning, setTuning] = useState('honchoshi');
  const [basePitch, setBasePitch] = useState(48);
  const [bpm, setBpm] = useState(100);
  const [measureCount, setMeasureCount] = useState(8);
  const [timeSignature, setTimeSignature] = useState({
    numerator: 4,
    denominator: 4
  });
  const [uploadedNotes, setUploadedNotes] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [jsonText, setJsonText] = useState('');

  const notesFileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleNotesUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        // Supports either { notes: [...] } or direct array [...]
        const notes = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.notes)
            ? parsed.notes
            : null;
        if (notes) {
          // Remove ID from imported notes as per requirement "notesの情報のidが必要ないなら消してください"
          // (We strip ID if present, useNoteEditor will generate temporary ones on load/add)
          const cleanNotes = notes.map(({ id, ...rest }) => ({
            id: crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2, 9),
            ...rest
          }));
          setUploadedNotes(cleanNotes);
          // Auto-populate other project metadata if available in JSON
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            if (parsed.name) setName(parsed.name);
            if (parsed.composer) setComposer(parsed.composer);
            if (parsed.bpm) setBpm(Number(parsed.bpm));
            if (parsed.measureCount)
              setMeasureCount(Number(parsed.measureCount));
            if (parsed.tuning) setTuning(parsed.tuning);
            if (parsed.basePitch) setBasePitch(Number(parsed.basePitch));
          }
        } else {
          alert(
            '無効な譜面データフォーマットです。JSON配列を指定してください。'
          );
          setUploadFileName('');
          setUploadedNotes(null);
        }
      } catch {
        alert('JSONファイルの読み込みに失敗しました。');
        setUploadFileName('');
        setUploadedNotes(null);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonTextChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    if (!text.trim()) {
      setUploadedNotes(null);
      setUploadFileName('');
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const notes = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.notes)
          ? parsed.notes
          : null;
      if (notes) {
        const cleanNotes = notes.map(({ id, ...rest }) => ({
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9),
          ...rest
        }));
        setUploadedNotes(cleanNotes);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          if (parsed.name) setName(parsed.name);
          if (parsed.composer) setComposer(parsed.composer);
          if (parsed.bpm) setBpm(Number(parsed.bpm));
          if (parsed.measureCount)
            setMeasureCount(Number(parsed.measureCount));
          if (parsed.tuning) setTuning(parsed.tuning);
          if (parsed.basePitch) setBasePitch(Number(parsed.basePitch));
        }
      }
    } catch {
      // Ignore syntax errors while typing
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    let notesToSubmit = uploadedNotes;

    if (jsonText.trim()) {
      try {
        const parsed = JSON.parse(jsonText);
        const notes = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.notes)
            ? parsed.notes
            : null;
        if (!notes) {
          alert(
            '無効な譜面データフォーマットです。JSON配列を指定してください。'
          );
          return;
        }
        notesToSubmit = notes.map(({ id, ...rest }) => ({
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 9),
          ...rest
        }));
      } catch {
        alert('JSONの解析に失敗しました。フォーマットを確認してください。');
        return;
      }
    }

    onCreateProject({
      name: name.trim() || '無題のプロジェクト',
      composer: composer.trim(),
      tuning,
      basePitch,
      bpm,
      measureCount,
      timeSignature,
      notes: notesToSubmit || []
    });

    // Reset state
    setName('');
    setComposer('');
    setUploadedNotes(null);
    setUploadFileName('');
    setJsonText('');
    onClose();
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importAllData(event.target.result);
      if (success) {
        alert('バックアップからの復元が完了しました。ページをリロードします。');
        window.location.reload();
      } else {
        alert(
          'バックアップデータの復元に失敗しました。ファイルを確認してください。'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };



  const copyPromptToClipboard = () => {
    navigator.clipboard
      .writeText(aiPromptText)
      .then(() => {
        alert('プロンプトをクリップボードにコピーしました。');
      })
      .catch(() => {
        alert('コピーに失敗しました。手動でコピーしてください。');
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新規プロジェクト">
      {/* Tabs */}
      <div className="flex border-b border-nouaiBlue/20 mb-4 text-xs font-bold">
        <button
          type="button"
          data-testid="new-project-tab-create"
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'create'
              ? 'border-shamiRed text-shamiRed'
              : 'border-transparent text-nouaiBlue/60 hover:text-nouaiBlue'
          }`}
        >
          新規作成
        </button>
        <button
          type="button"
          data-testid="new-project-tab-preset"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'preset'
              ? 'border-shamiRed text-shamiRed'
              : 'border-transparent text-nouaiBlue/60 hover:text-nouaiBlue'
          }`}
        >
          プリセットから作成
        </button>
        <button
          type="button"
          data-testid="new-project-tab-restore"
          onClick={() => setActiveTab('restore')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'restore'
              ? 'border-shamiRed text-shamiRed'
              : 'border-transparent text-nouaiBlue/60 hover:text-nouaiBlue'
          }`}
        >
          バックアップから復元
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-sm">
        {activeTab === 'create' && (
          <form
            onSubmit={handleCreateSubmit}
            className="space-y-4"
            data-testid="create-project-form"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="new-proj-name"
                className="font-bold text-nouaiBlue/80"
              >
                プロジェクト名
              </label>
              <input
                id="new-proj-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="プロジェクト名を入力"
                className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="new-proj-composer"
                className="font-bold text-nouaiBlue/80"
              >
                作曲者
              </label>
              <input
                id="new-proj-composer"
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="作曲者を入力"
                className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="new-proj-tuning"
                  className="font-bold text-nouaiBlue/80"
                >
                  調弦 (調子)
                </label>
                <select
                  id="new-proj-tuning"
                  value={tuning}
                  onChange={(e) => setTuning(e.target.value)}
                  className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
                >
                  <option value="honchoshi">本調子</option>
                  <option value="niagari">二上がり</option>
                  <option value="sansagari">三下り</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="new-proj-base-pitch"
                  className="font-bold text-nouaiBlue/80"
                >
                  基準音
                </label>
                <select
                  id="new-proj-base-pitch"
                  value={basePitch}
                  onChange={(e) => setBasePitch(Number(e.target.value))}
                  className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
                >
                  {Array.from({ length: 37 }, (_, i) => 45 + i).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="new-proj-bpm"
                  className="font-bold text-nouaiBlue/80"
                >
                  テンポ (BPM)
                </label>
                <input
                  id="new-proj-bpm"
                  type="number"
                  min="40"
                  max="240"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="px-2 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label
                  htmlFor="new-proj-ts-num"
                  className="font-bold text-nouaiBlue/80"
                >
                  拍子
                </label>
                <div className="flex items-center gap-1">
                  <select
                    id="new-proj-ts-num"
                    value={timeSignature.numerator}
                    onChange={(e) =>
                      setTimeSignature({
                        ...timeSignature,
                        numerator: Number(e.target.value)
                      })
                    }
                    className="flex-1 px-2 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                  </select>
                  <span className="text-nouaiBlue">/</span>
                  <select
                    id="new-proj-ts-den"
                    value={timeSignature.denominator}
                    onChange={(e) =>
                      setTimeSignature({
                        ...timeSignature,
                        denominator: Number(e.target.value)
                      })
                    }
                    className="flex-1 px-2 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="new-proj-measures"
                className="font-bold text-nouaiBlue/80"
              >
                小節数
              </label>
              <input
                id="new-proj-measures"
                type="number"
                min="1"
                max="100"
                value={measureCount}
                onChange={(e) => setMeasureCount(Number(e.target.value))}
                className="px-3 py-2 border border-nouaiBlue/25 rounded bg-white focus:outline-none focus:border-shamiRed text-nouaiBlue"
              />
            </div>

            {/* JSON notes upload */}
            <div className="border border-nouaiBlue/10 rounded p-3 bg-white/50 flex flex-col gap-2">
              <span className="block font-bold text-xs text-nouaiBlue/80">
                譜面データ (JSON)
              </span>
              <textarea
                data-testid="notes-json-textarea"
                value={jsonText}
                onChange={handleJsonTextChange}
                placeholder="ここに譜面データ (JSON) を入力するか、下のボタンからファイルを読み込んでください"
                rows={5}
                className="w-full text-xs p-2 border border-nouaiBlue/25 rounded bg-white text-nouaiBlue focus:outline-none focus:border-shamiRed font-mono resize-y"
              />
              <div className="flex gap-2 items-center mt-1">
                <button
                  type="button"
                  data-testid="upload-notes-btn"
                  onClick={() => notesFileInputRef.current?.click()}
                  className="px-3 py-1.5 border border-nouaiBlue text-nouaiBlue rounded text-xs hover:bg-nouaiBlue hover:text-washiWhite transition-all font-semibold"
                >
                  JSONファイルを選択
                </button>
                <span className="text-xs text-nouaiBlue/60 truncate max-w-[200px]">
                  {uploadFileName ||
                    '選択されていません (空のプロジェクトを作成)'}
                </span>
              </div>
              <input
                ref={notesFileInputRef}
                type="file"
                accept=".json"
                onChange={handleNotesUpload}
                className="hidden"
                data-testid="notes-file-input"
              />
            </div>

            {/* AI Prompt Section */}
            <div className="border border-nouaiBlue/10 rounded p-3 bg-white/50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-nouaiBlue/80">
                  楽譜データ作成用 AIプロンプト
                </span>
                <button
                  type="button"
                  onClick={copyPromptToClipboard}
                  className="text-[10px] text-shamiRed font-bold hover:underline"
                  data-testid="copy-prompt-btn"
                >
                  プロンプトをコピー
                </button>
              </div>
              <textarea
                readOnly
                value={aiPromptText}
                rows={3}
                className="w-full text-xs p-2 bg-neutral-50 border border-nouaiBlue/10 rounded text-nouaiBlue/75 resize-none focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-nouaiBlue/30 hover:bg-nouaiBlue/5 rounded text-xs font-bold transition-all text-nouaiBlue"
              >
                キャンセル
              </button>
              <button
                type="submit"
                data-testid="create-project-submit"
                className="bg-shamiRed hover:bg-shamiRed/80 text-washiWhite px-4 py-2 rounded font-bold text-xs transition-colors"
              >
                作成する
              </button>
            </div>
          </form>
        )}

        {activeTab === 'preset' && (
          <div className="space-y-4">
            <p className="text-xs text-nouaiBlue/75">
              以下のプリセット曲から選んでプロジェクトを新規作成します。
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(PRESETS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  data-testid={`preset-project-btn-${key}`}
                  onClick={() => {
                    onLoadPreset(key);
                    onClose();
                  }}
                  className="p-3 border border-nouaiBlue/10 hover:border-shamiRed hover:bg-shamiRed/5 text-left text-xs rounded transition-all truncate text-nouaiBlue font-medium bg-white"
                >
                  {value.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-nouaiBlue/30 hover:bg-nouaiBlue/5 rounded text-xs font-bold transition-all text-nouaiBlue"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {activeTab === 'restore' && (
          <div className="space-y-4">
            <p className="text-xs text-nouaiBlue/75">
              過去にエクスポートしたバックアップデータ（すべてのプロジェクト情報を含むJSON）から復元します。
              <span className="text-shamiRed font-bold block mt-1">
                ※注意:
                現在保存されているすべてのプロジェクトデータが上書きされます。
              </span>
            </p>
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-nouaiBlue/20 rounded bg-white">
              <button
                type="button"
                data-testid="restore-backup-btn"
                onClick={() => backupFileInputRef.current?.click()}
                className="bg-shamiRed hover:bg-shamiRed/80 text-washiWhite px-6 py-2.5 rounded font-bold text-xs transition-colors shadow-sm"
              >
                バックアップファイルを選択
              </button>
              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
                data-testid="backup-file-input"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-nouaiBlue/30 hover:bg-nouaiBlue/5 rounded text-xs font-bold transition-all text-nouaiBlue"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default NewProjectModal;
