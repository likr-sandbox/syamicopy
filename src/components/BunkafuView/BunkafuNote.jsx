import React from 'react';

function BunkafuNote({
  tsubo,
  length,
  isCurrent,
  x,
  y,
  isRest,
  testId,
  stringIndex
}) {
  // 1拍のステップ数は通常 4 (4/4拍子において)
  // length === 2 (八分音符) -> 下線1本
  // length === 1 (十六分音符) -> 下線2本
  const isEighth = length === 2;
  const isSixteenth = length === 1;

  return (
    <div
      className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none z-10 ${
        isCurrent ? 'text-shamiRed font-bold scale-110' : 'text-nouaiBlue'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
      data-testid={testId || (isRest ? 'bunkafu-rest' : 'bunkafu-note')}
      data-string-index={stringIndex !== undefined ? stringIndex : undefined}
    >
      <span className="bg-washiWhite px-[3px] text-sm font-bold font-serif leading-none">
        {tsubo}
      </span>
      {isEighth && <div className="w-4 border-b-2 border-current mt-[1px]" />}
      {isSixteenth && (
        <div className="w-4 flex flex-col gap-[1px] mt-[1px] items-center">
          <div className="w-4 border-b border-current" />
          <div className="w-4 border-b border-current" />
        </div>
      )}
    </div>
  );
}

export default BunkafuNote;
