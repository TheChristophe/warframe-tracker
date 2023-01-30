import { Fragment, FC, useContext } from 'react';
import ProgressItem from 'components/ProgressItem';
import { Completion, StateContext } from './StateContext';
import { AllowedCategories, SimplifiedItem } from 'utility/types';

type ProgressItemsProps = {
  items: SimplifiedItem[];
  categories: AllowedCategories[];
  hideCompleted: boolean;
};
const ProgressItems: FC<ProgressItemsProps> = ({ items, categories, hideCompleted }) => {
  const { state } = useContext(StateContext);

  return (
    <div className="flex space-between flex-wrap">
      {items.map((item) => {
        return (
          <Fragment key={item.uniqueName}>
            {categories.includes(item.category as AllowedCategories) &&
              (!hideCompleted || state[item.uniqueName].completion !== Completion.DONE) && (
                <ProgressItem key={item.uniqueName} item={item} />
              )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default ProgressItems;
