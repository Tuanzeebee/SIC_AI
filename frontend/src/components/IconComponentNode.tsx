import React from 'react';

interface IconComponentNodeProps {
  className?: string;
}

export const IconComponentNode: React.FC<IconComponentNodeProps> = ({ className }) => {
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
