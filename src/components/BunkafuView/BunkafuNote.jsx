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
      className={`absolute text-center select-none z-10 bg-washiWhite px-[2px] ${
        isCurrent ? 'text-shamiRed font-bold scale-110' : 'text-nouaiBlue'
      }`}
      style={{
        left: `${x - 12}px`,
        top: `${y - 8}px`,
        width: '24px',
        height: '16px'
      }}
      data-testid={testId || (isRest ? 'bunkafu-rest' : 'bunkafu-note')}
      data-string-index={stringIndex !== undefined ? stringIndex : undefined}
    >
      <svg
        width="20"
        height="16"
        viewBox="0 0 20 16"
        className="mx-auto"
        style={{ display: 'block' }}
      >
        <text
          x="10"
          y="13"
          textAnchor="middle"
          fill="currentColor"
          fontSize="13"
          fontWeight="bold"
          fontFamily="serif"
        >
          {tsubo}
        </text>
      </svg>
      {isEighth && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 border-b-2 border-current"
          style={{ bottom: '-4px' }}
        />
      )}
      {isSixteenth && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4 flex flex-col gap-[1px] items-center"
          style={{ bottom: '-6px' }}
        >
          <div className="w-4 border-b border-current" />
          <div className="w-4 border-b border-current" />
        </div>
      )}
    </div>
  );
}

export default BunkafuNote;
