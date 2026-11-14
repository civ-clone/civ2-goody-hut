/**
 * The advance a hut gives, by @CIVILIZE index, or -1 for none (`unit_enter_hut`'s fourth case): from a random index
 *  below 100, the first one up, wrapping round, that the player could research. `researchable` answers for an index.
 */
export declare const hutAdvance: (
  rand: () => number,
  researchable: (index: number) => boolean
) => number;
/** Gold is doubled after this year. */
export declare const GOLD_DOUBLED_AFTER = 1000;
/**
 * How much gold a hut holds (`hut_gold`): 50; one time in three, 25 or 100 instead, 25 when `rand() % 10 − level + 2`
 *  is below 5; doubled after 1000 AD.
 */
export declare const hutGold: (
  rand: () => number,
  level: number,
  year: number
) => number;
/** The @UNITS rows mercenaries can be. */
export declare const ARCHERS = 4,
  LEGION = 5,
  MUSKETEERS = 7,
  FANATICS = 8,
  RIFLEMEN = 11,
  HORSEMEN = 15,
  CHARIOT = 16,
  ELEPHANT = 17,
  CRUSADERS = 18,
  KNIGHTS = 19,
  DRAGOONS = 20;
/** The advances the mercenaries' type depends on, each known by anyone in the game or not. */
export interface MercenaryKnowledge {
  chivalry: boolean;
  polytheism: boolean;
  monotheism: boolean;
  leadership: boolean;
  conscription: boolean;
  guerrillaWarfare: boolean;
  gunpowder: boolean;
  ironWorking: boolean;
}
/**
 * The mercenaries' @UNITS row (`hut_mercenaries`), from what anyone in the game knows. A mounted type: Knights with
 *  Chivalry, otherwise Chariot one time in three or Horsemen, or on a coin flip Elephants with Polytheism; Crusaders
 *  with Monotheism, Dragoons with Leadership, Riflemen with Conscription, each overriding the last. A foot type:
 *  Fanatics with Guerrilla Warfare, else Musketeers, Legion without Gunpowder, Archers without Iron Working. A coin flip
 *  picks the mounted type on an even roll.
 */
export declare const mercenaryType: (
  rand: () => number,
  known: MercenaryKnowledge
) => number;
