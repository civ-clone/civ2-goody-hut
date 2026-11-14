"use strict";
// What each of a hut's outcomes gives, as Civilization II works it out (OpenCiv2 `src/game/retvals.cpp`, the parts of
//  `unit_enter_hut`, richardpenman/civ2@49f26ec). `rand` is C's `rand()` (0 to 32767).
Object.defineProperty(exports, "__esModule", { value: true });
exports.mercenaryType = exports.DRAGOONS = exports.KNIGHTS = exports.CRUSADERS = exports.ELEPHANT = exports.CHARIOT = exports.HORSEMEN = exports.RIFLEMEN = exports.FANATICS = exports.MUSKETEERS = exports.LEGION = exports.ARCHERS = exports.hutGold = exports.GOLD_DOUBLED_AFTER = exports.hutAdvance = void 0;
/**
 * The advance a hut gives, by @CIVILIZE index, or -1 for none (`unit_enter_hut`'s fourth case): from a random index
 *  below 100, the first one up, wrapping round, that the player could research. `researchable` answers for an index.
 */
const hutAdvance = (rand, researchable) => {
    let index = rand() % 100;
    for (let attempt = 0; attempt < 999; attempt++) {
        if (researchable(index)) {
            return index;
        }
        index = (index + 1) % 100;
    }
    return -1;
};
exports.hutAdvance = hutAdvance;
/** Gold is doubled after this year. */
exports.GOLD_DOUBLED_AFTER = 1000;
/**
 * How much gold a hut holds (`hut_gold`): 50; one time in three, 25 or 100 instead, 25 when `rand() % 10 − level + 2`
 *  is below 5; doubled after 1000 AD.
 */
const hutGold = (rand, level, year) => {
    let gold = 50;
    if (rand() % 3 === 0) {
        gold = (rand() % 10) - level + 2 < 5 ? 25 : 100;
    }
    return year > exports.GOLD_DOUBLED_AFTER ? gold * 2 : gold;
};
exports.hutGold = hutGold;
/** The @UNITS rows mercenaries can be. */
exports.ARCHERS = 4, exports.LEGION = 5, exports.MUSKETEERS = 7, exports.FANATICS = 8, exports.RIFLEMEN = 11, exports.HORSEMEN = 15, exports.CHARIOT = 16, exports.ELEPHANT = 17, exports.CRUSADERS = 18, exports.KNIGHTS = 19, exports.DRAGOONS = 20;
/**
 * The mercenaries' @UNITS row (`hut_mercenaries`), from what anyone in the game knows. A mounted type: Knights with
 *  Chivalry, otherwise Chariot one time in three or Horsemen, or on a coin flip Elephants with Polytheism; Crusaders
 *  with Monotheism, Dragoons with Leadership, Riflemen with Conscription, each overriding the last. A foot type:
 *  Fanatics with Guerrilla Warfare, else Musketeers, Legion without Gunpowder, Archers without Iron Working. A coin flip
 *  picks the mounted type on an even roll.
 */
const mercenaryType = (rand, known) => {
    let mounted = exports.KNIGHTS;
    if (!known.chivalry) {
        mounted = rand() % 3 === 0 ? exports.CHARIOT : exports.HORSEMEN;
        if (known.polytheism && (rand() & 1) !== 0) {
            mounted = exports.ELEPHANT;
        }
    }
    if (known.monotheism) {
        mounted = exports.CRUSADERS;
    }
    if (known.leadership) {
        mounted = exports.DRAGOONS;
    }
    if (known.conscription) {
        mounted = exports.RIFLEMEN;
    }
    let foot = exports.FANATICS;
    if (!known.guerrillaWarfare) {
        foot = exports.MUSKETEERS;
    }
    if (!known.gunpowder) {
        foot = exports.LEGION;
    }
    if (!known.ironWorking) {
        foot = exports.ARCHERS;
    }
    return (rand() & 1) === 0 ? mounted : foot;
};
exports.mercenaryType = mercenaryType;
//# sourceMappingURL=rewards.js.map