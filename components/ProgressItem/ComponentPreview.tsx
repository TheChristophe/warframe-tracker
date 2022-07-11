import React, { useContext, useMemo } from 'react';
import Image from 'next/image';
import { imagePath } from 'utility/images';
import { StateContext } from 'components/StateContext';
import { SimplifiedComponent, SimplifiedItemWithComponents } from 'utility/types';

type ComponentPreviewProps = {
  item: SimplifiedItemWithComponents;
  component: SimplifiedComponent;
  width: string;
};
const ComponentPreview: React.FC<ComponentPreviewProps> = ({ item, component, width }) => {
  const { state, dispatch } = useContext(StateContext);
  const value = state[item.uniqueName].components[component.uniqueName].count;

  const singleItem = useMemo(() => {
    return component.itemCount === 1;
  }, [component.itemCount]);

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
    <div className="grow flex flex-col" style={{ maxWidth: width }}>
      <div
        className={
          'grow-0 p-1 ' +
          (value == component.itemCount
            ? 'bg-lime-200'
            : value == 0
            ? 'bg-red-200'
            : 'bg-amber-200')
        }
        title={component.name}
        role="button"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setValue(value !== component.itemCount ? component.itemCount : 0);
        }}
      >
        {component.imageName ? (
          <Image
            src={imagePath(component.imageName)}
            alt={component.name}
            referrerPolicy="no-referrer"
            layout="raw"
            width="100"
            height="100"
            style={{
              objectFit: 'contain',
            }}
            className="w-12 h-12 mx-auto"
          />
        ) : (
          component.name
        )}
      </div>
      <div className="grow-0 w-full">
        <small className="px-1 text-center w-full inline-block">{component.itemCount}</small>
        <div className={'p-1 ' + (singleItem ? 'hidden' : '')}>
          <input
            type="number"
            className={
              'w-full p-1 text-sm ' +
              (value == component.itemCount
                ? 'bg-lime-200'
                : value == 0
                ? 'bg-red-200'
                : 'bg-amber-200')
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.valueAsNumber);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentPreview;
