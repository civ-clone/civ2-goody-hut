// What each of a hut's outcomes gives, as Civilization II works it out (OpenCiv2 `src/game/retvals.cpp`, the parts of
//  `unit_enter_hut`, richardpenman/civ2@49f26ec). `rand` is C's `rand()` (0 to 32767).

/**
 * The advance a hut gives, by @CIVILIZE index, or -1 for none (`unit_enter_hut`'s fourth case): from a random index
 *  below 100, the first one up, wrapping round, that the player could research. `researchable` answers for an index.
 */
export const hutAdvance = (
  rand: () => number,
  researchable: (index: number) => boolean
): number => {
  let index = rand() % 100;

  for (let attempt = 0; attempt < 999; attempt++) {
    if (researchable(index)) {
      return index;
    }

    index = (index + 1) % 100;
  }

  return -1;
};

/** Gold is doubled after this year. */
export const GOLD_DOUBLED_AFTER = 1000;

/**
 * How much gold a hut holds (`hut_gold`): 50; one time in three, 25 or 100 instead, 25 when `rand() % 10 − level + 2`
 *  is below 5; doubled after 1000 AD.
 */
export const hutGold = (
  rand: () => number,
  level: number,
  year: number
): number => {
  let gold = 50;

  if (rand() % 3 === 0) {
    gold = (rand() % 10) - level + 2 < 5 ? 25 : 100;
  }

  return year > GOLD_DOUBLED_AFTER ? gold * 2 : gold;
};

/** The @UNITS rows mercenaries can be. */
export const ARCHERS = 4,
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
export const mercenaryType = (
  rand: () => number,
  known: MercenaryKnowledge
): number => {
  let mounted = KNIGHTS;

  if (!known.chivalry) {
    mounted = rand() % 3 === 0 ? CHARIOT : HORSEMEN;

    if (known.polytheism && (rand() & 1) !== 0) {
      mounted = ELEPHANT;
    }
  }

  if (known.monotheism) {
    mounted = CRUSADERS;
  }

  if (known.leadership) {
    mounted = DRAGOONS;
  }

  if (known.conscription) {
    mounted = RIFLEMEN;
  }

  let foot = FANATICS;

  if (!known.guerrillaWarfare) {
    foot = MUSKETEERS;
  }

  if (!known.gunpowder) {
    foot = LEGION;
  }

  if (!known.ironWorking) {
    foot = ARCHERS;
  }

  return (rand() & 1) === 0 ? mounted : foot;
};
