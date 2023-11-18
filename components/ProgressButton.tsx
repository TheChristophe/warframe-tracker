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
}) => (
  <button onClick={onClick} className={clsx('h-6 w-6', className)}>
    {children}
  </button>
);

export default ProgressButton;
