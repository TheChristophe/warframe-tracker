import { SimplifiedItem } from 'utility/types';

export enum FilterType {
  All,
  Primary,
  Secondary,
  Melee,
  Warframe,
  Archwing,
  Companion,
}

export type FilterRule = Partial<Omit<SimplifiedItem, 'components'>>;
export enum FilterMatch {
  Full,
  Partial,
}
export enum FilterMode {
  AND,
  OR,
}

export type Filter = {
  id?: FilterType;
  match?: FilterMatch;
  mode?: FilterMode;
  filters: FilterRule[];
};

const ALL = {
  id: FilterType.All,
  filters: [],
};

const PRIMARY: Filter = {
  id: FilterType.Primary,
  filters: [
    {
      category: 'Primary',
    },
  ],
};

const SECONDARY: Filter = {
  id: FilterType.Secondary,
  filters: [
    {
      category: 'Secondary',
    },
  ],
};

const MELEE: Filter = {
  id: FilterType.Melee,
  filters: [
    {
      category: 'Melee',
    },
  ],
};

const WARFRAME: Filter = {
  id: FilterType.Warframe,
  filters: [
    {
      category: 'Warframes',
    },
  ],
};

const ARCHWING: Filter = {
  id: FilterType.Archwing,
  filters: [
    {
      category: 'Arch-Gun',
    },
    {
      category: 'Arch-Melee',
    },
    {
      category: 'Archwing',
    },
  ],
};

const COMPANION: Filter = {
  id: FilterType.Companion,
  filters: [
    {
      category: 'Pets',
    },
    {
      category: 'Sentinels',
    },
  ],
};

const Filters = {
  ALL,
  PRIMARY,
  SECONDARY,
  MELEE,
  WARFRAME,
  ARCHWING,
  COMPANION,
} as const;
export type FILTERS = (typeof Filters)[keyof typeof Filters];

export default Filters;
