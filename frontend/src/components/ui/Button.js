import React from 'react';
import '../../styles/components/Button.css';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    className = '',
    icon,
    ...props
    }) => {
    const handleClick = (e) => {
        if (!disabled && !loading && onClick) {
        onClick(e);
        }
    };

    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        loading ? 'btn-loading' : '',
        disabled ? 'btn-disabled' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
        >
        {loading && <div className="btn-spinner"></div>}
        {icon && <span className="btn-icon">{icon}</span>}
        <span className="btn-text">{children}</span>
        </button>
    );
};

export default Button;