import React, { createContext, ReactNode, useEffect, useReducer } from 'react';
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

export type Progress = {
  components: Record<
    string,
    {
      count: number;
    }
  >;
  completion: Completion;
};

export enum SaveVersion {
  VERSION_0,
}
export type State = Record<string, Progress>;
export type Export = {
  state: State;
  version: SaveVersion;
};

type Action =
  | {
      type: 'setComponentCount';
      item: SimplifiedItem;
      component: SimplifiedComponent;
      count: number;
    }
  | {
      type: 'setCompleted';
      item: SimplifiedItem;
      completion: Completion;
    }
  | {
      type: 'autosave';
    }
  | {
      type: 'autoload';
    }
  | { type: 'import'; data: Export };
const INITIAL_STATE = {};
type StateContext = {
  state: State;
  dispatch: React.Dispatch<Action>;
  itemsByName: Record<string, Item>;
};
export const StateContext = createContext<StateContext>({
  state: INITIAL_STATE,
  dispatch: () => undefined,
  itemsByName: {},
});

const save = (state: State) => {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
};

const autosave = debounce((state: State) => {
  if (state !== undefined) {
    save(state);
  }
}, 500);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'setComponentCount': {
      console.info('setComponentCount');
      const newState: State = {
        ...state,
        [action.item.uniqueName]: {
          ...state[action.item.uniqueName],
          components: {
            ...state[action.item.uniqueName].components,
            [action.component.uniqueName]: { count: action.count },
          },
        },
      };
      if ('components' in action.item) {
        newState[action.item.uniqueName].completion =
          determineCompletion(action.item, newState[action.item.uniqueName]) ??
          Completion.MISSING_EVERYTHING;
      }
      autosave(newState);
      return newState;
    }
    case 'setCompleted': {
      console.info('setCompleted');
      const newState: State = {
        ...state,
        [action.item.uniqueName]: {
          ...state[action.item.uniqueName],
          completion: action.completion,
        },
      };
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
    case 'autosave':
      console.info('autosave');
      autosave(state);
      return state;
    case 'autoload': {
      console.info('autoload');
      const autosave = localStorage.getItem(LOCALSTORAGE_KEY);
      if (autosave == null) {
        return state;
      }
      return { ...state, ...JSON.parse(autosave) };
    }
    case 'import': {
      console.info('import');
      switch (action.data.version) {
        case SaveVersion.VERSION_0:
          return { ...state, ...action.data.state };
      }
    }
  }
};

type StateContextProviderProps = {
  items: Item[];
  itemsByName: Record<string, Item>;
  children: ReactNode;
};
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
          item.components?.reduce((componentProgress, component) => {
            return {
              ...componentProgress,
              [component.uniqueName]: {
                count: 0,
              },
            };
          }, {} as Progress['components']) ?? {},
        completion: Completion.MISSING_EVERYTHING,
      };
      return state;
    }, {})
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
