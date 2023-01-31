import { ChangeEventHandler, FC, memo, useContext } from 'react';
import { imagePath } from 'utility/images';
import { StateContext } from 'components/StateContext';
import { SimplifiedComponent, SimplifiedItemWithComponents } from 'utility/types';
import Image from 'next/image';

type ComponentPreviewLayoutProps = {
  component: SimplifiedComponent;
  width: string;
  onToggle: () => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  count: number;
};
const _ComponentPreviewLayout: FC<ComponentPreviewLayoutProps> = ({
  component,
  width,
  onToggle,
  count,
  onChange,
}) => {
  return (
    <div className="grow flex flex-col" style={{ maxWidth: width }}>
      <div
        className={
          'grow-0 p-1 ' +
          (count == component.itemCount
            ? 'bg-lime-200'
            : count == 0
            ? 'bg-red-200'
            : 'bg-amber-200')
        }
        title={component.name}
        role="button"
        style={{ cursor: 'pointer' }}
        onClick={onToggle}
      >
        {component.imageName ? (
          <Image
            src={imagePath(component.imageName)}
            alt={component.name}
            referrerPolicy="no-referrer"
            width={48}
            height={48}
            style={{
              objectFit: 'contain',
            }}
            className="w-12 h-12 mx-auto"
            loading="lazy"
          />
        ) : (
          component.name
        )}
      </div>
      <div className="grow-0 w-full">
        <small className="px-1 text-center w-full inline-block">{component.itemCount}</small>
        <div className={'p-1 ' + (component.itemCount === 1 ? 'hidden' : '')}>
          <input
            type="number"
            className={
              'w-full p-1 text-sm ' +
              (count == component.itemCount
                ? 'bg-lime-200'
                : count == 0
                ? 'bg-red-200'
                : 'bg-amber-200')
            }
            value={count}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
const ComponentPreviewLayout = memo(_ComponentPreviewLayout);

type ComponentPreviewProps = {
  item: SimplifiedItemWithComponents;
  component: SimplifiedComponent;
  width: string;
};
const ComponentPreview: FC<ComponentPreviewProps> = ({ item, component, width }) => {
  const { state, dispatch } = useContext(StateContext);
  const value = state[item.uniqueName].components[component.uniqueName].count;

  const setValue = (value: number) => {
    const clampedValue = Math.min(component.itemCount, Math.max(0, value));
    dispatch({
      type: 'setComponentCount',
      item: item,
      component: component,
      count: clampedValue,
    });
  };

  return (
    <ComponentPreviewLayout
      component={component}
      count={value}
      onToggle={() => setValue(value !== component.itemCount ? component.itemCount : 0)}
      onChange={(e) => setValue(e.target.valueAsNumber)}
      width={width}
    />
  );
};

export default ComponentPreview;
