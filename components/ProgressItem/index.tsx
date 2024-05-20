import { type FC, useContext, useMemo } from 'react';
import { Completion, StateContext } from 'components/StateContext';
import { imagePath } from 'utility/images';
import ComponentPreview from './ComponentPreview';
import { type SimplifiedItem } from 'utility/types';
import Image from 'next/image';
import clsx from 'clsx';
import styles from './index.module.scss';

const isCraftable = (item: SimplifiedItem) =>
  'components' in item &&
  ((item.components.length == 1 && item.components[0].name !== 'Blueprint') || // TODO: any such example?
    item.components.length > 1);
const completionString = (completion: Completion) => {
  switch (completion) {
    case Completion.MISSING_EVERYTHING:
      return 'Not started';
    case Completion.MISSING_SOMETHING:
      return 'Missing parts';
    case Completion.READY_TO_CRAFT:
      return 'Ready to craft';
    case Completion.DONE:
      return 'Done';
  }
};

type ProgressItemProps = {
  item: SimplifiedItem;
};
const ProgressItem: FC<ProgressItemProps> = ({ item }) => {
  const { state, dispatch } = useContext(StateContext);

  const craftable = useMemo(() => {
    return isCraftable(item);
  }, [item]);

  const completed = state[item.uniqueName].completion;
  let background = 'bg-zinc-300';
  if (completed === Completion.READY_TO_CRAFT) {
    background = 'bg-cyan-200';
  } else if (completed === Completion.MISSING_EVERYTHING) {
    background = 'bg-red-300';
  } else if (completed === Completion.MISSING_SOMETHING) {
    background = 'bg-amber-200';
  } else if (completed === Completion.DONE) {
    background = 'bg-lime-300';
  }

  return (
    <div
      className={clsx(
        'm-2 flex h-40 divide-x divide-black overflow-hidden border border-neutral-600 bg-slate-200 shadow',
        styles['fadeIn'],
      )}
    >
      <div className={clsx('w-32 shrink-0 overflow-hidden p-2 shadow-inner-thicc', background)}>
        {item.imageName && (
          <div className="relative w-full">
            <Image
              src={imagePath(item.imageName)}
              alt={item.name}
              referrerPolicy="no-referrer"
              width={112}
              height={112}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (completed !== Completion.DONE) {
                  dispatch({
                    type: 'setCompleted',
                    item: item,
                    completion: Completion.DONE,
                  });
                } else {
                  dispatch({
                    type: 'setCompleted',
                    item: item,
                    completion: Completion.MISSING_EVERYTHING,
                  });
                }
              }}
            />
            <small className="inline-block w-full text-center">{completionString(completed)}</small>
          </div>
        )}
      </div>
      <div className="flex grow">
        <div className="relative grow flex-col p-2">
          <p className="grow-0">
            {item.name}{' '}
            {item.wikiaUrl && (
              <small>
                <a href={item.wikiaUrl} className="text-cyan-800 underline">
                  Wiki
                </a>
              </small>
            )}
          </p>
          {craftable && 'components' in item && (
            <ul className="flex grow flex-row">
              {item.components.map((component, i) => (
                <ComponentPreview
                  key={component.uniqueName + i}
                  item={item}
                  component={component}
                  width={100 / (item.components.length ?? 1) + '%'}
                />
              ))}
            </ul>
          )}
          {!craftable && <small>No known recipes to craft this weapon.</small>}
        </div>
      </div>
    </div>
  );
};

export default ProgressItem;
