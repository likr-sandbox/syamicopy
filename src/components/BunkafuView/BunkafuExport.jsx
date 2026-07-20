import React from 'react';
import { STEP_WIDTH } from '../../utils/constants';
import { convertToShamisenNote } from '../../utils/shamisen';
import { getStepsPerBeat, getStepsPerMeasure } from '../../utils/timeSignature';
import { getPitchLabel } from '../../utils/music';
import BunkafuNote from './BunkafuNote';

const BunkafuExport = React.forwardRef(
  (
    {
      notes,
      tuning = 'honchoshi',
      basePitch = 48,
      timeSignature = { numerator: 4, denominator: 4 },
      measureCount = 8
    },
    ref
  ) => {
    const stepsPerBeat = getStepsPerBeat(timeSignature);
    const stepsPerMeasure = getStepsPerMeasure(timeSignature);
    const stepsPerLine = 4 * stepsPerMeasure; // 1行あたり4小節
    const totalSteps = stepsPerMeasure * measureCount;

    const Y_COORDINATES = {
      2: 16, // 三の糸 (上)
      1: 40, // 二の糸 (中)
      0: 64 // 一の糸 (下)
    };

    const lineCount = Math.ceil(measureCount / 4);
    const lines = Array.from({ length: lineCount }, (_, i) => i);

    return (
      <div
        ref={ref}
        data-testid="bunkafu-export-container"
        className="bg-washiWhite p-6 flex flex-col gap-8 w-fit"
        style={{
          width: `${stepsPerLine * STEP_WIDTH + 96}px`,
          minWidth: `${stepsPerLine * STEP_WIDTH + 96}px`
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-nouaiBlue text-lg font-bold">三味線 文化譜</h2>
          <div className="text-[10px] text-nouaiBlue/60 flex gap-4">
            <span>
              調弦:{' '}
              {tuning === 'honchoshi'
                ? '本調子'
                : tuning === 'niagari'
                  ? '二上がり'
                  : '三下り'}
            </span>
            <span>基準音: {getPitchLabel(basePitch)}</span>
            <span>
              拍子: {timeSignature.numerator}/{timeSignature.denominator}
            </span>
          </div>
        </div>

        {lines.map((lineIndex) => {
          const startStep = lineIndex * stepsPerLine;
          const endStep = startStep + stepsPerLine;

          // この行に含まれるノートをフィルタリング
          const lineNotes = notes.filter(
            (note) => note.step >= startStep && note.step < endStep
          );

          // この行に含まれる休符の計算
          const lineRests = [];
          for (let s = startStep; s < endStep; s += stepsPerBeat) {
            const isSounding = notes.some(
              (note) => s >= note.step && s < note.step + note.length
            );
            if (!isSounding) {
              lineRests.push({
                id: `rest-${s}`,
                step: s,
                tsubo: '●',
                stringIndex: 1, // 二の糸
                y: Y_COORDINATES[1],
                x: (s - startStep) * STEP_WIDTH + STEP_WIDTH / 2
              });
            }
          }

          // 音符と伸ばし棒の要素
          const renderItems = [];

          for (const note of lineNotes) {
            const shamiNote = convertToShamisenNote(
              note.pitch,
              tuning,
              basePitch
            );
            if (shamiNote) {
              const relativeStep = note.step - startStep;

              // 音符の描画
              renderItems.push(
                <BunkafuNote
                  key={note.id}
                  tsubo={shamiNote.tsubo}
                  length={note.length}
                  isCurrent={false}
                  x={relativeStep * STEP_WIDTH + STEP_WIDTH / 2}
                  y={Y_COORDINATES[shamiNote.stringIndex]}
                  isRest={false}
                  testId={`bunkafu-export-note-${note.step}`}
                  stringIndex={shamiNote.stringIndex}
                />
              );

              // 伸ばし棒の描画
              if (note.length > 4) {
                for (let i = 4; i < note.length; i += 4) {
                  const extendStep = note.step + i;
                  if (extendStep >= endStep) break; // この行の範囲外なら描画しない（次の行へ）

                  const relativeExtendStep = extendStep - startStep;
                  renderItems.push(
                    <BunkafuNote
                      key={`extend-${note.id}-${extendStep}`}
                      tsubo="ー"
                      length={4}
                      isCurrent={false}
                      x={relativeExtendStep * STEP_WIDTH + STEP_WIDTH / 2}
                      y={Y_COORDINATES[shamiNote.stringIndex]}
                      isRest={false}
                      testId={`bunkafu-export-extension-${extendStep}`}
                      stringIndex={shamiNote.stringIndex}
                    />
                  );
                }
              }
            } else {
              // 範囲外の音高（×を表示）
              const relativeStep = note.step - startStep;
              renderItems.push(
                <BunkafuNote
                  key={`err-${note.id}`}
                  tsubo="×"
                  length={note.length}
                  isCurrent={false}
                  x={relativeStep * STEP_WIDTH + STEP_WIDTH / 2}
                  y={Y_COORDINATES[1]} // 二 of thread
                  isRest={false}
                  testId={`bunkafu-export-note-${note.step}`}
                />
              );
            }
          }

          // 前の行から伸びている伸ばし棒の処理
          for (const note of notes) {
            // 前の行で発音開始され、この行まで続いている場合
            if (note.step < startStep && note.step + note.length > startStep) {
              const shamiNote = convertToShamisenNote(
                note.pitch,
                tuning,
                basePitch
              );
              if (shamiNote) {
                // この行での伸ばし棒の描画位置
                const offsetStart = 4 - ((startStep - note.step) % 4);
                const startOffset = offsetStart === 4 ? 0 : offsetStart;

                for (let i = startOffset; i < endStep - startStep; i += 4) {
                  const extendStep = startStep + i;
                  if (extendStep >= note.step + note.length) break;

                  renderItems.push(
                    <BunkafuNote
                      key={`extend-overflow-${note.id}-${extendStep}`}
                      tsubo="ー"
                      length={4}
                      isCurrent={false}
                      x={i * STEP_WIDTH + STEP_WIDTH / 2}
                      y={Y_COORDINATES[shamiNote.stringIndex]}
                      isRest={false}
                      testId={`bunkafu-export-extension-${extendStep}`}
                      stringIndex={shamiNote.stringIndex}
                    />
                  );
                }
              }
            }
          }

          // 休符の追加
          for (const rest of lineRests) {
            renderItems.push(
              <BunkafuNote
                key={rest.id}
                tsubo={rest.tsubo}
                length={stepsPerBeat}
                isCurrent={false}
                x={rest.x}
                y={rest.y}
                isRest={true}
                testId={`bunkafu-export-rest-${rest.step}`}
                stringIndex={rest.stringIndex}
              />
            );
          }

          return (
            <div
              key={`line-${lineIndex}`}
              className="flex relative h-20 bg-washiWhite"
              style={{
                width: `${stepsPerLine * STEP_WIDTH + 48}px`
              }}
            >
              {/* 左端：糸の名称 */}
              <div className="flex flex-col justify-between h-20 w-12 border-r border-nouaiBlue/20 text-xs text-nouaiBlue/60 font-bold py-2 items-center flex-shrink-0">
                <span>三</span>
                <span>二</span>
                <span>一</span>
              </div>

              {/* 譜面グリッド */}
              <div
                className="relative h-20"
                style={{
                  width: `${stepsPerLine * STEP_WIDTH}px`,
                  lineHeight: 0,
                  fontSize: 0
                }}
              >
                {/* 3本の糸 */}
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

                {/* 縦グリッド線 */}
                {Array.from({ length: stepsPerLine + 1 }, (_, i) => i).map(
                  (stepOffset) => {
                    const absoluteStep = startStep + stepOffset;
                    if (absoluteStep > totalSteps) return null;

                    const isMeasure = stepOffset % stepsPerMeasure === 0;
                    const isBeat = stepOffset % stepsPerBeat === 0;

                    return (
                      <div
                        key={`grid-${lineIndex}-${stepOffset}`}
                        className={`absolute top-0 bottom-0 pointer-events-none border-l ${
                          isMeasure
                            ? 'border-nouaiBlue/60 border-l-2'
                            : isBeat
                              ? 'border-nouaiBlue/30'
                              : 'border-dashed border-nouaiBlue/10'
                        }`}
                        style={{ left: `${stepOffset * STEP_WIDTH}px` }}
                      >
                        {isMeasure && absoluteStep < totalSteps && (
                          <span className="absolute top-[-14px] left-1 text-[9px] text-nouaiBlue/50 font-bold">
                            {absoluteStep / stepsPerMeasure + 1}
                          </span>
                        )}
                      </div>
                    );
                  }
                )}

                {/* アイテム描画 */}
                {renderItems}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

BunkafuExport.displayName = 'BunkafuExport';

export default BunkafuExport;
