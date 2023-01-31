import { FC, useContext, useMemo } from 'react';
import ProgressItem from 'components/ProgressItem';
import { Completion, StateContext } from './StateContext';
import { AllowedCategories, SimplifiedItem } from 'utility/types';
import { VirtuosoGrid } from 'react-virtuoso';

type ProgressItemsProps = {
  items: SimplifiedItem[];
  categories: AllowedCategories[];
  hideCompleted: boolean;
};
const ProgressItems: FC<ProgressItemsProps> = ({ items, categories, hideCompleted }) => {
  const { state } = useContext(StateContext);

  const allowedItems = useMemo(() => {
    return items.filter(
      (item) =>
        categories.includes(item.category as AllowedCategories) &&
        (!hideCompleted || state[item.uniqueName].completion !== Completion.DONE)
    );
  }, [state, items, categories, hideCompleted]);

  return (
    <VirtuosoGrid
      style={{ height: 'calc(100vh - 4em)' }}
      // aggressive overscan to attempt avoiding empty scrolling
      // TODO: placeholders?
      overscan={3000}
      data={allowedItems}
      itemContent={(index, data) => <ProgressItem item={data} />}
      itemClassName="p-2 md:basis-1/2 basis-full xl:basis-1/3 2xl:basis-1/4"
      listClassName="flex space-between flex-wrap"
      computeItemKey={(i) => allowedItems[i].uniqueName}
    />
  );
};

export default ProgressItems;
