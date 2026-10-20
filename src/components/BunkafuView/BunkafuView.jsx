import React, { useEffect } from 'react';
import { STEP_WIDTH } from '../../utils/constants';
import { convertToShamisenNote } from '../../utils/shamisen';
import {
  getStepsPerBeat,
  getStepsPerMeasure,
  getTotalSteps
} from '../../utils/timeSignature';
import BunkafuNote from './BunkafuNote';

const BunkafuView = React.forwardRef(
  (
    {
      notes,
      tuning = 'honchoshi',
      basePitch = 48,
      currentStep = -1,
      timeSignature = { numerator: 4, denominator: 4 },
      measureCount = 8,
      seekToStep,
      sharedScrollLeft,
      onScrollChange
    },
    ref
  ) => {
    const stepsPerBeat = getStepsPerBeat(timeSignature);
    const stepsPerMeasure = getStepsPerMeasure(timeSignature);
    const totalSteps = getTotalSteps(timeSignature, measureCount);

    // 糸のy座標定義 (0: 一の糸, 1: 二の糸, 2: 三の糸)
    const Y_COORDINATES = {
      2: 16, // 三の糸 (上)
      1: 40, // 二の糸 (中)
      0: 64 // 一の糸 (下)
    };

    // タブ切替時のスクロール復元
    useEffect(() => {
      const container = ref?.current;
      if (
        container &&
        typeof sharedScrollLeft === 'number' &&
        sharedScrollLeft > 0
      ) {
        container.scrollLeft = sharedScrollLeft;
      }
    }, [sharedScrollLeft, ref]);

    // 再生中の自動スクロール
    useEffect(() => {
      const container = ref?.current;
      if (!container || currentStep < 0) return;

      const playheadX = currentStep * STEP_WIDTH;
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;

      const isOutOfViewport =
        playheadX < scrollLeft || playheadX > scrollLeft + clientWidth - 48;
      const isEvery8Steps = currentStep % 8 === 0;

      if (isOutOfViewport || isEvery8Steps) {
        const targetScroll = Math.max(0, playheadX - clientWidth / 2);
        if (typeof container.scrollTo === 'function') {
          container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        } else {
          container.scrollLeft = targetScroll;
        }
      }
    }, [currentStep, ref]);

    // 音符のない拍（一拍単位の頭）で、かつどの音符の発音区間（note.step から note.step + note.length - 1）
    // にも含まれていないステップを休符「●」とする
    const rests = [];
    for (let s = 0; s < totalSteps; s += stepsPerBeat) {
      const isSounding = notes.some(
        (note) => s >= note.step && s < note.step + note.length
      );
      if (!isSounding) {
        rests.push({
          id: `rest-${s}`,
          step: s,
          tsubo: '●',
          stringIndex: 1, // 二の糸
          y: Y_COORDINATES[1],
          x: s * STEP_WIDTH + STEP_WIDTH / 2
        });
      }
    }

    // 各ノートを三味線記譜に変換し、伸ばし棒も計算する
    const renderItems = [];

    for (const note of notes) {
      const shamiNote = convertToShamisenNote(
        note.pitch,
        tuning,
        basePitch,
        note.preferredString
      );
      if (shamiNote) {
        const isCurrent =
          currentStep >= note.step && currentStep < note.step + note.length;

        // メインの音符を追加
        renderItems.push(
          <BunkafuNote
            key={note.id}
            tsubo={shamiNote.tsubo}
            length={note.length}
            isCurrent={isCurrent}
            x={note.step * STEP_WIDTH + STEP_WIDTH / 2}
            y={Y_COORDINATES[shamiNote.stringIndex]}
            isRest={false}
            testId={`bunkafu-note-${note.step}`}
            stringIndex={shamiNote.stringIndex}
          />
        );

        // 伸ばし棒の計算: 1拍（stepsPerBeatステップ）より長い場合にstepsPerBeatステップごとに追加
        if (note.length > stepsPerBeat) {
          for (let i = stepsPerBeat; i < note.length; i += stepsPerBeat) {
            const extendStep = note.step + i;
            if (extendStep >= totalSteps) break;

            renderItems.push(
              <BunkafuNote
                key={`extend-${note.id}-${extendStep}`}
                tsubo="ー"
                length={stepsPerBeat}
                isCurrent={
                  currentStep >= extendStep &&
                  currentStep < extendStep + stepsPerBeat
                }
                x={extendStep * STEP_WIDTH + STEP_WIDTH / 2}
                y={Y_COORDINATES[shamiNote.stringIndex]}
                isRest={false}
                testId={`bunkafu-extension-${extendStep}`}
                stringIndex={shamiNote.stringIndex}
              />
            );
          }
        }
      } else {
        // 範囲外の音高（×を表示）
        const isCurrent =
          currentStep >= note.step && currentStep < note.step + note.length;
        renderItems.push(
          <BunkafuNote
            key={`err-${note.id}`}
            tsubo="×"
            length={note.length}
            isCurrent={isCurrent}
            x={note.step * STEP_WIDTH + STEP_WIDTH / 2}
            y={Y_COORDINATES[1]} // 二の糸（中央）の位置に描画
            isRest={false}
            testId={`bunkafu-note-${note.step}`}
          />
        );
      }
    }

    // 休符をレンダリング用アイテムに追加
    for (const rest of rests) {
      const isCurrent =
        currentStep >= rest.step && currentStep < rest.step + stepsPerBeat;
      renderItems.push(
        <BunkafuNote
          key={rest.id}
          tsubo={rest.tsubo}
          length={stepsPerBeat}
          isCurrent={isCurrent}
          x={rest.x}
          y={rest.y}
          isRest={true}
          testId={`bunkafu-rest-${rest.step}`}
          stringIndex={rest.stringIndex}
        />
      );
    }

    return (
      <div className="bg-white border border-nouaiBlue/20 rounded shadow-sm flex flex-col overflow-hidden w-full select-none">
        <div className="bg-nouaiBlue text-washiWhite px-4 py-2 text-sm font-bold flex justify-between items-center">
          <span>三味線 文化譜プレビュー</span>
        </div>

        <div className="flex w-full bg-washiWhite pb-6 pt-4 relative min-h-[120px]">
          {/* 左端：糸名ラベル（固定） */}
          <div className="flex flex-col justify-between h-20 w-12 bg-washiWhite z-20 border-r border-nouaiBlue/20 text-xs text-nouaiBlue/60 font-bold py-2 items-center flex-shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
            <span>三</span>
            <span>二</span>
            <span>一</span>
          </div>

          {/* 譜面スクロール領域 */}
          <div
            ref={ref}
            data-testid="bunkafu-view-scroll"
            className="bunkafu-scroll-container flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-nouaiBlue/20 scrollbar-track-transparent"
            onScroll={(e) => {
              if (onScrollChange) {
                onScrollChange(e.target.scrollLeft);
              }
            }}
          >
            <div
              data-testid="bunkafu-scroll-container"
              className="relative h-20 cursor-pointer"
              style={{ width: `${totalSteps * STEP_WIDTH}px` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const step = Math.floor(clickX / STEP_WIDTH);
                const clampedStep = Math.max(0, Math.min(totalSteps - 1, step));
                if (seekToStep) {
                  seekToStep(clampedStep);
                }
              }}
              onKeyDown={() => {}}
              role="presentation"
            >
              {/* 3本の糸（水平線） */}
              <div
                className="absolute w-full border-b border-nouaiBlue/40"
                style={{ top: `${Y_COORDINATES[2]}px` }}
              />
              <div
                className="absolute w-full border-b border-nouaiBlue/40"
                style={{ top: `${Y_COORDINATES[1]}px` }}
              />
              <div
                className="absolute w-full border-b border-nouaiBlue/40"
                style={{ top: `${Y_COORDINATES[0]}px` }}
              />

              {/* 縦グリッド線 (拍・小節) */}
              {Array.from({ length: totalSteps + 1 }, (_, i) => i).map(
                (step) => {
                  const isMeasure = step % stepsPerMeasure === 0;
                  const isBeat = step % stepsPerBeat === 0;

                  return (
                    <div
                      key={`score-grid-${step}`}
                      className={`absolute top-0 bottom-0 pointer-events-none border-l ${
                        isMeasure
                          ? 'border-nouaiBlue/60 border-l-2'
                          : isBeat
                            ? 'border-nouaiBlue/30'
                            : 'border-dashed border-nouaiBlue/10'
                      }`}
                      style={{ left: `${step * STEP_WIDTH}px` }}
                    >
                      {isMeasure && step < totalSteps && (
                        <span className="absolute top-[-14px] left-1 text-[9px] text-nouaiBlue/50 font-bold">
                          {step / stepsPerMeasure + 1}
                        </span>
                      )}
                    </div>
                  );
                }
              )}

              {/* カレントステップの縦ハイライト */}
              {currentStep >= 0 && currentStep < totalSteps && (
                <div
                  className="absolute top-0 bottom-0 bg-shamiRed/10 border-l border-r border-shamiRed/30 pointer-events-none z-0"
                  style={{
                    left: `${currentStep * STEP_WIDTH}px`,
                    width: `${STEP_WIDTH}px`
                  }}
                />
              )}

              {/* 音符・伸ばし棒・休符の描画 */}
              {renderItems}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BunkafuView.displayName = 'BunkafuView';

export default BunkafuView;
