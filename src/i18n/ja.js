export const JA = {
  app: {
    title: 'シャミコピー (Syamicopy)',
    subtitle: '三味線 ピアノロール＆文化譜エディタ'
  },
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    close: '閉じる',
    edit: '編集',
    create: '作成',
    add: '追加',
    success: '成功',
    error: 'エラー',
    loading: '読み込み中...',
    preset: 'プリセット'
  },
  header: {
    projectNamePlaceholder: '無題のプロジェクト',
    projectSettings: 'プロジェクト設定',
    projectList: 'プロジェクト一覧'
  },
  tabs: {
    pianoRoll: 'ピアノロール',
    bunkafu: '文化譜'
  },
  footer: {
    play: '再生',
    stop: '停止',
    currentStep: 'ステップ: {step}',
    currentMeasure: '小節: {measure}',
    tempo: 'テンポ: {bpm} BPM'
  },
  settings: {
    title: 'プロジェクト設定',
    projectName: 'プロジェクト名',
    composer: '作曲者',
    memo: 'メモ / 歌詞',
    tuning: '調弦 (調子)',
    honchoshi: '本調子 (C-F-C)',
    niagari: '二上り (C-G-C)',
    sansagari: '三下り (C-F-B♭)',
    basePitch: '基準音 (一の糸の開放弦音高)',
    bpm: 'テンポ (BPM)',
    timeSignature: '拍子',
    measureCount: '小節数',
    tuningHelp:
      '※調子を変更すると、対応する文化譜の勘所（ポジション）の計算が自動で調整されます。'
  },
  project: {
    drawerTitle: 'プロジェクト管理',
    createTitle: '新規プロジェクト作成',
    editTitle: 'プロジェクト情報編集',
    noProjects:
      'プロジェクトがありません。新しいプロジェクトを作成するか、プリセットを読み込んでください。',
    newProjectBtn: '新規プロジェクト',
    loadPresetBtn: 'プリセットを読み込む',
    selectPresetTitle: 'プリセットを選択してください',
    confirmDelete:
      '本当にこのプロジェクト「{name}」を削除しますか？\nこの操作は取り消せません。',
    lastSaved: '最終保存: {time}'
  },
  importExport: {
    title: 'データの入出力',
    importBtn: 'インポート',
    exportBtn: 'エクスポート',
    importJsonTitle: 'プロジェクトJSONインポート',
    exportJsonTitle: 'プロジェクトJSONエクスポート',
    importNotesTitle: 'ノーツデータ(JSON)のインポート',
    exportNotesTitle: 'ノーツデータ(JSON)のエクスポート',
    exportImageTitle: '文化譜を画像として保存',
    exportImageBtn: '文化譜画像出力',
    dragDropText:
      'ファイルをここにドラッグ＆ドロップするか、クリックしてファイルを選択してください',
    importSuccess: 'インポートが完了しました。',
    importFailed:
      'インポートに失敗しました。正しいJSON形式であることを確認してください。',
    clipboardCopy: 'クリップボードにコピー',
    copied: 'コピーしました！'
  },
  editor: {
    clearNotesBtn: 'すべてのノーツをクリア',
    confirmClear: '配置されたすべてのノーツを削除しますか？',
    pianoRollGrid: 'ピアノロールグリッド',
    stringLabel: '{num}の糸',
    string0: '一の糸',
    string1: '二の糸',
    string2: '三の糸',
    tsuboLabel: '勘所: {tsubo}',
    pitchLabel: '音高: {pitch}',
    snapTitle: 'スナップ',
    gridInstructions:
      'グリッド上をクリックして音符を配置します。ドラッグで移動、右端をドラッグで長さを調整できます。'
  },
  bunkafu: {
    exportPdf: 'PDF出力',
    exportPng: 'PNG出力',
    emptyMessage:
      '音符が配置されていません。ピアノロールで音符を追加してください。',
    tuningLabel: '調子: {tuning}',
    basePitchLabel: '本調子基準音: {pitch}',
    pageNumber: 'ページ: {current} / {total}'
  }
};

export const ja = JA;
export default JA;
