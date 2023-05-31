import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

type ProgressButtonProps = {
  onClick: () => void;
  className?: string;
};
const ProgressButton: FC<PropsWithChildren<ProgressButtonProps>> = ({
  onClick,
  children,
  className,
}) => {
  return (
    <button onClick={onClick} className={clsx('w-6 h-6', className)}>
      {children}
    </button>
  );
};

export default ProgressButton;
