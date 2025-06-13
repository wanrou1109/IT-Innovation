import React from 'react';
import '../../styles/components/Card.css';

const Card = ({ 
    children, 
    className = '', 
    onClick, 
    hoverable = false,
    padding = 'normal',
    background = 'default'
}) => {
    const cardClasses = [
      'card',
      className,
      hoverable ? 'hoverable' : '',
      `padding-${padding}`,
      `background-${background}`
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={cardClasses}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            } : undefined}
        >
            {children}
        </div>
    );
};

export default Card;