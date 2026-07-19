# Syamicopy — 三味線文化譜作成アプリ 実装計画

三味線の文化譜（ぶんかふ）を作成・管理するPWAアプリケーション。プロトタイプコードを基に、プロジェクト管理、正確な文化譜表記、スマホ最適化のUIを実装する。

## 設計決定サマリー

| 項目 | 決定 |
|------|------|
| フレームワーク | React + JavaScript + Vite |
| Linter/Formatter | Biome |
| ユニットテスト | Vitest |
| E2Eテスト | Playwright |
| CI | GitHub Actions |
| CD | Netlify (GitHub連携) |
| URL | syamicopy.netlify.app |
| 音源 | Web Audio API (sawtooth + エンベロープ) |
| フォント | Noto Sans JP (Google Fonts) |
| カラースキーム | 和風モダン (朱赤 #8B2500, 和紙白 #FDFBF7, 濃藍 #1B3A4B) |
| 画像保存 | html2canvas (npm) |
| i18n | 日本語メイン、英語対応を将来的に考慮（初期はUIテキストを定数ファイルにまとめるのみ） |
| リポジトリ | likr-sandbox/syamicopy |

---

## Proposed Changes

### 1. プロジェクト基盤

#### [NEW] Viteプロジェクト初期化

- `npx -y create-vite@latest ./ --template react` で初期化
- npm依存パッケージのインストール:
  - `html2canvas` — 文化譜の画像保存
  - `@biomejs/biome` — Linter/Formatter
  - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` — ユニットテスト
  - `@playwright/test` — E2Eテスト
  - `vite-plugin-pwa`, `workbox-window` — PWA対応

#### [NEW] biome.json

Biomeの設定ファイル。JavaScript/JSX対応のlint + formatルールを定義。

#### [NEW] netlify.toml

Netlifyのビルド設定。`npm run build`、公開ディレクトリ `dist`、SPA用リダイレクト設定。

#### [NEW] .github/workflows/ci.yml

GitHub Actionsワークフロー:
1. Biome lint + format チェック
2. Vitest ユニットテスト
3. Playwright E2Eテスト（ビルド後）

#### [NEW] vite.config.js

Vite設定。PWAプラグイン、テスト設定を含む。

---

### 2. コアロジック（ユーティリティモジュール）

#### [NEW] src/utils/music.js

音楽理論に関するユーティリティ:
- `isBlackKey(pitch)` — 黒鍵判定
- `getPitchLabel(pitch)` — 国際式表記 (C3, D#4, G♭2)。シャープは`#`、フラットは`♭`
- `midiToFrequency(pitch)` — MIDI→周波数変換

#### [NEW] src/utils/shamisen.js

三味線の文化譜関連ロジック:
- **調弦データ**: 調子ごとの相対音程（完全4度、完全5度、短7度など）+ 基準音から絶対ピッチを計算
  - 本調子: 一の糸, +完全4度, +完全8度
  - 二上り: 一の糸, +完全5度, +完全8度
  - 三下り: 一の糸, +完全4度, +短7度
- **勘所マッピング**: 正式な文化譜体系 `0, 1, 2, 3, #, 4, 5, 6, 7, 8, 9, b, 10` (12半音) + 高位勘所 `11, 12...`

> [!IMPORTANT]
> プロトタイプの `getTsuboNumber` は `3#`, `8#` を使っていますが、文化譜の正式な体系では `#` と `b` は独立した勘所番号です。
> - 半音0→`0`, 1→`1`, 2→`2`, 3→`3`, 4→`#`, 5→`4`, 6→`5`, 7→`6`, 8→`7`, 9→`8`, 10→`9`, 11→`b`, 12→`10`

- `convertToShamisenNote(pitch, tuningKey, basePitch)` — ピッチを糸+勘所に変換
- `getStringOpenPitches(tuningKey, basePitch)` — 各弦の開放弦ピッチを計算

#### [NEW] src/utils/audio.js

Web Audio API関連:
- `createAudioContext()` — AudioContext管理
- `playShamisenSound(ctx, pitch, duration?)` — 三味線風の音を再生（sawtooth + エンベロープ）
- `startSustainedNote(ctx, pitch)` / `stopSustainedNote(oscillator)` — 鍵盤の押しっぱなし再生/停止

#### [NEW] src/utils/storage.js

localStorage操作:
- `saveProjects(projects)` / `loadProjects()` — プロジェクト一覧の保存/読込
- `saveCurrentProjectId(id)` / `loadCurrentProjectId()` — 現在のプロジェクトID
- `exportAllData()` — 全データをJSONとしてエクスポート
- `importAllData(json)` — JSONから全データを復元
- `exportProjectNotes(notes)` — 譜面データのみエクスポート
- `importProjectNotes(json)` — 譜面データのみインポート

#### [NEW] src/utils/timeSignature.js

拍子関連:
- 拍子定義: `{ numerator, denominator }` (例: {4,4}, {2,4}, {3,4}, {6,8})
- `getStepsPerBeat(timeSignature)` — 拍子に応じた1拍のステップ数
- `getStepsPerMeasure(timeSignature)` — 1小節のステップ数
- `getTotalSteps(timeSignature, measureCount)` — 総ステップ数

#### [NEW] src/utils/constants.js

共通定数:
- `ROW_HEIGHT`, `STEP_WIDTH` — 描画用定数
- `MIN_PITCH = 45` (A2), `MAX_PITCH = 81` (A5)
- `DEFAULT_BPM`, `DEFAULT_TUNING`, `DEFAULT_BASE_PITCH`, `DEFAULT_TIME_SIGNATURE`, `DEFAULT_MEASURE_COUNT`
- `TIME_SIGNATURES` — 選択可能な拍子リスト

---

### 3. データ構造

#### プロジェクトデータ

```js
{
  id: "uuid",
  name: "プロジェクト名",
  composer: "作曲者名",
  memo: "メモ",
  tuning: "honchoshi",        // 調子キー
  basePitch: 48,              // 一の糸の基準MIDI音 (C3がデフォルト)
  timeSignature: { numerator: 4, denominator: 4 },
  bpm: 100,
  measureCount: 8,
  notes: [
    { id: "uuid", pitch: 48, step: 0, length: 4 },
    ...
  ],
  createdAt: "ISO8601",
  updatedAt: "ISO8601"
}
```

#### [NEW] src/data/presets.js

プリセット曲データ (10曲):
1. かえるの合唱 (既存)
2. さくらさくら (既存)
3. チューリップ (既存)
4. うさぎとかめ
5. きらきら星
6. ふるさと
7. たなばた
8. 赤とんぼ
9. お正月
10. うみ

#### [NEW] src/data/aiPrompt.js

生成AI向けプロンプトテンプレート。文化譜のJSONフォーマットの説明と例を含む。

---

### 4. React コンポーネント構成

```
src/
├── App.jsx                    # メインコンポーネント
├── main.jsx                   # エントリーポイント
├── index.css                  # グローバルスタイル + デザインシステム
├── components/
│   ├── Header.jsx             # ヘッダー（ハンバーガーメニュー + アプリ名 + ギアアイコン）
│   ├── Footer.jsx             # フッター（再生/停止 + タブ切り替え）
│   ├── Drawer.jsx             # サイドメニュー（プロジェクト管理、バックアップ等）
│   ├── SettingsModal.jsx      # 設定モーダル（調子、基準音、拍子、BPM、小節数）
│   ├── PianoRoll/
│   │   ├── PianoRoll.jsx      # ピアノロール全体（横スクロールのみ）
│   │   ├── Keyboard.jsx       # 左端の鍵盤（Sticky、音が鳴る）
│   │   ├── Grid.jsx           # グリッド入力領域
│   │   └── NoteBlock.jsx      # 個別ノート（ドラッグ移動 + リサイズ + タップ削除）
│   ├── BunkafuView/
│   │   ├── BunkafuView.jsx    # 文化譜ビュー全体（横スクロール一行表示）
│   │   ├── BunkafuNote.jsx    # 文化譜上の音符（勘所番号 + 音価表示）
│   │   └── BunkafuExport.jsx  # 画像保存用（4小節一行の段組みレイアウト）
│   ├── ImportExport/
│   │   ├── ImportModal.jsx    # 譜面データインポート + AIプロンプト表示
│   │   └── ExportModal.jsx    # 譜面データエクスポート
│   └── common/
│       ├── Modal.jsx          # 汎用モーダル
│       ├── TabBar.jsx         # タブ切り替えUI
│       └── IconButton.jsx     # アイコンボタン
├── hooks/
│   ├── useProjects.js         # プロジェクト管理フック
│   ├── useAudio.js            # 音声再生フック（再生/停止、鍵盤音）
│   ├── useNoteEditor.js       # ノート編集フック（追加/削除/移動/リサイズ）
│   └── useAutoScroll.js       # 再生連動の自動スクロール
├── utils/                     # (上述)
└── data/                      # (上述)
```

#### [NEW] App.jsx

メインレイアウト:
- 固定ヘッダー + 固定フッター + メインコンテンツエリア
- ドロワー（サイドメニュー）のオーバーレイ表示
- 設定モーダル
- タブ切り替え（ピアノロール / 文化譜）

#### [NEW] Header.jsx

- 左: ハンバーガーメニューアイコン（ドロワーのトグル）
- 中央: アプリ名「Syamicopy」+ 現在のプロジェクト名
- 右: ギアアイコン（設定モーダルのトグル）

#### [NEW] Footer.jsx

- 左: 再生/停止ボタン + 現在位置表示
- 右: タブ切り替え（🎹 ピアノロール / 📜 文化譜）

#### [NEW] Drawer.jsx

サイドメニューの内容:
- **プロジェクト一覧**: プロジェクト選択、新規作成、削除
- **プリセット読み込み**: 10曲のプリセットから選択して新規プロジェクトとして作成
- **譜面データ**: import (JSON) / export (JSON)
- **バックアップ**: 全データのダウンロード / アップロード復元
- 各セクションはアコーディオンまたはセクション見出しで区切る

#### [NEW] SettingsModal.jsx

モーダル内の設定項目:
- プロジェクト名（テキスト入力）
- 作曲者名（テキスト入力）
- メモ（テキストエリア）
- 調子（ドロップダウン: 本調子/二上り/三下り）
- 基準音（ドロップダウン: C〜Bの12音）
- 拍子（ドロップダウン: 2/4, 3/4, 4/4, 6/8）
- BPM（数値入力 40〜240）
- 小節数（数値入力 4〜128）
- 移調ボタン（+/- 半音）

#### [NEW] PianoRoll.jsx

- 横スクロールのみのピアノロールエリア
- 左端にSticky鍵盤（Keyboard.jsx）
- グリッド上にノートブロックを配置
- 拍子に応じたグリッド線の描画
- 再生中のカレントステップハイライト
- 自動スクロール

#### [NEW] Keyboard.jsx

- MIDI 45(A2)〜81(A5) の鍵盤を描画
- 黒鍵/白鍵の視覚的区別
- **選択されている調子の各弦の開放弦ピッチをハイライト表示**
- **PointerDown で音が鳴り始め、PointerUp で音が止まる**

#### [NEW] NoteBlock.jsx

- ノートブロックの描画
- タップで削除
- 右端ドラッグで長さ変更
- **ドラッグ＆ドロップで位置移動**（PointerEvents使用）

#### [NEW] BunkafuView.jsx

- 横スクロール一行表示の文化譜ビュー
- 3本の糸（横線）の描画
- 勘所番号の配置（正式な文化譜体系に準拠）
- 音価表示（下線なし=四分音符、1本=八分音符、2本=十六分音符）
- **休符「●」を二の糸（中央線）上に自動表示**
- 伸ばし棒「ー」の表示
- 再生中のカレントステップハイライト
- 自動スクロール

#### [NEW] BunkafuExport.jsx

画像保存用の非表示コンポーネント:
- **4小節を一行として段組みレイアウト**で描画
- html2canvasで画像化して保存

#### [NEW] ImportModal.jsx

- JSONファイルのアップロードUI
- **AIプロンプトの常時表示テキストエリア + コピーボタン**
- プロンプト内容: 文化譜のJSONフォーマット仕様の説明と例

---

### 5. PWA対応

#### [NEW] public/manifest.json

PWAマニフェスト:
- `name`: "Syamicopy"
- `short_name`: "Syamicopy"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#FDFBF7"
- `theme_color`: "#8B2500"
- アイコン (192x192, 512x512)

#### [NEW] Service Worker

vite-plugin-pwa を使用してWorkboxベースのサービスワーカーを自動生成。
- precache: HTML, CSS, JS, フォント
- runtime cache: Google Fonts

#### [NEW] アプリアイコン

generate_image ツールで和風テイストの三味線アイコンを生成:
- 512x512 PNG → favicon, OGP, PWAアイコン用
- 192x192 PNG → PWAアイコン用
- favicon.ico → 16x16, 32x32

---

### 6. OGP / SEO

#### [MODIFY] index.html

- `<title>Syamicopy - 三味線文化譜作成アプリ</title>`
- `<meta name="description">` — アプリの説明
- OGPメタタグ (og:title, og:description, og:image, og:url)
- Twitter Cardメタタグ
- favicon設定
- PWAマニフェストリンク
- `<meta name="theme-color" content="#8B2500">`
- Noto Sans JP フォント読み込み

---

### 7. テスト

#### [NEW] src/utils/__tests__/shamisen.test.js

ユニットテスト:
- 勘所マッピングの正確性（正式な文化譜体系）
- 調弦計算の正確性（各調子 × 各基準音）
- `convertToShamisenNote` の糸/勘所変換
- 範囲外ピッチのハンドリング

#### [NEW] src/utils/__tests__/music.test.js

- 黒鍵判定
- ピッチラベル（国際式表記）
- MIDI→周波数変換

#### [NEW] src/utils/__tests__/timeSignature.test.js

- 各拍子のステップ計算
- 小節数との組み合わせ

#### [NEW] src/utils/__tests__/storage.test.js

- localStorage のモック
- プロジェクトの保存/読み込み
- バックアップのエクスポート/インポート

#### [NEW] e2e/app.spec.js

Playwright E2Eテスト:
- アプリの初期表示
- プリセット曲の読み込み
- ピアノロールへのノート配置/削除
- タブ切り替え（ピアノロール ↔ 文化譜）
- 設定モーダルの操作
- プロジェクトの作成/切り替え
- 譜面データのエクスポート/インポート

#### [NEW] playwright.config.js

Playwright設定。ローカル開発サーバー自動起動、モバイルビューポート。

---

### 8. CI/CD

#### [NEW] .github/workflows/ci.yml

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    - Biome check (lint + format)
  test:
    - Vitest (unit tests)
  e2e:
    - Playwright (E2E tests)
    - ビルド後にローカルサーバーで実行
```

#### Netlifyデプロイ

- Netlify CLIでサイト `syamicopy` を作成
- GitHubリポジトリ `likr-sandbox/syamicopy` と連携
- mainブランチへのpushで自動デプロイ

---

### 9. 文化譜の正式な表記への修正

プロトタイプからの主な修正点:

> [!IMPORTANT]
> 以下の修正は shamisen-bunkafu スキルの知識に基づいています。

1. **勘所体系の修正**: `3#`, `8#` → `#`, `b` を独立勘所として扱う
2. **休符の表示**: 音符のない拍に `●` を二の糸上に表示
3. **音価の下線表記**: 四分音符=下線なし、八分音符=1本、十六分音符=2本
4. **糸の表記順序**: 上から三の糸、二の糸、一の糸（プロトタイプと同じ、正しい）
5. **伸ばし棒**: 四分音符より長い音は「ー」で表示

---

## 補足事項

### プリセット曲について

追加する7曲のMIDIデータ（pitch, step, length）は、楽曲の旋律を正確にマッピングして作成する。著作権上問題のないパブリックドメインの楽曲のみを使用する。

### i18n対応について

初期リリースでは日本語のみ。UIテキストを定数ファイル (`src/i18n/ja.js`) にまとめる構造とし、将来的なreact-i18next等の導入を容易にする。

---

## Verification Plan

### Automated Tests

```bash
# Biome lint + format check
npx biome check .

# Unit tests
npx vitest run

# E2E tests
npx playwright test
```

### Manual Verification

- スマホ実機またはChrome DevToolsのモバイルエミュレーションでUI確認
- PWAのインストール動作確認
- syamicopy.netlify.app でのデプロイ確認
- プリセット曲の再生と文化譜表示の正確性確認

---

## ファイル構成の全体像

```
syamicopy/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── manifest.json
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── og-image.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Drawer.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── PianoRoll/
│   │   │   ├── PianoRoll.jsx
│   │   │   ├── Keyboard.jsx
│   │   │   ├── Grid.jsx
│   │   │   └── NoteBlock.jsx
│   │   ├── BunkafuView/
│   │   │   ├── BunkafuView.jsx
│   │   │   ├── BunkafuNote.jsx
│   │   │   └── BunkafuExport.jsx
│   │   ├── ImportExport/
│   │   │   ├── ImportModal.jsx
│   │   │   └── ExportModal.jsx
│   │   └── common/
│   │       ├── Modal.jsx
│   │       ├── TabBar.jsx
│   │       └── IconButton.jsx
│   ├── hooks/
│   │   ├── useProjects.js
│   │   ├── useAudio.js
│   │   ├── useNoteEditor.js
│   │   └── useAutoScroll.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── music.js
│   │   ├── shamisen.js
│   │   ├── audio.js
│   │   ├── storage.js
│   │   ├── timeSignature.js
│   │   └── __tests__/
│   │       ├── shamisen.test.js
│   │       ├── music.test.js
│   │       ├── timeSignature.test.js
│   │       └── storage.test.js
│   ├── data/
│   │   ├── presets.js
│   │   └── aiPrompt.js
│   └── i18n/
│       └── ja.js
├── e2e/
│   └── app.spec.js
├── biome.json
├── netlify.toml
├── playwright.config.js
├── vite.config.js
├── package.json
├── index.html
└── README.md
```

---

## プロトタイプコード（参考）

```jsx
import React, { useState, useRef, useEffect } from 'react';

// --- 定数定義 ---
const ROW_HEIGHT = 20; // 鍵盤の1行の高さ
const STEP_WIDTH = 24; // 1ステップ（16分音符）の幅
const TOTAL_STEPS = 128; // 8小節 × 16ステップ
const STEPS_PER_MEASURE = 16; // 1小節のステップ数
const DIVISIONS_PER_BEAT = 4; // 1拍のステップ数（4/4拍子）
const MIN_PITCH = 48; // C3
const MAX_PITCH = 72; // C5
const NUM_PITCHES = MAX_PITCH - MIN_PITCH + 1;

// 鍵盤描画用配列（上から下へ高音→低音とするため降順）
const PITCHES = Array.from({ length: NUM_PITCHES }, (_, i) => MAX_PITCH - i);

const isBlackKey = (pitch) => {
  const note = pitch % 12;
  return [1, 3, 6, 8, 10].includes(note);
};

const getPitchLabel = (pitch) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = noteNames[pitch % 12];
  const octave = Math.floor(pitch / 12) - 1;
  return `${name}${octave}`;
};

// --- 調弦データ ---
const TUNINGS = {
  honchoshi: { name: '本調子 (C-F-C)', strings: [48, 53, 60] },
  niagari: { name: '二上がり (C-G-C)', strings: [48, 55, 60] },
  sansagari: { name: '三下がり (C-F-Bb)', strings: [48, 53, 58] }
};

// 文化譜のツボ計算（0が開放弦。半音上がるごとにツボ番号が増える）
const getTsuboNumber = (halfSteps) => {
  const tsuboMap = {
    0: '0', 1: '1', 2: '2', 3: '3', 4: '3#', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '8#', 11: '9', 12: '10', 13: '11', 14: '12', 15: '13'
  };
  return tsuboMap[halfSteps] || '';
};

// ピアノのノートを三味線の糸とツボに変換
const convertToShamisenNote = (pitch, tuningKey) => {
  const strings = TUNINGS[tuningKey].strings; // [一の糸, 二の糸, 三の糸] の開放弦ピッチ
  // 三の糸(インデックス2)から一の糸(インデックス0)の順に判定し、なるべく上の糸（細い糸）、つまりポジションが低いところを使う
  for (let i = 2; i >= 0; i--) {
    const diff = pitch - strings[i];
    if (diff >= 0 && diff <= 15) { // その糸で出せる音域（0〜15半音）
      const tsubo = getTsuboNumber(diff);
      if (tsubo) {
        return { stringIndex: i, tsubo: tsubo };
      }
    }
  }
  return null; // 範囲外
};

// --- プリセットデータ ---
const PRESETS = {
  kaeru: {
    name: 'かえるの合唱',
    bpm: 100,
    notes: [
      { id: 'k1', pitch: 48, step: 0, length: 4 }, // C3
      { id: 'k2', pitch: 50, step: 4, length: 4 }, // D3
      { id: 'k3', pitch: 52, step: 8, length: 4 }, // E3
      { id: 'k4', pitch: 53, step: 12, length: 4 }, // F3
      { id: 'k5', pitch: 52, step: 16, length: 4 }, // E3
      { id: 'k6', pitch: 50, step: 20, length: 4 }, // D3
      { id: 'k7', pitch: 48, step: 24, length: 8 }, // C3
      { id: 'k8', pitch: 52, step: 32, length: 4 }, // E3
      { id: 'k9', pitch: 53, step: 36, length: 4 }, // F3
      { id: 'k10', pitch: 55, step: 40, length: 4 }, // G3
      { id: 'k11', pitch: 57, step: 44, length: 4 }, // A3
      { id: 'k12', pitch: 55, step: 48, length: 4 }, // G3
      { id: 'k13', pitch: 53, step: 52, length: 4 }, // F3
      { id: 'k14', pitch: 52, step: 56, length: 8 }, // E3
      { id: 'k15', pitch: 48, step: 64, length: 8 }, // C3 (休符なしで表記)
      { id: 'k16', pitch: 48, step: 72, length: 8 }, // C3
      { id: 'k17', pitch: 48, step: 80, length: 2 }, // C3 (八分音符)
      { id: 'k18', pitch: 48, step: 82, length: 2 }, // C3
      { id: 'k19', pitch: 50, step: 84, length: 2 }, // D3
      { id: 'k20', pitch: 50, step: 86, length: 2 }, // D3
      { id: 'k21', pitch: 52, step: 88, length: 2 }, // E3
      { id: 'k22', pitch: 52, step: 90, length: 2 }, // E3
      { id: 'k23', pitch: 53, step: 92, length: 2 }, // F3
      { id: 'k24', pitch: 53, step: 94, length: 2 }, // F3
      { id: 'k25', pitch: 52, step: 96, length: 4 }, // E3
      { id: 'k26', pitch: 50, step: 100, length: 4 }, // D3
      { id: 'k27', pitch: 48, step: 104, length: 8 }, // C3
    ]
  },
  sakura: {
    name: 'さくらさくら',
    bpm: 60,
    notes: [
      { id: 's1', pitch: 57, step: 0, length: 4 },  // A3
      { id: 's2', pitch: 57, step: 4, length: 4 },  // A3
      { id: 's3', pitch: 59, step: 8, length: 8 },  // B3
      { id: 's4', pitch: 57, step: 16, length: 4 }, // A3
      { id: 's5', pitch: 57, step: 20, length: 4 }, // A3
      { id: 's6', pitch: 59, step: 24, length: 8 }, // B3
      { id: 's7', pitch: 57, step: 32, length: 4 }, // A3
      { id: 's8', pitch: 59, step: 36, length: 4 }, // B3
      { id: 's9', pitch: 60, step: 40, length: 4 }, // C4
      { id: 's10', pitch: 59, step: 44, length: 4 },// B3
      { id: 's11', pitch: 57, step: 48, length: 4 },// A3
      { id: 's12', pitch: 59, step: 52, length: 2 },// B3
      { id: 's13', pitch: 57, step: 54, length: 2 },// A3
      { id: 's14', pitch: 53, step: 56, length: 8 },// F3
    ]
  },
  tulip: {
    name: 'チューリップ',
    bpm: 120,
    notes: [
      { id: 't1', pitch: 53, step: 0, length: 4 }, // F3
      { id: 't2', pitch: 55, step: 4, length: 4 }, // G3
      { id: 't3', pitch: 57, step: 8, length: 8 }, // A3
      { id: 't4', pitch: 53, step: 16, length: 4 }, // F3
      { id: 't5', pitch: 55, step: 20, length: 4 }, // G3
      { id: 't6', pitch: 57, step: 24, length: 8 }, // A3
      { id: 't7', pitch: 55, step: 32, length: 4 }, // G3
      { id: 't8', pitch: 53, step: 36, length: 4 }, // F3
      { id: 't9', pitch: 55, step: 40, length: 4 }, // G3
      { id: 't10', pitch: 57, step: 44, length: 4 },// A3
      { id: 't11', pitch: 55, step: 48, length: 16 },// G3 (全音符)
    ]
  }
};

export default function App() {
  const [notes, setNotes] = useState([]);
  const [tuning, setTuning] = useState('honchoshi');
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedPreset, setSelectedPreset] = useState('');
  
  const [dragState, setDragState] = useState(null);
  
  const timerRef = useRef(null);
  const scoreRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  // スクロール同期用のRefs
  const scoreScrollRef = useRef(null);
  const gridScrollRef = useRef(null);

  // 画像保存ライブラリ読み込み
  useEffect(() => {
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleScoreScroll = (e) => {
    if (gridScrollRef.current && gridScrollRef.current !== e.target) {
        gridScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleGridScroll = (e) => {
    if (scoreScrollRef.current && scoreScrollRef.current !== e.target) {
        scoreScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const playShamisenSound = (pitch) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    // MIDI note to frequency
    osc.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // 三味線風のアタックと減衰
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
  };

  useEffect(() => {
    if (isPlaying) {
      const stepTime = (60 / bpm) / DIVISIONS_PER_BEAT * 1000;
      
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev >= TOTAL_STEPS - 1 ? 0 : prev + 1;
          
          // 再生処理
          const currentNotes = notes.filter(n => n.step === next);
          currentNotes.forEach(n => playShamisenSound(n.pitch));
          
          // 自動スクロール
          if (gridScrollRef.current && next > 0 && next % 8 === 0) {
            const currentScroll = gridScrollRef.current.scrollLeft;
            const targetScroll = next * STEP_WIDTH - (gridScrollRef.current.clientWidth / 2);
            if (targetScroll > currentScroll || targetScroll < currentScroll - 100) {
              gridScrollRef.current.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
            }
          }
          
          return next;
        });
      }, stepTime);
    } else {
      clearInterval(timerRef.current);
      setCurrentStep(-1);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, bpm, notes]);

  const handleLoadPreset = (e) => {
    const val = e.target.value;
    setSelectedPreset(val);
    if (val && PRESETS[val]) {
      setNotes([...PRESETS[val].notes]);
      setBpm(PRESETS[val].bpm);
    }
  };

  const handleClear = () => {
    setNotes([]);
    setIsPlaying(false);
    setSelectedPreset('');
    setCurrentStep(-1);
  };

  const handleSaveImage = () => {
    if (scoreRef.current && window.html2canvas) {
      window.html2canvas(scoreRef.current, { backgroundColor: '#fdfcf9' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'shamisen_score.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const handleTranspose = (delta) => {
    const newNotes = notes.map(n => ({ ...n, pitch: n.pitch + delta }));
    if (newNotes.some(n => n.pitch < MIN_PITCH || n.pitch > MAX_PITCH)) {
      return; 
    }
    setNotes(newNotes);
  };
  
  // タップ（クリック）で新しいノートを配置
  const handleGridClick = (e) => {
    // ドラッグ中やノート上のクリックは無視
    if (dragState || e.target.closest('.note-element')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const step = Math.floor(x / STEP_WIDTH);
    const pitchIndex = Math.floor(y / ROW_HEIGHT);
    const pitch = MAX_PITCH - pitchIndex;

    if (pitch >= MIN_PITCH && pitch <= MAX_PITCH && step >= 0 && step < TOTAL_STEPS) {
      // 既存のノートと重なる場合は何もしない
      const existing = notes.find(n => n.step === step && n.pitch === pitch);
      if (existing) return;

      const newNote = {
        id: `n${Date.now()}`,
        pitch,
        step,
        length: 4 // デフォルトは四分音符
      };
      setNotes([...notes, newNote]);
      playShamisenSound(pitch);
    }
  };

  // ノート自体のクリックで削除
  const handleNoteClick = (e, id) => {
    e.stopPropagation();
    if (dragState) return; 
    setNotes(notes.filter(n => n.id !== id));
  };

  // --- 長さ調整 (ドラッグ) ---
  const handleResizeStart = (e, note) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragState({
      id: note.id,
      startX: e.clientX,
      startLength: note.length
    });
  };

  const handleResizeMove = (e) => {
    if (!dragState) return;
    const diffX = e.clientX - dragState.startX;
    const diffSteps = Math.round(diffX / STEP_WIDTH);
    const newLength = Math.max(1, dragState.startLength + diffSteps);
    
    setNotes(notes.map(n => 
      n.id === dragState.id ? { ...n, length: newLength } : n
    ));
  };

  const handleResizeEnd = (e) => {
    if (dragState) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setTimeout(() => setDragState(null), 50);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#fdfbf7] font-sans text-gray-800">
      {/* ヘッダー */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border-b border-gray-300 shadow-sm z-20 gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#c73a31] tracking-wide">三味線 文化譜ジェネレーター</h1>
          <p className="text-[10px] text-gray-500">空きマスをタップで配置、右端をドラッグで長さ変更、音符タップで削除</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* キー操作（移調） */}
          <div className="flex items-center bg-gray-100 rounded px-2 py-1 space-x-1">
            <span className="text-[10px] text-gray-500 font-bold mr-1">移調</span>
            <button onClick={() => handleTranspose(-1)} className="px-2 py-0.5 bg-white border border-gray-300 rounded shadow-sm text-xs font-bold hover:bg-gray-50 active:bg-gray-200 transition-colors">-</button>
            <button onClick={() => handleTranspose(1)} className="px-2 py-0.5 bg-white border border-gray-300 rounded shadow-sm text-xs font-bold hover:bg-gray-50 active:bg-gray-200 transition-colors">+</button>
          </div>

          <select 
            value={selectedPreset} 
            onChange={handleLoadPreset}
            className="border border-green-600 rounded px-2 py-1 text-xs bg-green-50 text-green-700 font-bold outline-none"
          >
            <option value="">♪ プリセット</option>
            {Object.entries(PRESETS).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>
          
          <select 
            value={tuning} 
            onChange={(e) => setTuning(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-gray-50 outline-none"
          >
            {Object.entries(TUNINGS).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-gray-100 rounded px-2 py-1">
            <span className="text-[10px] text-gray-500 font-bold mr-1">BPM</span>
            <input 
              type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
              min="40" max="240" className="w-12 bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1 rounded text-white text-sm font-bold shadow transition-colors ${isPlaying ? 'bg-gray-600' : 'bg-[#c73a31]'}`}
            >
              {isPlaying ? '停止' : '再生'}
            </button>
            <button 
              onClick={handleClear}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold transition-colors"
            >
              クリア
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col relative bg-gray-50 pb-10 p-2 sm:p-4 space-y-4">
        
        {/* === 1. ピアノロール入力エリア === */}
        <section className="bg-white border border-gray-300 shadow-sm rounded-lg flex flex-col w-full h-[45vh] min-h-[250px] overflow-hidden flex-shrink-0">
          {/* グリッド入力領域 (縦横スクロール可能。鍵盤はStickyで追従) */}
          <div 
            ref={gridScrollRef}
            onScroll={handleGridScroll}
            className="flex w-full h-full overflow-auto bg-[#faf9f6] relative"
          >
            {/* 左側ヘッダー：鍵盤 (Stickyで横スクロールに追従せず縦は連動) */}
            <div 
              className="sticky left-0 w-12 sm:w-16 flex-shrink-0 border-r border-gray-300 bg-white z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
            >
              <div style={{ height: `${NUM_PITCHES * ROW_HEIGHT}px` }}>
                {PITCHES.map(pitch => (
                  <div 
                    key={`key-${pitch}`} 
                    className={`border-b flex items-center justify-end pr-1 text-[9px] select-none
                      ${isBlackKey(pitch) ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {!isBlackKey(pitch) && getPitchLabel(pitch)}
                  </div>
                ))}
              </div>
            </div>

            {/* 右側：グリッド入力領域 */}
            <div 
              className="relative cursor-crosshair select-none z-10"
              style={{ width: `${TOTAL_STEPS * STEP_WIDTH}px`, height: `${NUM_PITCHES * ROW_HEIGHT}px` }}
              onClick={handleGridClick}
            >
              {/* 背景グリッド線 */}
              {Array.from({ length: TOTAL_STEPS + 1 }).map((_, step) => {
                const isBeat = step % DIVISIONS_PER_BEAT === 0;
                const isMeasure = step % STEPS_PER_MEASURE === 0;
                return (
                  <div 
                    key={`bg-col-${step}`}
                    className={`absolute top-0 bottom-0 pointer-events-none border-l
                      ${isMeasure ? 'border-gray-400 border-l-2' : isBeat ? 'border-gray-300' : 'border-gray-100'}`}
                    style={{ left: `${step * STEP_WIDTH}px`, width: `1px`, zIndex: 1 }}
                  >
                    {isMeasure && step < TOTAL_STEPS && <div className="absolute top-0 left-1 text-[10px] text-gray-500 font-bold">{step / STEPS_PER_MEASURE + 1}</div>}
                  </div>
                );
              })}
              
              {PITCHES.map((pitch, i) => (
                <div key={`bg-row-${i}`} className="absolute left-0 right-0 border-b border-gray-200 pointer-events-none z-0" 
                     style={{ top: `${i * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }} />
              ))}

              {/* カレントステップのハイライト */}
              {currentStep >= 0 && (
                <div className="absolute top-0 bottom-0 bg-yellow-300 bg-opacity-30 pointer-events-none"
                     style={{ left: `${currentStep * STEP_WIDTH}px`, width: `${STEP_WIDTH}px`, zIndex: 5 }} />
              )}

              {/* 入力されたノートの描画 */}
              {notes.map(note => (
                <div
                  key={note.id}
                  className="note-element absolute bg-[#c73a31] border border-[#a8322a] rounded-sm opacity-90 shadow-sm flex items-center justify-center"
                  style={{
                    left: `${note.step * STEP_WIDTH}px`,
                    top: `${(MAX_PITCH - note.pitch) * ROW_HEIGHT}px`,
                    width: `${note.length * STEP_WIDTH}px`,
                    height: `${ROW_HEIGHT}px`,
                    zIndex: 10
                  }}
                  onClick={(e) => handleNoteClick(e, note.id)}
                >
                  {/* 長さ調節用のハンドル（右端） */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-6 bg-white bg-opacity-30 cursor-ew-resize flex items-center justify-center rounded-r-sm hover:bg-opacity-50 transition-opacity"
                    style={{ touchAction: 'none' }} // ドラッグ中のスクロール防止
                    onPointerDown={(e) => handleResizeStart(e, note)}
                    onPointerMove={handleResizeMove}
                    onPointerUp={handleResizeEnd}
                    onPointerCancel={handleResizeEnd}
                  >
                    <div className="w-1 h-3 border-l border-r border-white opacity-80 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === 2. 文化譜プレビューエリア === */}
        {}
        <section className="bg-white border border-gray-300 shadow-sm rounded-lg w-full flex flex-col overflow-hidden flex-shrink-0 min-h-[140px]">
          <div className="bg-[#2e4053] text-white px-3 py-1.5 text-xs font-bold border-b border-gray-300 flex justify-between items-center z-20 relative">
            <span>三味線 文化譜 出力</span>
            <button onClick={handleSaveImage} className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded shadow-sm transition-colors text-[10px]">
              画像として保存
            </button>
          </div>
          <div ref={scoreRef} className="flex w-full bg-[#fdfcf9] pb-6 pt-4 relative min-h-[110px]">
            {/* 左端：糸の名称 (固定) */}
            <div className="flex flex-col justify-between h-20 w-12 sm:w-16 bg-[#fdfcf9] z-10 border-r border-gray-300 text-xs text-gray-500 font-bold py-2 items-center flex-shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
              <span>三</span>
              <span>二</span>
              <span>一</span>
            </div>

            {/* 譜面領域 (横スクロール) */}
            <div 
              ref={scoreScrollRef}
              onScroll={handleScoreScroll}
              className="flex-1 overflow-x-auto touch-pan-x"
            >
              <div className="relative" style={{ width: `${TOTAL_STEPS * STEP_WIDTH}px`, height: '80px' }}>
                {/* 3本の糸の背景線 */}
                <div className="absolute w-full top-[16%] border-b border-gray-800" />
                <div className="absolute w-full top-1/2 border-b border-gray-800" />
                <div className="absolute w-full bottom-[16%] border-b border-gray-800" />

                {/* 縦線（拍子） */}
                {Array.from({ length: TOTAL_STEPS + 1 }).map((_, step) => (
                  <div key={`score-line-${step}`} className={`absolute top-0 bottom-0 pointer-events-none border-l
                    ${step % STEPS_PER_MEASURE === 0 ? 'border-l-2 border-gray-800' : step % DIVISIONS_PER_BEAT === 0 ? 'border-gray-400' : 'border-dashed border-gray-200'}`}
                    style={{ left: `${step * STEP_WIDTH}px`, width: `1px`, zIndex: 1 }}
                  />
                ))}

                {/* カレントステップのハイライト */}
                {currentStep >= 0 && (
                  <div className="absolute top-0 bottom-0 bg-yellow-300 bg-opacity-30 pointer-events-none"
                       style={{ left: `${currentStep * STEP_WIDTH}px`, width: `${STEP_WIDTH}px`, zIndex: 0 }} />
                )}

                {/* ノートを文化譜として描画 */}
                {notes.map(note => {
                  const shamiNote = convertToShamisenNote(note.pitch, tuning);
                  if (!shamiNote) {
                     return <span key={`err-${note.id}`} className="absolute text-red-500 text-xs font-bold" 
                                  style={{ left: `${note.step * STEP_WIDTH + STEP_WIDTH/2}px`, top: '50%', transform: 'translate(-50%, -50%)' }}>×</span>;
                  }

                  const yPosClass = shamiNote.stringIndex === 2 ? 'top-[16%]' : shamiNote.stringIndex === 1 ? 'top-1/2' : 'bottom-[16%]';
                  
                  const isEighthNote = note.length === 2; // 1拍=4stepなので、八分音符は2step
                  const isSixteenth = note.length === 1;
                  
                  const extendBars = [];
                  // 4step (四分音符) より長い場合、伸ばし棒を追加
                  if (note.length > 4) {
                    for (let i = 4; i < note.length; i += 4) {
                       extendBars.push(
                         <span key={`bar-${i}`} className={`absolute text-sm font-bold text-gray-800 ${yPosClass}`} 
                               style={{ left: `${(note.step + i) * STEP_WIDTH + STEP_WIDTH/2}px`, transform: 'translate(-50%, -50%)' }}>
                           ー
                         </span>
                       );
                    }
                  }

                  return (
                    <React.Fragment key={`shami-${note.id}`}>
                      {/* メインのツボ（数字） */}
                      <div className={`absolute flex flex-col items-center justify-center ${yPosClass}`}
                           style={{ left: `${note.step * STEP_WIDTH + STEP_WIDTH/2}px`, transform: 'translate(-50%, -50%)', zIndex: 5 }}>
                        <span className="bg-[#fdfcf9] px-0.5 text-sm font-bold font-serif text-black leading-none">
                          {shamiNote.tsubo}
                        </span>
                        {/* 八分音符、十六分音符の下線 */}
                        {isEighthNote && <div className="w-5 border-b-2 border-black mt-[2px]" />}
                        {isSixteenth && <div className="w-5 border-b-2 border-black mt-[2px] border-double" style={{ borderBottomWidth: '4px' }} />}
                      </div>
                      {/* 伸ばし棒 */}
                      {extendBars}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```
