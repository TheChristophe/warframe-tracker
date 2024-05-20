import { Completion, Progress } from 'components/StateContext';
import { SimplifiedItem, UsefulItem } from './types';

type ItemWithComponents = Omit<UsefulItem, 'components'> & {
  components: Exclude<UsefulItem['components'], undefined>;
};
export const determineCompletion = (item: SimplifiedItem, progress: Progress) => {
  if (!('components' in item) || progress.components === undefined) {
    return null;
  }
  const item_ = item as ItemWithComponents;
  const completed = item.components
    .map((item) => item.uniqueName)
    .reduce((count, key) => {
      if (
        progress.components[key].count ===
        item_.components.find((component) => component.uniqueName === key)?.itemCount
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  if (completed === item_.components.length) {
    return Completion.READY_TO_CRAFT;
  }
  if (completed === 0) {
    return Completion.MISSING_EVERYTHING;
  }
  return Completion.MISSING_SOMETHING;
};
