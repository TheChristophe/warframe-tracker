import type { NextPage } from 'next';
import Head from 'next/head';
import { Item } from 'warframe-items';
import { FC, MouseEventHandler, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { SaveVersion, StateContext, StateContextProvider } from 'components/StateContext';
import ProgressItems from 'components/ProgressItems';
import { saveAs } from 'file-saver';
import { fetchItems } from 'api/data';
import { SimplifiedItem } from 'utility/types';
import { debounce } from 'lodash';
import clsx from 'clsx';
import Filters, { Filter, FilterType } from 'lib/filters';

type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};
const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx('mr-2 rounded-md bg-gray-700 p-3 text-white', className)}
    >
      {children}
    </button>
  );
};

type HomeProps = {
  items: SimplifiedItem[];
};
const Home: NextPage<HomeProps> = ({ items }) => {
  const { state, dispatch } = useContext(StateContext);
  const [active, setActive] = useState<Filter>(Filters.ALL);
  const [hideCompleted, setHideCompleted] = useState(true);

  const [filter, setFilter] = useState<string>('');
  const filtered = useMemo(() => {
    if (filter.length === 0) {
      return items;
    }
    return items.filter(
      (item) => item.name.toLowerCase().includes(filter), // || item.uniqueName.toLowerCase().includes(filter)
    );
  }, [filter, items]);

  const updateFilter = useMemo(
    () =>
      debounce((filter: string) => {
        setFilter(filter);
      }, 100),
    [setFilter],
  );
  const clearFilter = useMemo(
    () =>
      debounce(() => {
        setFilter('');
        (document.getElementById('filter') as HTMLInputElement).value = '';
      }, 100),
    [setFilter],
  );

  const exportSave = () => {
    const blob = new Blob([JSON.stringify({ state, version: SaveVersion.VERSION_0 })], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'export.json');
  };

  return (
    <>
      <Head>
        <title>Warframe tracker</title>
        <meta name="description" content="Track your Warframe affinity progress!" />
        {/*<link rel="icon" type="image/png" href="/favicon.png" />*/}
      </Head>
      <div className="flex flex-row">
        <div className="px-2 pt-2">
          <Button
            onClick={() => {
              setActive(Filters.ALL);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.All && 'underline')}
          >
            All
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.PRIMARY);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Primary && 'underline')}
          >
            Primary
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.SECONDARY);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Secondary && 'underline')}
          >
            Secondary
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.MELEE);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Melee && 'underline')}
          >
            Melee
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.WARFRAME);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Warframe && 'underline')}
          >
            Warframes
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.ARCHWING);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Archwing && 'underline')}
          >
            Archwing
          </Button>
          <Button
            onClick={() => {
              setActive(Filters.COMPANION);
              clearFilter();
            }}
            className={clsx('mb-1', active.id === FilterType.Companion && 'underline')}
          >
            Companions
          </Button>
          <div
            className="mr-2 mb-1 inline-block rounded-md bg-gray-700 p-3 text-white"
            style={{ whiteSpace: 'nowrap' }}
          >
            <input
              name="hide-checked"
              type="checkbox"
              onChange={(e) => {
                setHideCompleted(e.target.checked);
              }}
              checked={hideCompleted}
            />
            <label htmlFor="hide-checked">Hide&nbsp;completed</label>
          </div>
          <input
            onChange={(e) => {
              updateFilter(e.target.value.toLowerCase());
            }}
            id="filter"
            className="mb-1 h-auto rounded p-2"
            placeholder="Search..."
          />
        </div>
        <div className="grow"></div>
        <div className="px-2 pt-2">
          <Button
            onClick={() => {
              document.getElementById('file-picker')?.click();
            }}
            className="mb-1"
          >
            Import
          </Button>
          <input
            type="file"
            className="hidden"
            id="file-picker"
            accept="application/json"
            onChange={(e) => {
              if (e.currentTarget.files == null || e.currentTarget.files.length == 0) {
                return;
              }
              const file = e.target.files?.[0];
              if (file == undefined) {
                return;
              }

              file.text().then((text) => {
                dispatch({
                  type: 'import',
                  data: JSON.parse(text),
                });
              });
            }}
          />
          <Button onClick={exportSave}>Export</Button>
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
const HomeWrapped: NextPage<HomeWrappedProps> = ({ items, itemsByName }) => {
  return (
    <StateContextProvider items={items} itemsByName={itemsByName}>
      <Home items={items} />
    </StateContextProvider>
  );
};

export async function getStaticProps() {
  const items = await fetchItems();

  const itemsByName = items.reduce((dict: Record<string, SimplifiedItem>, item) => {
    return { ...dict, [item.uniqueName]: item };
  }, {});

  return {
    props: { items: items, itemsByName: itemsByName },
  };
}

export default HomeWrapped;
