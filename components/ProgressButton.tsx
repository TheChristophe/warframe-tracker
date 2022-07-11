import React, { ReactNode } from 'react';

type ProgressButtonProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
};
const ProgressButton: React.FC<ProgressButtonProps> = ({ onClick, children, className }) => {
  return (
    <button onClick={onClick} className={'w-6 h-6 ' + (className ? className : '')}>
      {children}
    </button>
  );
};

export default ProgressButton;
