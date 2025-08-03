import React from 'react';

interface SpeakerWaveProps {
  className?: string;
}

export const SpeakerWave: React.FC<SpeakerWaveProps> = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor"/>
      <path d="m15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};
