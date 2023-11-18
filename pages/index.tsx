import type { NextPage } from 'next';
import Head from 'next/head';
import { Item } from 'warframe-items';
import {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SaveVersion, StateContext, StateContextProvider } from 'components/StateContext';
import ProgressItems from 'components/ProgressItems';
import { saveAs } from 'file-saver';
import { fetchItems } from 'api/data';
import { SimplifiedItem } from 'utility/types';
import { debounce } from 'lodash';
import clsx from 'clsx';
import Filters, { type FILTERS, Filter, FilterType } from 'lib/filters';

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
  const [active, setActive] = useState<Filter>(Filters.ALL);
  const [hideCompleted, setHideCompleted] = useState(true);

  const filePicker = useRef<HTMLInputElement>(null);
  const textFilter = useRef<HTMLInputElement>(null);

  const [activeFilter, setActiveFilter] = useState<string>('');
  const filtered = useMemo(() => {
    if (activeFilter.length === 0) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(activeFilter));
  }, [activeFilter, items]);

  const updateFilter = useMemo(
    () =>
      debounce((filter: string) => {
        setActiveFilter(filter);
      }, 100),
    [setActiveFilter],
  );
  const clearFilter = useMemo(
    () =>
      debounce(() => {
        setActiveFilter('');
        textFilter.current && (textFilter.current.value = '');
      }, 100),
    [setActiveFilter],
  );

  const exportSave = () => {
    const blob = new Blob([JSON.stringify({ state, version: SaveVersion.VERSION_0 })], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'export.json');
  };

  const filter = (filter: FILTERS) => () => {
    setActive(filter);
    clearFilter();
  };

  return (
    <>
      <Head>
        <title>Warframe tracker</title>
        <meta name="description" content="Track your Warframe affinity progress!" />
      </Head>
      <div className="flex flex-row">
        <div className="px-2 pt-2">
          <FilterButton onClick={filter(Filters.ALL)} active={active.id === FilterType.All}>
            All
          </FilterButton>
          <FilterButton onClick={filter(Filters.PRIMARY)} active={active.id === FilterType.Primary}>
            Primary
          </FilterButton>
          <FilterButton
            onClick={filter(Filters.SECONDARY)}
            active={active.id === FilterType.Secondary}
          >
            Secondary
          </FilterButton>
          <FilterButton onClick={filter(Filters.MELEE)} active={active.id === FilterType.Melee}>
            Melee
          </FilterButton>
          <FilterButton
            onClick={filter(Filters.WARFRAME)}
            active={active.id === FilterType.Warframe}
          >
            Warframes
          </FilterButton>
          <FilterButton
            onClick={filter(Filters.ARCHWING)}
            active={active.id === FilterType.Archwing}
          >
            Archwing
          </FilterButton>
          <FilterButton
            onClick={filter(Filters.COMPANION)}
            active={active.id === FilterType.Companion}
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
            onChange={(e) => updateFilter(e.target.value.toLowerCase())}
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
        items={filtered}
        filter={filter.length ? undefined : active}
        hideCompleted={hideCompleted}
      />
    </>
  );
};

type HomeWrappedProps = {
  items: Item[];
  itemsByName: Record<string, Item>;
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
