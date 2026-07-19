import React, { useEffect } from 'react';
import IconButton from './IconButton';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes modal
    <div
      data-testid="modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-nouaiBlue/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation of click */}
      <dialog
        open
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg mx-4 bg-washiWhite border border-nouaiBlue/30 rounded shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-nouaiBlue/10 bg-washiWhite">
          <h3 className="text-xl font-bold font-serif text-nouaiBlue">
            {title}
          </h3>
          <IconButton
            onClick={onClose}
            ariaLabel="閉じる"
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
              <title>閉じる</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-nouaiBlue">
          {children}
        </div>
      </dialog>
    </div>
  );
}

export default Modal;
