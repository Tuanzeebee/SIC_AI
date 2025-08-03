import React from 'react';

interface PlayProps {
  className?: string;
}

export const Play: React.FC<PlayProps> = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </svg>
  );
};
