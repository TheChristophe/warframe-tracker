import { Component, Category, type Melee, type Gun, type Warframe } from 'warframe-items';

export type SimplifiedComponent = Pick<
  Component,
  'uniqueName' | 'itemCount' | 'name' | 'imageName'
>;

export type UsefulItem = Melee | Gun | Warframe;

export type _SimplifiedItem = Pick<
  UsefulItem,
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
  // Melee type
  'Melee',
  'Arch-Melee',
  // Gun type
  'Primary',
  'Secondary',
  'Arch-Gun',
  // Warframe type
  'Warframes',
  'Archwing',
  'Pets',
  'Sentinels',
];
