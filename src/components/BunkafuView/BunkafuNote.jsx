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
      className={`absolute text-center select-none z-10 ${
        isCurrent ? 'text-shamiRed font-bold scale-110' : 'text-nouaiBlue'
      }`}
      style={{
        left: `${x - 12}px`,
        top: `${y - 12}px`,
        width: '24px',
        height: '24px'
      }}
      data-testid={testId || (isRest ? 'bunkafu-rest' : 'bunkafu-note')}
      data-string-index={stringIndex !== undefined ? stringIndex : undefined}
    >
      <span
        className="absolute left-0 right-0 bg-washiWhite px-[2px] text-[13px] font-bold font-serif leading-[16px] text-center"
        style={{
          top: '4px',
          height: '16px'
        }}
      >
        {tsubo}
      </span>
      {isEighth && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 border-b-2 border-current"
          style={{ bottom: '1px' }}
        />
      )}
      {isSixteenth && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 flex flex-col gap-[1px] items-center"
          style={{ bottom: '1px' }}
        >
          <div className="w-4 border-b border-current" />
          <div className="w-4 border-b border-current" />
        </div>
      )}
    </div>
  );
}

export default BunkafuNote;
