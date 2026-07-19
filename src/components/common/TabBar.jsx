import React from 'react';

export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div
      role="tablist"
      className="flex w-full border-b border-nouaiBlue/10 bg-washiWhite"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider transition-all duration-200 border-b-2 ${
              isActive
                ? 'border-shamiRed text-shamiRed font-bold bg-shamiRed/5'
                : 'border-transparent text-nouaiBlue/60 hover:text-nouaiBlue hover:bg-nouaiBlue/5'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default TabBar;
