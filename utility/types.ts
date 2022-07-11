import { Component, Category, Item } from 'warframe-items';

export type SimplifiedComponent = Pick<
  Component,
  'uniqueName' | 'itemCount' | 'name' | 'imageName'
>;

export type _SimplifiedItem = Pick<
  Item,
  'uniqueName' | 'name' | 'category' | 'imageName' | 'wikiaUrl'
>;
export type SimplifiedItemWithoutComponents = _SimplifiedItem;
export type SimplifiedItemWithComponents = _SimplifiedItem & {
  components: SimplifiedComponent[];
};
export type SimplifiedItem = SimplifiedItemWithComponents | SimplifiedItemWithoutComponents;

export type AllowedCategories = Extract<
  Category,
  | 'Primary'
  | 'Secondary'
  | 'Melee'
  | 'Warframes'
  | 'Arch-Gun'
  | 'Arch-Melee'
  | 'Archwing'
  | 'Pets'
  | 'Sentinels'
>;
export const ALL_ALLOWED_CATEGORIES: AllowedCategories[] = [
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
