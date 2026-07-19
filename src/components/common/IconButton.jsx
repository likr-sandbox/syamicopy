import React from 'react';

export function IconButton({
  onClick,
  ariaLabel,
  disabled = false,
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const baseStyle =
    'p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-shamiRed/50 transition-all duration-200 flex items-center justify-center';
  const variants = {
    primary:
      'bg-shamiRed text-washiWhite hover:bg-shamiRed/90 disabled:bg-gray-300 disabled:text-gray-500',
    secondary:
      'bg-nouaiBlue text-washiWhite hover:bg-nouaiBlue/90 disabled:bg-gray-300 disabled:text-gray-500',
    ghost: 'text-nouaiBlue hover:bg-nouaiBlue/10 disabled:text-gray-300'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default IconButton;
