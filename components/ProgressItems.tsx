import { FC, useContext, useMemo } from 'react';
import ProgressItem from 'components/ProgressItem';
import { Completion, StateContext } from './StateContext';
import { SimplifiedItem } from 'utility/types';
import { VirtuosoGrid } from 'react-virtuoso';
import { Filter, FilterMatch, FilterMode, FilterRule } from 'lib/filters';
import { isEqual } from 'lodash';

const matchesFilter = (item: SimplifiedItem, filter: Filter) =>
  // handle AND (every filter must match) and OR (at least one filter must match)
  Object.values(filter.filters)[filter.mode === FilterMode.AND ? 'every' : 'some']((value) =>
    // match every field in the filter
    Object.entries(value).every(([key, value]) => {
      // filters are only defined in software, should always be legal
      const comparedTo = item[key as keyof FilterRule];
      // targets don't need to exactly match
      if (filter.match === FilterMatch.Partial) {
        //if (Array.isArray(comparedTo) && Array.isArray(value)) {
        //  return value.every((v) => item[key as keyof SimplifiedItem]?.includes(v));
        //}
        return !!comparedTo?.includes(value);
      }
      return isEqual(comparedTo, value);
    }),
  );
type ProgressItemsProps = {
  items: SimplifiedItem[];
  filter?: Filter;
  hideCompleted: boolean;
};
const ProgressItems: FC<ProgressItemsProps> = ({ items, filter, hideCompleted }) => {
  const { state } = useContext(StateContext);

  const allowedItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (filter === undefined || filter.filters.length === 0 || matchesFilter(item, filter)) &&
          (!hideCompleted || state[item.uniqueName].completion !== Completion.DONE),
      ),
    [state, items, filter, hideCompleted],
  );

  return (
    <VirtuosoGrid
      style={{ height: 'calc(100vh - 4em)' }}
      // aggressive overscan to attempt avoiding empty scrolling
      // TODO: placeholders?
      overscan={3000}
      data={allowedItems}
      itemContent={(index, data) => <ProgressItem item={data} />}
      listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      computeItemKey={(i) => allowedItems[i].uniqueName}
    />
  );
};

export default ProgressItems;
