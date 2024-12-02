import React from 'react';
import cn from 'classnames';

const Alert = ({ children, className, variant = 'info', ...props }) => {
  const classes = cn(
    'p-4 rounded-md',
    {
      'bg-blue-100 text-blue-700': variant === 'info',
      'bg-yellow-100 text-yellow-700': variant === 'warning',
      'bg-red-100 text-red-700': variant === 'error',
      'bg-green-100 text-green-700': variant === 'success',
    },
    className
  );

  return (
    <div className={classes} role="alert" {...props}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className, ...props }) => {
  return (
    <div className={cn('mt-2 text-sm', className)} {...props}>
      {children}
    </div>
  );
};

export { Alert, AlertDescription };