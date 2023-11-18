import React, { createContext, Dispatch, PropsWithChildren, useEffect, useReducer } from 'react';
import { Item } from 'warframe-items';
import { debounce } from 'lodash';
import { SimplifiedComponent, SimplifiedItem } from 'utility/types';
import { determineCompletion } from 'utility/determineCompletion';

const LOCALSTORAGE_KEY = 'autosave';

export enum Completion {
  MISSING_EVERYTHING,
  MISSING_SOMETHING,
  READY_TO_CRAFT,
  DONE,
}

type ComponentProgress = { count: number };
export type Progress = {
  components: Record<string, ComponentProgress>;
  completion: Completion;
};

export const SaveVersion = {
  VERSION_0: 0,
} as const;
export type SaveVersion = (typeof SaveVersion)[keyof typeof SaveVersion];
export type State = Record<string, Progress>;
export type Export = {
  state: State;
  version: SaveVersion;
};

const Actions = {
  SetComponentCount: 'setComponentCount',
  SetCompleted: 'setCompleted',
  Autosave: 'autosave',
  Autoload: 'autoload',
  Import: 'import',
} as const;
//type Actions = (typeof Actions)[keyof typeof Actions];

type Action =
  | {
      type: typeof Actions.SetComponentCount;
      item: SimplifiedItem;
      component: SimplifiedComponent;
      count: number;
    }
  | {
      type: typeof Actions.SetCompleted;
      item: SimplifiedItem;
      completion: Completion;
    }
  | {
      type: typeof Actions.Autosave;
    }
  | {
      type: typeof Actions.Autoload;
    }
  | { type: typeof Actions.Import; data: Export };

const INITIAL_STATE = {};
type StateContext = {
  state: State;
  dispatch: Dispatch<Action>;
  itemsByName: Record<string, Item>;
};
export const StateContext = createContext<StateContext>({
  state: INITIAL_STATE,
  dispatch: () => undefined,
  itemsByName: {},
});

const save = (state: State) => localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

const autosave = debounce((state: State) => {
  if (state !== undefined) {
    save(state);
  }
}, 500);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case Actions.SetComponentCount: {
      const newState = { ...state };

      newState[action.item.uniqueName]['components'][action.component.uniqueName].count =
        action.count;
      if ('components' in action.item) {
        newState[action.item.uniqueName].completion =
          determineCompletion(action.item, newState[action.item.uniqueName]) ??
          Completion.MISSING_EVERYTHING;
      }

      autosave(newState);
      return newState;
    }

    case Actions.SetCompleted: {
      const newState = { ...state };

      newState[action.item.uniqueName].completion = action.completion;
      if ('components' in action.item) {
        if (action.completion === Completion.MISSING_EVERYTHING) {
          action.item.components.map((component) => {
            newState[action.item.uniqueName].components[component.uniqueName].count = 0;
          });
        } else if (action.completion === Completion.DONE) {
          action.item.components.map((component) => {
            newState[action.item.uniqueName].components[component.uniqueName].count =
              component.itemCount;
          });
        }
      }

      autosave(newState);
      return newState;
    }

    case Actions.Autosave:
      console.info('autosave');
      autosave(state);
      return state;

    case Actions.Autoload: {
      console.info('autoload');
      const autosave = localStorage.getItem(LOCALSTORAGE_KEY);
      if (autosave == null) {
        return state;
      }
      return { ...state, ...JSON.parse(autosave) };
    }

    case Actions.Import: {
      console.info('import');
      switch (action.data.version) {
        case SaveVersion.VERSION_0:
          return { ...state, ...action.data.state };
      }
    }
  }
};

type StateContextProviderProps = PropsWithChildren<{
  items: Item[];
  itemsByName: Record<string, Item>;
}>;
export const StateContextProvider: React.FC<StateContextProviderProps> = ({
  children,
  items,
  itemsByName,
}) => {
  const [state, dispatch] = useReducer(
    reducer,
    items.reduce((state: State, item: Item) => {
      state[item.uniqueName] = {
        components:
          item.components?.reduce(
            (componentProgress, component) => {
              componentProgress[component.uniqueName] = {
                count: 0,
              };
              return componentProgress;
            },
            {} as Progress['components'],
          ) ?? {},
        completion: Completion.MISSING_EVERYTHING,
      };
      return state;
    }, {}),
  );

  useEffect(() => {
    dispatch({ type: 'autoload' });
    const interval = setInterval(autosave, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <StateContext.Provider value={{ state, dispatch, itemsByName }}>
      {children}
    </StateContext.Provider>
  );
};
