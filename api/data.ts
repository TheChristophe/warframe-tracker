import { Item } from 'warframe-items';
import {
  ALL_ALLOWED_CATEGORIES,
  AllowedCategories,
  SimplifiedComponent,
  SimplifiedItem,
  type UsefulItem,
} from 'utility/types';
import cacheData from 'memory-cache';
import { pick } from 'lodash';

const mergeDuplicateComponents = (items: SimplifiedItem[]): SimplifiedItem[] => {
  return items.map((item) => {
    if (!('components' in item)) {
      return item;
    }
    return {
      ...item,
      components: item.components.reduce((components: SimplifiedComponent[], component) => {
        const found = components.find(
          (component_) => component_.uniqueName == component.uniqueName,
        );
        if (found !== undefined) {
          found.itemCount += component.itemCount;
          return components;
        }
        return [...components, component];
      }, []),
    };
  });
};

const _usefulItem = (item: Item): item is UsefulItem => {
  // normal items
  if (
    ALL_ALLOWED_CATEGORIES.includes(item.category as AllowedCategories) &&
    // filter out moa / hound parts
    (item.category === 'Pets' ? item.type !== 'Pet Resource' : true) &&
    // filter out weird pet duplicates
    (item.excludeFromCodex ?? false) === false
  ) {
    return true;
  }

  // Amps
  if (
    item.category === 'Misc' &&
    item.type === 'Amp' &&
    item.name.toLowerCase().includes('prism')
  ) {
    return true;
  }

  return false;
};

const _simplifyItem = (item: UsefulItem): SimplifiedItem => {
  const baseSimplified = pick(item, ['uniqueName', 'name', 'category', 'imageName', 'wikiaUrl']);
  if (item.components == undefined) {
    return baseSimplified;
  }
  return {
    ...baseSimplified,
    components: item.components.map((component) =>
      pick(component, ['uniqueName', 'itemCount', 'name', 'imageName']),
    ),
  };
};

const filterUnusedData = (items: Item[]): SimplifiedItem[] => {
  return (items.filter((item) => _usefulItem(item)) as UsefulItem[]).map(_simplifyItem);
};

const ITEM_CACHE = 'item-cache';
export const fetchItems = async (): Promise<SimplifiedItem[]> => {
  const value = cacheData.get(ITEM_CACHE);
  if (value) {
    return value;
  } else {
    const hours = 24;
    const res = await fetch('https://api.warframestat.us/items/', {
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('API is down');
    }
    const data = mergeDuplicateComponents(filterUnusedData((await res.json()) as Item[]));
    cacheData.put(ITEM_CACHE, data, hours * 1000 * 60 * 60);
    return data;
  }
};
