// Which of its outcomes a hut gives, as Civilization II decides it (OpenCiv2 `src/game/retvals.cpp` `unit_enter_hut`,
//  richardpenman/civ2@49f26ec): one roll of five, then a chain of redirects. Pure: what the game knows comes in as
//  `HutFacts`, and `rand` is C's `rand()` (0 to 32767), asked in the game's order.

export type Outcome =
  | 'tribe-city'
  | 'mercenaries'
  | 'gold'
  | 'barbarians'
  | 'advance'
  | 'nomads';

/** The five a roll can give (`rand() % 5`), and the sixth only a redirect reaches. */
export const rolled: Outcome[] = [
  'tribe-city',
  'mercenaries',
  'gold',
  'barbarians',
  'advance',
];

export interface HutFacts {
  /** A person plays the player whose unit entered the hut. */
  human: boolean;
  /** The player's cities. */
  cities: number;
  /** The player's cities on the hut's land mass. */
  citiesOnLandMass: number;
  /** Another player has a city or a unit on the hut's land mass (the computer players' `continent_flags`). */
  othersOnLandMass: boolean;
  /** How far the nearest city of anyone's is (Civilization II's distance), or `Infinity` with none. */
  nearestCity: number;
  /** The game's turn. */
  turn: number;
  /** Units of the settlers role with no home city, everyone's. */
  homelessSettlers: number;
  /** Units of the settlers role with no home city, the player's. */
  ownHomelessSettlers: number;
  /** The hut square's fertility, 0 if it's in a city's radius (`tile_owner_or_fertility`). */
  fertility: number;
  /** The player knows Invention. */
  knowsInvention: boolean;
  /** Anyone knows Explosives. */
  explosivesKnown: boolean;
  /** The player is a computer player ranked below the lowest-ranked human (`power_rank`). */
  trailsTheHumans: boolean;
  /** The difficulty level, 0 to 5. */
  level: number;
  /** A ruleset raises barbarians (a `Barbarians` rule is registered). */
  barbarians: boolean;
  /**
   * The advance the hut would give, by index, or -1 for none: asked when the chain reaches an advance, with the same
   *  `rand` (`hutAdvance`).
   */
  pickAdvance: (rand: () => number) => number;
}

export interface HutResult {
  outcome: Outcome;
  /** The advance's index, for `advance`; otherwise -1. */
  advance: number;
  /** How many steps of the chain it took: `MAX_STEPS` only if it never ended (then gold). */
  steps: number;
}

/** The nearest city must be at least this far for a tribe's city or barbarians: nearer, mercenaries come instead. */
export const NEAR_CITY = 4;

/** With no city of its own on the land mass, a player gets a city there when the nearest city is beyond this. */
export const FAR_CITY = 12;

/** A city needs fertility above this. */
export const CITY_FERTILITY = 11;

/** Before this turn, a player with no city gets no city of a tribe while two settlers wander, and no barbarians. */
export const EARLY_TURN = 50;

/** No outcome is reached after more steps than this (the game's own chain ends sooner, see `outcome`). */
export const MAX_STEPS = 12;

/**
 * The outcome for `facts`.
 *
 * 1. Roll one of five. A computer player, or a person one time in three, with cities but none on this land mass, and
 *    alone there or more than 12 from a city, gets a tribe's city instead.
 * 2. A tribe's city: mercenaries with a city nearer than 4, or before turn 50 without a city while more than one
 *    settlers wander; a city where the square's fertility is above 11; nomads otherwise.
 * 3. Barbarians: mercenaries with a city nearer than 4, or before turn 50 without a city; a computer player trailing
 *    the humans' rank may get a tribe's city instead (when `rand() & 7` is below the level). Without barbarians in the
 *    game, mercenaries (M2a: the game always has them).
 * 4. An advance: gold on turn 0 or knowing Invention; a tribe's city when there's none to learn.
 * 5. Nomads, while no one knows Explosives and the player's wandering settlers are no more than its cities / 8;
 *    otherwise an advance, or gold once Explosives is known.
 *
 * The game's chain ends: a redirect to a tribe's city leads only to a city, mercenaries or nomads, and nomads lead to
 *  an advance only before Explosives is known, when there is always an advance left to learn. `MAX_STEPS` guards it
 *  here all the same, and gives gold if it's ever reached.
 */
export const outcome = (facts: HutFacts, rand: () => number): HutResult => {
  let next: Outcome = rolled[rand() % 5];

  if (
    (!facts.human || rand() % 3 === 0) &&
    facts.cities !== 0 &&
    facts.citiesOnLandMass === 0 &&
    (!facts.othersOnLandMass || facts.nearestCity > FAR_CITY)
  ) {
    next = 'tribe-city';
  }

  for (let step = 0; step < MAX_STEPS; step++) {
    switch (next) {
      case 'tribe-city':
        if (facts.nearestCity < NEAR_CITY) {
          next = 'mercenaries';

          continue;
        }

        if (
          facts.cities === 0 &&
          facts.turn < EARLY_TURN &&
          facts.homelessSettlers > 1
        ) {
          next = 'mercenaries';

          continue;
        }

        if (facts.fertility > CITY_FERTILITY) {
          return { outcome: 'tribe-city', advance: -1, steps: step + 1 };
        }

        next = 'nomads';

        continue;

      case 'barbarians':
        if (
          facts.nearestCity < NEAR_CITY ||
          (facts.cities === 0 && facts.turn < EARLY_TURN)
        ) {
          next = 'mercenaries';

          continue;
        }

        if (
          !facts.human &&
          facts.trailsTheHumans &&
          (rand() & 7) < facts.level
        ) {
          next = 'tribe-city';

          continue;
        }

        if (!facts.barbarians) {
          next = 'mercenaries';

          continue;
        }

        return { outcome: 'barbarians', advance: -1, steps: step + 1 };

      case 'advance':
        if (facts.turn === 0 || facts.knowsInvention) {
          next = 'gold';

          continue;
        }

        const advance = facts.pickAdvance(rand);

        if (advance >= 0) {
          return { outcome: 'advance', advance, steps: step + 1 };
        }

        next = 'tribe-city';

        continue;

      case 'nomads':
        if (facts.explosivesKnown) {
          next = 'gold';

          continue;
        }

        if (facts.ownHomelessSettlers <= facts.cities >> 3) {
          return { outcome: 'nomads', advance: -1, steps: step + 1 };
        }

        next = 'advance';

        continue;

      default:
        return { outcome: next, advance: -1, steps: step + 1 };
    }
  }

  return { outcome: 'gold', advance: -1, steps: MAX_STEPS };
};

export default outcome;
