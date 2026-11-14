"use strict";
// Which of its outcomes a hut gives, as Civilization II decides it (OpenCiv2 `src/game/retvals.cpp` `unit_enter_hut`,
//  richardpenman/civ2@49f26ec): one roll of five, then a chain of redirects. Pure: what the game knows comes in as
//  `HutFacts`, and `rand` is C's `rand()` (0 to 32767), asked in the game's order.
Object.defineProperty(exports, "__esModule", { value: true });
exports.outcome = exports.MAX_STEPS = exports.EARLY_TURN = exports.CITY_FERTILITY = exports.FAR_CITY = exports.NEAR_CITY = exports.rolled = void 0;
/** The five a roll can give (`rand() % 5`), and the sixth only a redirect reaches. */
exports.rolled = [
    'tribe-city',
    'mercenaries',
    'gold',
    'barbarians',
    'advance',
];
/** The nearest city must be at least this far for a tribe's city or barbarians: nearer, mercenaries come instead. */
exports.NEAR_CITY = 4;
/** With no city of its own on the land mass, a player gets a city there when the nearest city is beyond this. */
exports.FAR_CITY = 12;
/** A city needs fertility above this. */
exports.CITY_FERTILITY = 11;
/** Before this turn, a player with no city gets no city of a tribe while two settlers wander, and no barbarians. */
exports.EARLY_TURN = 50;
/** No outcome is reached after more steps than this (the game's own chain ends sooner, see `outcome`). */
exports.MAX_STEPS = 12;
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
const outcome = (facts, rand) => {
    let next = exports.rolled[rand() % 5];
    if ((!facts.human || rand() % 3 === 0) &&
        facts.cities !== 0 &&
        facts.citiesOnLandMass === 0 &&
        (!facts.othersOnLandMass || facts.nearestCity > exports.FAR_CITY)) {
        next = 'tribe-city';
    }
    for (let step = 0; step < exports.MAX_STEPS; step++) {
        switch (next) {
            case 'tribe-city':
                if (facts.nearestCity < exports.NEAR_CITY) {
                    next = 'mercenaries';
                    continue;
                }
                if (facts.cities === 0 &&
                    facts.turn < exports.EARLY_TURN &&
                    facts.homelessSettlers > 1) {
                    next = 'mercenaries';
                    continue;
                }
                if (facts.fertility > exports.CITY_FERTILITY) {
                    return { outcome: 'tribe-city', advance: -1, steps: step + 1 };
                }
                next = 'nomads';
                continue;
            case 'barbarians':
                if (facts.nearestCity < exports.NEAR_CITY ||
                    (facts.cities === 0 && facts.turn < exports.EARLY_TURN)) {
                    next = 'mercenaries';
                    continue;
                }
                if (!facts.human &&
                    facts.trailsTheHumans &&
                    (rand() & 7) < facts.level) {
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
    return { outcome: 'gold', advance: -1, steps: exports.MAX_STEPS };
};
exports.outcome = outcome;
exports.default = exports.outcome;
//# sourceMappingURL=outcome.js.map