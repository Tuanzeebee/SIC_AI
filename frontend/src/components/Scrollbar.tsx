import React from 'react';

interface ScrollbarProps {
  OS?: string;
  arrowArrow?: string;
  className?: string;
  directionDownVariantPixelisedStyleOverrideClassName?: string;
  horizontal?: boolean;
  position?: string;
  thumbHorizontalFalseOsClassName?: string;
}

export const Scrollbar: React.FC<ScrollbarProps> = ({
  className = '',
  horizontal = false,
}) => {
  return (
    <div 
      className={`scrollbar ${className}`}
      style={{
        width: horizontal ? '100%' : '12px',
        height: horizontal ? '12px' : '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '6px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: horizontal ? '30%' : '100%',
          height: horizontal ? '100%' : '30%',
          backgroundColor: '#9ca3af',
          borderRadius: '6px',
          position: 'absolute',
          top: horizontal ? 0 : '35%',
          left: horizontal ? '35%' : 0,
        }}
      />
    </div>
  );
};
