import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import BunkafuExport from '../components/BunkafuView/BunkafuExport';
import BunkafuNote from '../components/BunkafuView/BunkafuNote';
import BunkafuView from '../components/BunkafuView/BunkafuView';

// scrollTo のモック化 (JSDOMには存在しないため)
window.HTMLElement.prototype.scrollTo = vi.fn();

describe('BunkafuNote Component', () => {
  it('renders tsubo number correctly', () => {
    render(
      <BunkafuNote tsubo="3" length={4} x={10} y={20} isCurrent={false} />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders rest symbol correctly', () => {
    render(
      <BunkafuNote
        tsubo="●"
        length={4}
        x={10}
        y={20}
        isCurrent={false}
        isRest={true}
      />
    );
    expect(screen.getByText('●')).toBeInTheDocument();
  });

  it('applies current highlight styles when active', () => {
    const { container } = render(
      <BunkafuNote tsubo="4" length={4} x={10} y={20} isCurrent={true} />
    );
    expect(container.firstChild).toHaveClass('text-shamiRed');
  });
});

describe('BunkafuView Component', () => {
  const mockNotes = [
    { id: 'n1', pitch: 48, step: 0, length: 4 }, // 一の糸 (開放弦 = 48) -> "0"
    { id: 'n2', pitch: 53, step: 4, length: 2 }, // 二の糸 (開放弦 = 53) -> "0" (八分音符)
    { id: 'n3', pitch: 60, step: 8, length: 8 } // 三の糸 (開放弦 = 60) -> "0" (伸ばし棒あり)
  ];

  it('renders scroll container and string labels', () => {
    render(
      <BunkafuView
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        currentStep={-1}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={2}
      />
    );
    expect(screen.getByTestId('bunkafu-scroll-container')).toBeInTheDocument();
    expect(screen.getByText('三')).toBeInTheDocument();
    expect(screen.getByText('二')).toBeInTheDocument();
    expect(screen.getByText('一')).toBeInTheDocument();
  });

  it('converts pitches to shamisen tsubo notes correctly', () => {
    render(
      <BunkafuView
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        currentStep={-1}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={2}
      />
    );

    // mockNotes[0] (MIDI 48, 一の糸) -> "0" が描画されること
    // すべて開放弦なので "0" が複数描画される
    const noteElements = screen.getAllByTestId(/^bunkafu-note/);
    expect(noteElements.length).toBeGreaterThanOrEqual(3);

    const tsuboTexts = noteElements.map((el) => el.textContent);
    expect(tsuboTexts).toContain('0');
  });

  it('generates auto rests (●) on empty beats', () => {
    // 2小節、4/4拍子 = 8拍
    // 0拍目: n1 (step 0), 1拍目: n2 (step 4), 2拍目: n3 (step 8), 3拍目: n3 (伸ばし棒, step 12)
    // 4拍目(step 16), 5拍目(step 20), 6拍目(step 24), 7拍目(step 28) は音が鳴っていないため、休符「●」が自動表示されるはず
    render(
      <BunkafuView
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        currentStep={-1}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={2} // 計32ステップ
      />
    );

    const restElements = screen.getAllByTestId(/^bunkafu-rest/);
    // 後半の4拍分(step 16, 20, 24, 28)には休符があること
    expect(restElements.length).toBe(4);
    expect(restElements[0].textContent).toBe('●');
  });

  it('generates extend bars (ー) for long notes', () => {
    render(
      <BunkafuView
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        currentStep={-1}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={2}
      />
    );

    // mockNotes[2] は length: 8 なので、伸ばし棒「ー」が1つ表示されるはず
    const notesAndExtends = screen.getAllByTestId(
      /^(bunkafu-note|bunkafu-extension)/
    );
    const texts = notesAndExtends.map((el) => el.textContent);
    expect(texts).toContain('ー');
  });
});

describe('BunkafuExport Component', () => {
  const mockNotes = [
    { id: 'n1', pitch: 48, step: 0, length: 4 },
    { id: 'n2', pitch: 60, step: 60, length: 8 } // 4小節（64ステップ）目を跨ぐ長い音
  ];

  it('renders multi-line layouts based on measure count', () => {
    render(
      <BunkafuExport
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={8} // 8小節 = 4小節ごとで 2行
      />
    );

    expect(screen.getByTestId('bunkafu-export-container')).toBeInTheDocument();

    // 糸ラベル「三」「二」「一」が各行（2行）で描画されるため、それぞれ2つずつあるはず
    expect(screen.getAllByText('三').length).toBe(2);
    expect(screen.getAllByText('二').length).toBe(2);
    expect(screen.getAllByText('一').length).toBe(2);
  });

  it('handles cross-line extend bars correctly', () => {
    render(
      <BunkafuExport
        notes={mockNotes}
        tuning="honchoshi"
        basePitch={48}
        timeSignature={{ numerator: 4, denominator: 4 }}
        measureCount={8}
      />
    );

    // step 60 (1小節 = 16ステップなので、4小節 = 64ステップの直前) から length 8 (step 68まで)
    // したがって、1行目(step 0-63)の最後に音符 "0" があり、2行目(step 64-127)の最初(step 64)に伸ばし棒「ー」が描画されるはず
    const exportNotes = screen.getAllByTestId(
      /^(bunkafu-export-note|bunkafu-export-extension)/
    );
    const texts = exportNotes.map((el) => el.textContent);

    // 伸ばし棒があることを確認
    expect(texts).toContain('ー');
  });
});
