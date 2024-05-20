import { type NextPage } from 'next';
import Head from 'next/head';
import {
  type FC,
  type MouseEventHandler,
  type PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SaveVersion, StateContext, StateContextProvider } from 'components/StateContext';
import ProgressItems from 'components/ProgressItems';
import { saveAs } from 'file-saver';
import { fetchItems } from 'api/data';
import { type SimplifiedItem, type UsefulItem } from 'utility/types';
import { debounce } from 'lodash';
import clsx from 'clsx';
import Filters, { type FILTERS, type Filter, FilterType } from 'lib/filters';

type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};
const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={clsx('mr-2 rounded-md bg-gray-700 p-3 text-white shadow-md', className)}
  >
    {children}
  </button>
);

type FilterButtonProps = {
  onClick: () => void;
  active: boolean;
};
const FilterButton: FC<PropsWithChildren<FilterButtonProps>> = ({ onClick, active, children }) => (
  <Button onClick={onClick} className={clsx('mb-1', active && 'underline')} aria-current={true}>
    {children}
  </Button>
);

type HomeProps = {
  items: SimplifiedItem[];
};
const Home: NextPage<HomeProps> = ({ items }) => {
  const { state, dispatch } = useContext(StateContext);
  const [categoryFilter, setCategoryFilter] = useState<Filter>(Filters.ALL);
  const [hideCompleted, setHideCompleted] = useState(true);

  const filePicker = useRef<HTMLInputElement>(null);
  const textFilter = useRef<HTMLInputElement>(null);

  const [nameFilter, setNameFilter] = useState<string>('');
  const nameFiltered = useMemo(
    () =>
      nameFilter.length !== 0
        ? items.filter((item) => item.name.toLowerCase().includes(nameFilter))
        : items,
    [nameFilter, items],
  );

  const updateNameFilter = useMemo(
    () =>
      debounce((filter: string) => {
        setNameFilter(filter);
      }, 100),
    [setNameFilter],
  );
  const clearNameFilter = useMemo(
    () =>
      debounce(() => {
        setNameFilter('');
        textFilter.current && (textFilter.current.value = '');
      }, 100),
    [setNameFilter],
  );

  const exportSave = () =>
    saveAs(
      new Blob([JSON.stringify({ state, version: SaveVersion.VERSION_0 })], {
        type: 'text/plain;charset=utf-8',
      }),
      'export.json',
    );

  const updateCategoryFilter = (filter: FILTERS) => () => {
    setCategoryFilter(filter);
    clearNameFilter();
  };

  return (
    <>
      <Head>
        <title>Warframe tracker</title>
        <meta name="description" content="Track your Warframe affinity progress!" />
      </Head>
      <div className="flex flex-row">
        <div className="px-2 pt-2">
          <FilterButton
            onClick={updateCategoryFilter(Filters.ALL)}
            active={categoryFilter.id === FilterType.All}
          >
            All
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.PRIMARY)}
            active={categoryFilter.id === FilterType.Primary}
          >
            Primary
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.SECONDARY)}
            active={categoryFilter.id === FilterType.Secondary}
          >
            Secondary
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.MELEE)}
            active={categoryFilter.id === FilterType.Melee}
          >
            Melee
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.WARFRAME)}
            active={categoryFilter.id === FilterType.Warframe}
          >
            Warframes
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.ARCHWING)}
            active={categoryFilter.id === FilterType.Archwing}
          >
            Archwing
          </FilterButton>
          <FilterButton
            onClick={updateCategoryFilter(Filters.COMPANION)}
            active={categoryFilter.id === FilterType.Companion}
          >
            Companions
          </FilterButton>
          <div className="mb-1 mr-2 inline-block whitespace-nowrap rounded-md bg-gray-700 p-3 text-white shadow-md">
            <input
              name="hide-checked"
              type="checkbox"
              onChange={(e) => setHideCompleted(e.target.checked)}
              checked={hideCompleted}
            />
            <label htmlFor="hide-checked">Hide&nbsp;completed</label>
          </div>
          <input
            onChange={(e) => updateNameFilter(e.target.value.toLowerCase())}
            ref={textFilter}
            className="mb-1 h-auto rounded p-2 shadow-md"
            placeholder="Search..."
          />
        </div>
        <div className="grow" />
        <div className="px-2 pt-2">
          <Button onClick={() => filePicker.current?.click()} className="mb-1">
            Import
          </Button>
          <input
            type="file"
            className="hidden"
            ref={filePicker}
            accept="application/json"
            onChange={(e) => {
              if (e.currentTarget.files == null || e.currentTarget.files.length == 0) {
                return;
              }
              const file = e.target.files?.[0];
              if (file == undefined) {
                return;
              }

              file.text().then((text) =>
                dispatch({
                  type: 'import',
                  data: JSON.parse(text),
                }),
              );
            }}
          />
          <Button onClick={exportSave} className="">
            Export
          </Button>
        </div>
      </div>
      <ProgressItems
        items={nameFiltered}
        filter={nameFilter.length > 0 ? undefined : categoryFilter}
        hideCompleted={hideCompleted}
      />
    </>
  );
};

type HomeWrappedProps = {
  items: UsefulItem[];
  itemsByName: Record<string, UsefulItem>;
};
const HomeWrapped: NextPage<HomeWrappedProps> = ({ items, itemsByName }) => (
  <StateContextProvider items={items} itemsByName={itemsByName}>
    <Home items={items} />
  </StateContextProvider>
);

export async function getStaticProps() {
  const items = await fetchItems();

  const itemsByName = items.reduce((dict: Record<string, SimplifiedItem>, item) => {
    dict[item.uniqueName] = item;
    return dict;
  }, {});

  return {
    props: { items: items, itemsByName: itemsByName },
  };
}

export default HomeWrapped;
