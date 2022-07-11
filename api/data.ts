import { Item } from 'warframe-items';
import {
  ALL_ALLOWED_CATEGORIES,
  AllowedCategories,
  SimplifiedComponent,
  SimplifiedItem,
} from 'utility/types';
import cacheData from 'memory-cache';
import _ from 'lodash';

const mergeDuplicateComponents = (items: SimplifiedItem[]): SimplifiedItem[] => {
  return items.map((item) => {
    if (!('components' in item)) {
      return item;
    }
    return {
      ...item,
      components: item.components.reduce((components: SimplifiedComponent[], component) => {
        const found = components.find(
          (component_) => component_.uniqueName == component.uniqueName
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

const filterUnusedData = (items: Item[]): SimplifiedItem[] => {
  return items
    .filter((item) => ALL_ALLOWED_CATEGORIES.includes(item.category as AllowedCategories))
    .map((item) => {
      const baseSimplified = _.pick(item, [
        'uniqueName',
        'name',
        'category',
        'imageName',
        'wikiaUrl',
      ]);
      if (item.components == undefined) {
        return baseSimplified;
      }
      return {
        ...baseSimplified,
        components: item.components.map((component) =>
          _.pick(component, ['uniqueName', 'itemCount', 'name', 'imageName'])
        ),
      };
    });
};

const ITEM_CACHE = 'item-cache';
export const fetchItems = async (): Promise<SimplifiedItem[]> => {
  const value = cacheData.get(ITEM_CACHE);
  if (value) {
    return value;
  } else {
    const hours = 24;
    const res = await fetch('https://api.warframestat.us/items');
    const data = mergeDuplicateComponents(filterUnusedData((await res.json()) as Item[]));
    cacheData.put(ITEM_CACHE, data, hours * 1000 * 60 * 60);
    return data;
  }
};
