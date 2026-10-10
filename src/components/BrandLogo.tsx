import React from 'react';
import { Activity } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  white?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  white = false,
}) => {
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const boxSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const subtitleSizeClass = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${boxSizeClass} rounded-md bg-[#1B74E4] text-white flex items-center justify-center shrink-0 shadow-sm`}
        aria-hidden="true"
      >
        <Activity className={iconSizeClass} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-bold tracking-tight ${titleSizeClass} ${
            white ? 'text-white' : 'text-[#222222]'
          }`}
        >
          AgraVeda
        </span>
        {showSubtitle && (
          <span
            className={`font-medium tracking-wide uppercase mt-1 ${subtitleSizeClass} ${
              white ? 'text-slate-300' : 'text-[#727272]'
            }`}
          >
            Emergency Flow Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

export const DemoModeBanner: React.FC<{ onDismiss?: () => void }> = () => {
  return (
    <div
      role="status"
      className="bg-[#FFF8E6] border-b border-[#F7E19F] text-[#8C5800] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider text-[10px] bg-[#8C5800] text-white px-1.5 py-0.5 rounded-sm">
          Demo Mode
        </span>
        <span>
          Synthetic emergency department dataset & simulated authentication adapter. Not connected to live hospital EHR.
        </span>
      </div>
      <span className="text-[11px] text-[#A66D00]">
        Decision-support prototype · Clinical staff retain care authority
      </span>
    </div>
  );
};
