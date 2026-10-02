import React from 'react';

interface MacWindowControlsProps {
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const MacWindowControls: React.FC<MacWindowControlsProps> = ({
  className = '',
  onClose,
  onMinimize,
  onMaximize,
}) => {
  return (
    <div className={`flex items-center gap-2 group ${className}`} aria-label="macOS Window Controls">
      <button
        type="button"
        onClick={onClose}
        title="Close (Simulated)"
        className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] flex items-center justify-center transition-opacity hover:opacity-85 focus:outline-none"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#4d0000] font-bold leading-none select-none">
          ✕
        </span>
      </button>
      <button
        type="button"
        onClick={onMinimize}
        title="Minimize (Simulated)"
        className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] flex items-center justify-center transition-opacity hover:opacity-85 focus:outline-none"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#543b00] font-bold leading-none select-none">
          –
        </span>
      </button>
      <button
        type="button"
        onClick={onMaximize}
        title="Zoom (Simulated)"
        className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] flex items-center justify-center transition-opacity hover:opacity-85 focus:outline-none"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[7px] text-[#004d11] font-bold leading-none select-none">
          +
        </span>
      </button>
    </div>
  );
};
