import React from 'react';
import IconButton from './common/IconButton';

export function Header({ projectName, onOpenDrawer, onOpenSettings }) {
  return (
    <header
      data-testid="header-container"
      className="px-4 py-3 bg-washiWhite border-b border-nouaiBlue/20 flex justify-between items-center z-10 shadow-sm"
    >
      <div className="flex items-center">
        <h1 data-testid="header-logo" className="sr-only">
          シャミコピー
        </h1>
        <IconButton
          data-testid="drawer-toggle-btn"
          onClick={onOpenDrawer}
          ariaLabel="プロジェクト一覧を開く"
          variant="ghost"
          className="text-nouaiBlue hover:bg-nouaiBlue/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>プロジェクト一覧を開く</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </IconButton>
      </div>

      <div
        data-testid="header-project-name"
        className="text-base font-bold text-nouaiBlue font-serif tracking-wide truncate max-w-[60%] bg-nouaiBlue/5 px-4 py-1.5 rounded-full shadow-inner text-center"
      >
        {projectName || '無題のプロジェクト'}
      </div>

      <div className="flex items-center">
        <IconButton
          data-testid="settings-toggle-btn"
          onClick={onOpenSettings}
          ariaLabel="プロジェクト設定を開く"
          variant="ghost"
          className="text-nouaiBlue hover:bg-nouaiBlue/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>プロジェクト設定を開く</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </IconButton>
      </div>
    </header>
  );
}

export default Header;
