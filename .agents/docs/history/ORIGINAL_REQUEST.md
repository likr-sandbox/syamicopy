# Original User Request

## 2026-07-18T17:04:54Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Syamicopy: 三味線の文化譜（ぶんかふ）を作成・管理するPWAアプリケーション。プロトタイプコードを基に、プロジェクト管理、正確な文化譜表記、スマホ最適化のUIを実装する。

Working directory: /home/likr/syamscore

Integrity mode: development

## Requirements

### R1. プロジェクト基盤の構築
- React + JavaScript + Vite によるPWAプロジェクトの構築。
- Linter/Formatter として Biome を導入。
- ユニットテストに Vitest、E2Eテストに Playwright を導入。
- CI (GitHub Actions) と CD (Netlify) の設定。

### R2. コアロジック（ユーティリティモジュール）
- `src/utils/music.js`: 音楽理論（MIDI、黒鍵、ピッチラベル）ユーティリティ。
- `src/utils/shamisen.js`: 調弦データ（本調子・二上がり・三下り）、勘所（0, 1, 2, 3, #, 4, 5, 6, 7, 8, 9, b, 10...）マッピング。
- `src/utils/audio.js`: Web Audio API（sawtooth + エンベロープ）を用いた三味線音源再生。
- `src/utils/storage.js`: LocalStorageによるプロジェクトの保存/読込、エクスポート/インポート。
- `src/utils/timeSignature.js`: 拍子・小節ごとのステップ数計算。

### R3. データおよびUIコンポーネント
- 10曲のプリセット曲（かえるの合唱、さくらさくら等）と、AI向けプロンプトテンプレートの搭載。
- Reactによるコンポーネント構造（Header, Footer, Drawer, SettingsModal, PianoRoll, BunkafuView, BunkafuExport, ImportModal等）。
- ピアノロールでのノート編集（ドラッグ移動、リサイズ、タップ削除）。
- 文化譜ビューでの正式な文化譜表記（勘所番号、休符「●」、音価下線、伸ばし棒「ー」）。
- html2canvasを用いた、4小節一行の段組みレイアウトによる文化譜画像エクスポート。

## Acceptance Criteria

### 自動テストの通過
- [ ] `npx biome check .` でエラーがないこと。
- [ ] `npx vitest run` でユニットテスト（調弦、勘所マッピング、拍子計算、ストレージ等）が全てパスすること。
- [ ] `npx playwright test` でE2Eテスト（初期表示、プリセット読込、ノート配置、タブ切替等）が全てパスすること。

### UI/UXと基本機能の動作
- [ ] ピアノロールで音を聴きながらノートが配置でき、ドラッグ移動や長さ変更ができること。
- [ ] 文化譜ビューで、配置したノートが正式な文化譜（上から三・二・一の糸、休符「●」、音価の下線、伸ばし棒「ー」）として正確に表示されること。
- [ ] PWAとしてインストール可能で、オフラインでも起動し、Google Fontsなどがキャッシュされること。
- [ ] 譜面のJSONインポート/エクスポートおよび、文化譜の画像保存（4小節ごとの段組み）が動作すること。

## 2026-07-19T03:05:22Z

三味線の文化譜（ぶんかふ）を作成・編集・再生・画像書き出し可能なPWAアプリケーション「Syamicopy」の実装を完了し、すべてのE2Eテストをパスさせる。

Working directory: /home/likr/syamscore
Integrity mode: development

## Requirements

### R1. E2Eテストの不具合修正と完全パス
- 以下のテストで発生している不具合を解消し、`npx playwright test` すべてのテスト（58件）をパスさせる。
  1. **Strict Mode Violation**: `bunkafu-scroll-container` と `bunkafu-export-container` の両方に同じ `data-testid="bunkafu-note-*"` などのテスト用識別子が存在するため、Playwrightが要素を特定できず失敗する問題を修正する。
  2. **画像保存ファイル名**: PNG画像エクスポート時のデフォルトファイル名が、テスト側の期待値である `shamisen_score.png` に一致しない問題を修正する（プロジェクトのデフォルト名やエクスポートロジックの調整）。
  3. **重複ノート追加**: 同じステップ・ピッチのセルをクリックした際に、重複してノートが追加されないようにするバリデーションを実装/修正する。
  4. **PWA Service Worker登録**: テスト環境においてサービスワーカーの登録準備（`navigator.serviceWorker.ready`）がタイムアウトする問題を特定・修正する。

### R2. 静的解析チェックの維持
- `npx biome check` を実行した際、プロジェクトコードおよびテストコードにおいて、警告やエラーが一切出ない状態を維持する。

## Verification Resources
- プロジェクト内に配置されている Playwright テストスイート (`e2e/*.spec.js`)
- Biome Linter / Formatter 設定 (`biome.json`)

## Acceptance Criteria

### E2Eテスト
- [ ] `npx playwright test` を実行した際、すべてのテストケース（58件）がエラーなしで成功すること。

### コード品質
- [ ] `npx biome check` を実行した際、エラーや警告が0件であること。
