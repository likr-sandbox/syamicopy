import React from 'react';
import { STEP_WIDTH } from '../../utils/constants';
import { getPitchLabel } from '../../utils/music';
import { convertToShamisenNote } from '../../utils/shamisen';
import { getStepsPerBeat, getStepsPerMeasure } from '../../utils/timeSignature';
import BunkafuNote from './BunkafuNote';

const BunkafuExport = React.forwardRef(
  (
    {
      name,
      composer,
      bpm,
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

    const tuningLabel =
      tuning === 'honchoshi'
        ? '本調子'
        : tuning === 'niagari'
          ? '二上がり'
          : '三下り';

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
          <svg width="100%" height="48" className="block">
            <title>{name || '三味線 文化譜'}</title>
            <text x="0" y="18" fill="#1e3a5f" fontSize="16" fontWeight="bold">
              {name || '三味線 文化譜'}
            </text>
            <text x="0" y="38" fill="#1e3a5f" opacity="0.6" fontSize="10">
              {`作曲者: ${composer || '-'}   調弦: ${tuningLabel}   基準音: ${getPitchLabel(basePitch)}   拍子: ${timeSignature.numerator}/${timeSignature.denominator}${bpm ? `   テンポ: ${bpm} BPM` : ''}`}
            </text>
          </svg>
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
          for (
            let s = startStep;
            s < Math.min(endStep, totalSteps);
            s += stepsPerBeat
          ) {
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
              basePitch,
              note.preferredString
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
              if (note.length > stepsPerBeat) {
                for (let i = stepsPerBeat; i < note.length; i += stepsPerBeat) {
                  const extendStep = note.step + i;
                  if (extendStep >= endStep || extendStep >= totalSteps) break; // この行または楽曲全体の範囲外なら描画しない

                  const relativeExtendStep = extendStep - startStep;
                  renderItems.push(
                    <BunkafuNote
                      key={`extend-${note.id}-${extendStep}`}
                      tsubo="ー"
                      length={stepsPerBeat}
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
                basePitch,
                note.preferredString
              );
              if (shamiNote) {
                // この行での伸ばし棒の描画位置
                const offsetStart =
                  stepsPerBeat - ((startStep - note.step) % stepsPerBeat);
                const startOffset =
                  offsetStart === stepsPerBeat ? 0 : offsetStart;

                for (
                  let i = startOffset;
                  i < endStep - startStep;
                  i += stepsPerBeat
                ) {
                  const extendStep = startStep + i;
                  if (
                    extendStep >= note.step + note.length ||
                    extendStep >= totalSteps
                  )
                    break;

                  renderItems.push(
                    <BunkafuNote
                      key={`extend-overflow-${note.id}-${extendStep}`}
                      tsubo="ー"
                      length={stepsPerBeat}
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
              <svg
                width="48"
                height="80"
                className="flex-shrink-0 border-r border-nouaiBlue/20"
              >
                <title>糸の名称</title>
                <text
                  x="24"
                  y="20"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#1e3a5f"
                  opacity="0.6"
                  fontSize="12"
                  fontWeight="bold"
                >
                  三
                </text>
                <text
                  x="24"
                  y="44"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#1e3a5f"
                  opacity="0.6"
                  fontSize="12"
                  fontWeight="bold"
                >
                  二
                </text>
                <text
                  x="24"
                  y="68"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#1e3a5f"
                  opacity="0.6"
                  fontSize="12"
                  fontWeight="bold"
                >
                  一
                </text>
              </svg>

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
                          <svg
                            width="28"
                            height="14"
                            className="absolute top-[-14px] left-1 pointer-events-none"
                          >
                            <title>{`第${absoluteStep / stepsPerMeasure + 1}小節`}</title>
                            <text
                              x="0"
                              y="10"
                              fill="#1e3a5f"
                              opacity="0.5"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              {absoluteStep / stepsPerMeasure + 1}
                            </text>
                          </svg>
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
