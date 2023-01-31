import { FC, useContext, useMemo } from 'react';
import { Completion, StateContext } from 'components/StateContext';
import { imagePath } from 'utility/images';
import ComponentPreview from './ComponentPreview';
import { SimplifiedItem } from 'utility/types';
import Image from 'next/image';

const isCraftable = (item: SimplifiedItem) => {
  return (
    'components' in item &&
    ((item.components.length == 1 && item.components[0].name !== 'Blueprint') || // TODO: any such example?
      item.components.length > 1)
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ensureUnreachable = (nothing: never) => undefined;

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
  ensureUnreachable(completion);
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
    <div className="border shadow border-black border-neutral-600 bg-slate-200 flex divide-x divide-black h-40 m-2  overflow-hidden ">
      <div className={'p-2 w-32 shrink-0 overflow-hidden shadow-inner-thicc ' + background}>
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
            <small className="text-center w-full inline-block">{completionString(completed)}</small>
          </div>
        )}
      </div>
      <div className="grow flex">
        <div className="grow p-2 relative flex-col">
          <p className="grow-0">
            {item.name}{' '}
            {item.wikiaUrl && (
              <small>
                <a href={item.wikiaUrl} className="underline text-cyan-800">
                  Wiki
                </a>
              </small>
            )}
          </p>
          {craftable && 'components' in item && (
            <div className="grow flex flex-row">
              {item.components.map((component, i) => (
                <ComponentPreview
                  key={component.uniqueName + i}
                  item={item}
                  component={component}
                  width={100 / (item.components.length ?? 1) + '%'}
                />
              ))}
            </div>
          )}
          {!craftable && <small>No known recipes to craft this weapon.</small>}
        </div>
      </div>
    </div>
  );
};

export default ProgressItem;
