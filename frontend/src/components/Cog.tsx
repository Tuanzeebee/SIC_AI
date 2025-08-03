import React from 'react';

interface CogProps {
  className?: string;
}

export const Cog: React.FC<CogProps> = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="m12 1 2.09 5.26L22 9l-5.26 2.09L14 22l-2.09-5.26L2 15l5.26-2.09L10 2z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};
