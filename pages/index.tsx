import type { NextPage } from 'next';
import Head from 'next/head';
import { Item } from 'warframe-items';
import { FC, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { SaveVersion, StateContext, StateContextProvider } from 'components/StateContext';
import ProgressItems from 'components/ProgressItems';
import { saveAs } from 'file-saver';
import { fetchItems } from 'api/data';
import { ALL_ALLOWED_CATEGORIES, AllowedCategories, SimplifiedItem } from 'utility/types';
import { debounce } from 'lodash';

type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};
const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={'bg-gray-700 text-white p-3 rounded-md mr-2 ' + (className ? className : '')}
    >
      {children}
    </button>
  );
};

const ALL_CATEGORIES: AllowedCategories[] = [
  'Primary',
  'Secondary',
  'Melee',
  'Warframes',
  'Arch-Gun',
  'Arch-Melee',
  'Archwing',
  'Pets',
  'Sentinels',
];

type HomeProps = {
  items: SimplifiedItem[];
};
const Home: NextPage<HomeProps> = ({ items }) => {
  const { state, dispatch } = useContext(StateContext);
  const [active, setActive] = useState<AllowedCategories[]>(ALL_CATEGORIES);
  const [hideCompleted, setHideCompleted] = useState(true);

  const [filter, setFilter] = useState<string>('');
  const filtered = useMemo(() => {
    if (filter.length === 0) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(filter) || item.uniqueName.toLowerCase().includes(filter)
    );
  }, [filter, items]);

  const updateFilter = useCallback(
    debounce((filter: string) => {
      setFilter(filter);
    }, 100),
    [setFilter]
  );
  const clearFilter = useCallback(
    debounce(() => {
      setFilter('');
      (document.getElementById('filter') as HTMLInputElement).value = '';
    }, 100),
    [setFilter]
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
        <div className="pt-2 px-2">
          <Button
            onClick={() => {
              setActive(ALL_CATEGORIES);
              clearFilter();
            }}
            className="mb-1"
          >
            All
          </Button>
          <Button
            onClick={() => {
              setActive(['Primary']);
              clearFilter();
            }}
            className="mb-1"
          >
            Primary
          </Button>
          <Button
            onClick={() => {
              setActive(['Secondary']);
              clearFilter();
            }}
            className="mb-1"
          >
            Secondary
          </Button>
          <Button
            onClick={() => {
              setActive(['Melee']);
              clearFilter();
            }}
            className="mb-1"
          >
            Melee
          </Button>
          <Button
            onClick={() => {
              setActive(['Warframes']);
              clearFilter();
            }}
            className="mb-1"
          >
            Warframes
          </Button>
          <Button
            onClick={() => {
              setActive(['Arch-Gun', 'Arch-Melee', 'Archwing']);
              clearFilter();
            }}
            className="mb-1"
          >
            Archwing
          </Button>
          <Button
            onClick={() => {
              setActive(['Pets', 'Sentinels']);
              clearFilter();
            }}
            className="mb-1"
          >
            Companions
          </Button>
          <div
            className="bg-gray-700 text-white p-3 rounded-md mr-2 mb-1 inline-block"
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
            className="p-2 rounded h-auto mb-1"
            placeholder="Search..."
          />
        </div>
        <div className="grow"></div>
        <div className="pt-2 px-2">
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
        categories={filter.length ? ALL_ALLOWED_CATEGORIES : active}
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
