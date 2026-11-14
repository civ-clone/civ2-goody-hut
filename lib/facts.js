"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hutFacts = exports.researchable = exports.trailsTheHumans = exports.powerRanks = exports.mercenaryKnowledge = exports.knownByAnyone = exports.nearestCity = exports.distance = void 0;
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const advanceIndex_1 = require("@civ-clone/civ2-science/lib/advanceIndex");
const Barbarians_1 = require("@civ-clone/base-goody-hut-barbarians/Rules/Barbarians");
const Roles_1 = require("@civ-clone/base-unit-role/Roles");
const startBalance_1 = require("@civ-clone/civ2-player/lib/startBalance");
const fertility_1 = require("@civ-clone/civ2-world/lib/fertility");
const rewards_1 = require("./rewards");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const rank_1 = require("@civ-clone/core-power/lib/rank");
const roleOf_1 = require("@civ-clone/base-unit-role/roleOf");
/** Civilization II's distance between two squares (`map_distance_diag`). */
const distance = (from, to) => (0, startBalance_1.civ2Distance)(from.x(), from.y(), to.x(), to.y(), from.map().width());
exports.distance = distance;
const standing = (cityRegistry) => cityRegistry.entries().filter((city) => !city.destroyed());
/** How far the nearest city of anyone's is from `tile` (`city_find_nearest`), `Infinity` with none. */
const nearestCity = (tile, cityRegistry) => standing(cityRegistry).reduce((nearest, city) => Math.min(nearest, (0, exports.distance)(tile, city.tile())), Infinity);
exports.nearestCity = nearestCity;
/** Whether anyone knows `AdvanceType` (the game's `advance_known_by`). */
const knownByAnyone = (AdvanceType, playerResearchRegistry) => playerResearchRegistry
    .entries()
    .some((research) => research.completed(AdvanceType));
exports.knownByAnyone = knownByAnyone;
/** What anyone knows that decides the mercenaries' type. */
const mercenaryKnowledge = (playerResearchRegistry) => {
    const known = (AdvanceType) => (0, exports.knownByAnyone)(AdvanceType, playerResearchRegistry);
    return {
        chivalry: known(Advances_1.Chivalry),
        polytheism: known(Advances_1.Polytheism),
        monotheism: known(Advances_1.Monotheism),
        leadership: known(Advances_1.Leadership),
        conscription: known(Advances_1.Conscription),
        guerrillaWarfare: known(Advances_1.GuerrillaWarfare),
        gunpowder: known(Advances_1.Gunpowder),
        ironWorking: known(Advances_1.IronWorking),
    };
};
exports.mercenaryKnowledge = mercenaryKnowledge;
/** Units of the settlers role with no home city, everyone's or `player`'s. */
const homelessSettlers = (dependencies, player = null) => dependencies.unitRegistry
    .entries()
    .filter((unit) => !unit.destroyed() &&
    (player === null || unit.player() === player) &&
    unit.city() === null &&
    (0, roleOf_1.roleOf)(unit.constructor, dependencies.ruleRegistry) ===
        Roles_1.SettleRole).length;
/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank`
 *  rules. Barbarians have none.
 */
const powerRanks = (dependencies) => new Map((0, rank_1.rankings)(dependencies.playerRegistry
    .entries()
    .filter((player) => !(0, isBarbarian_1.default)(player)), dependencies.ruleRegistry).map((player, index) => [
    player,
    7 - index,
]));
exports.powerRanks = powerRanks;
/**
 * Whether computer player `player` ranks below the lowest-ranked human. The game compares with the rank of the
 *  civilization whose number is that rank (`worst_human_rank` used as a civilization); here it is the rank itself.
 *  With no human, never.
 */
const trailsTheHumans = (dependencies, player) => {
    var _a;
    const ranks = (0, exports.powerRanks)(dependencies), humans = [...ranks.keys()].filter((other) => (0, isHuman_1.isHuman)(other, dependencies.clientRegistry));
    if (humans.length === 0) {
        return false;
    }
    const worst = Math.min(...humans.map((human) => ranks.get(human)));
    return ((_a = ranks.get(player)) !== null && _a !== void 0 ? _a : 0) < worst;
};
exports.trailsTheHumans = trailsTheHumans;
/** The indices `player` could research next, as `civ_can_research_advance` answers. */
const researchable = (dependencies, player) => {
    const known = (0, advanceIndex_1.knownIndices)(dependencies.playerResearchRegistry.getByPlayer(player).complete());
    return new Set((0, advanceIndex_1.researchCandidates)((index) => known.has(index)));
};
exports.researchable = researchable;
/** What a hut entered by `unit` on `tile` decides its outcome by. */
const hutFacts = (dependencies, tile, unit) => {
    const player = unit.player(), cities = standing(dependencies.cityRegistry), own = cities.filter((city) => city.player() === player), landMass = dependencies.landMassRegistry.getByTile(tile), onLandMass = (at) => landMass !== null && landMass.hasTile(at), nearest = (0, exports.nearestCity)(tile, dependencies.cityRegistry), human = (0, isHuman_1.isHuman)(player, dependencies.clientRegistry), canResearch = (0, exports.researchable)(dependencies, player);
    return {
        human,
        cities: own.length,
        citiesOnLandMass: own.filter((city) => onLandMass(city.tile())).length,
        othersOnLandMass: cities.some((city) => city.player() !== player && onLandMass(city.tile())) ||
            dependencies.unitRegistry
                .entries()
                .some((other) => other.player() !== player &&
                !(0, isBarbarian_1.default)(other.player()) &&
                onLandMass(other.tile())),
        nearestCity: nearest,
        turn: dependencies.turn.value(),
        homelessSettlers: homelessSettlers(dependencies),
        ownHomelessSettlers: homelessSettlers(dependencies, player),
        // Within a city's radius the game reads the city's owner, and it lowers fertility around a city: both below 12.
        //  The chain asks only with no city nearer than 4, beyond both, so the map's fertility is enough.
        fertility: (0, fertility_1.fertility)(tile, dependencies.terrainFeatureRegistry),
        knowsInvention: dependencies.playerResearchRegistry
            .getByPlayer(player)
            .completed(Advances_1.Invention),
        explosivesKnown: (0, exports.knownByAnyone)(Advances_1.Explosives, dependencies.playerResearchRegistry),
        trailsTheHumans: !human && (0, exports.trailsTheHumans)(dependencies, player),
        level: (0, level_1.levelOf)(dependencies.gameDifficultyRegistry),
        barbarians: dependencies.ruleRegistry.get(Barbarians_1.default).length > 0,
        pickAdvance: (rand) => (0, rewards_1.hutAdvance)(rand, (index) => canResearch.has(index)),
    };
};
exports.hutFacts = hutFacts;
exports.default = exports.hutFacts;
//# sourceMappingURL=facts.js.map