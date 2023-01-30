import { FC, PropsWithChildren } from 'react';

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
    <button onClick={onClick} className={'w-6 h-6 ' + (className ? className : '')}>
      {children}
    </button>
  );
};

export default ProgressButton;
