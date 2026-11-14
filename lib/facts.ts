import {
  Chivalry,
  Conscription,
  Explosives,
  GuerrillaWarfare,
  Gunpowder,
  Invention,
  IronWorking,
  Leadership,
  Monotheism,
  Polytheism,
} from '@civ-clone/civ2-science/Advances';
import {
  knownIndices,
  researchCandidates,
} from '@civ-clone/civ2-science/lib/advanceIndex';
import Advance from '@civ-clone/core-science/Advance';
import BarbariansRule from '@civ-clone/base-goody-hut-barbarians/Rules/Barbarians';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Dependencies from './Dependencies';
import { HutFacts } from './outcome';
import { MercenaryKnowledge } from './rewards';
import Player from '@civ-clone/core-player/Player';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import { SettleRole } from '@civ-clone/base-unit-role/Roles';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { civ2Distance } from '@civ-clone/civ2-player/lib/startBalance';
import { fertility } from '@civ-clone/civ2-world/lib/fertility';
import { hutAdvance } from './rewards';
import { inCityArea } from './cityArea';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { rankings } from '@civ-clone/core-power/lib/rank';
import { roleOf } from '@civ-clone/base-unit-role/roleOf';

/** Civilization II's distance between two squares (`map_distance_diag`). */
export const distance = (from: Tile, to: Tile): number =>
  civ2Distance(from.x(), from.y(), to.x(), to.y(), from.map().width());

const standing = (cityRegistry: CityRegistry): City[] =>
  cityRegistry.entries().filter((city: City): boolean => !city.destroyed());

/** How far the nearest city of anyone's is from `tile` (`city_find_nearest`), `Infinity` with none. */
export const nearestCity = (tile: Tile, cityRegistry: CityRegistry): number =>
  standing(cityRegistry).reduce(
    (nearest: number, city: City): number =>
      Math.min(nearest, distance(tile, city.tile())),
    Infinity
  );

/** Whether anyone knows `AdvanceType` (the game's `advance_known_by`). */
export const knownByAnyone = (
  AdvanceType: typeof Advance,
  playerResearchRegistry: PlayerResearchRegistry
): boolean =>
  playerResearchRegistry
    .entries()
    .some((research) => research.completed(AdvanceType));

/** What anyone knows that decides the mercenaries' type. */
export const mercenaryKnowledge = (
  playerResearchRegistry: PlayerResearchRegistry
): MercenaryKnowledge => {
  const known = (AdvanceType: typeof Advance): boolean =>
    knownByAnyone(AdvanceType, playerResearchRegistry);

  return {
    chivalry: known(Chivalry),
    polytheism: known(Polytheism),
    monotheism: known(Monotheism),
    leadership: known(Leadership),
    conscription: known(Conscription),
    guerrillaWarfare: known(GuerrillaWarfare),
    gunpowder: known(Gunpowder),
    ironWorking: known(IronWorking),
  };
};

/** Units of the settlers role with no home city, everyone's or `player`'s. */
const homelessSettlers = (
  dependencies: Dependencies,
  player: Player | null = null
): number =>
  dependencies.unitRegistry
    .entries()
    .filter(
      (unit: Unit): boolean =>
        !unit.destroyed() &&
        (player === null || unit.player() === player) &&
        unit.city() === null &&
        roleOf(unit.constructor as typeof Unit, dependencies.ruleRegistry) ===
          SettleRole
    ).length;

/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank`
 *  rules. Barbarians have none.
 */
export const powerRanks = (dependencies: Dependencies): Map<Player, number> =>
  new Map(
    rankings(
      dependencies.playerRegistry
        .entries()
        .filter((player: Player): boolean => !isBarbarian(player)),
      dependencies.ruleRegistry
    ).map((player: Player, index: number): [Player, number] => [
      player,
      7 - index,
    ])
  );

/**
 * Whether computer player `player` ranks below the lowest-ranked human. The game compares with the rank of the
 *  civilization whose number is that rank (`worst_human_rank` used as a civilization); here it is the rank itself.
 *  With no human, never.
 */
export const trailsTheHumans = (
  dependencies: Dependencies,
  player: Player
): boolean => {
  const ranks = powerRanks(dependencies),
    humans = [...ranks.keys()].filter((other: Player): boolean =>
      isHuman(other, dependencies.clientRegistry)
    );

  if (humans.length === 0) {
    return false;
  }

  const worst = Math.min(...humans.map((human: Player) => ranks.get(human)!));

  return (ranks.get(player) ?? 0) < worst;
};

/** The indices `player` could research next, as `civ_can_research_advance` answers. */
export const researchable = (
  dependencies: Dependencies,
  player: Player
): Set<number> => {
  const known = knownIndices(
    dependencies.playerResearchRegistry.getByPlayer(player).complete()
  );

  return new Set(researchCandidates((index: number) => known.has(index)));
};

/** What a hut entered by `unit` on `tile` decides its outcome by. */
export const hutFacts = (
  dependencies: Dependencies,
  tile: Tile,
  unit: Unit
): HutFacts => {
  const player = unit.player(),
    cities = standing(dependencies.cityRegistry),
    own = cities.filter((city: City): boolean => city.player() === player),
    landMass = dependencies.landMassRegistry.getByTile(tile),
    onLandMass = (at: Tile): boolean =>
      landMass !== null && landMass.hasTile(at),
    nearest = nearestCity(tile, dependencies.cityRegistry),
    human = isHuman(player, dependencies.clientRegistry),
    canResearch = researchable(dependencies, player);

  return {
    human,
    cities: own.length,
    citiesOnLandMass: own.filter((city: City): boolean =>
      onLandMass(city.tile())
    ).length,
    othersOnLandMass:
      cities.some(
        (city: City): boolean =>
          city.player() !== player && onLandMass(city.tile())
      ) ||
      dependencies.unitRegistry
        .entries()
        .some(
          (other: Unit): boolean =>
            other.player() !== player &&
            !isBarbarian(other.player()) &&
            onLandMass(other.tile())
        ),
    nearestCity: nearest,
    turn: dependencies.turn.value(),
    homelessSettlers: homelessSettlers(dependencies),
    ownHomelessSettlers: homelessSettlers(dependencies, player),
    // Within a city's 21 squares the game reads the city's owner, and over its 45 squares it lowers fertility below 8
    //  (`city_refresh_area_tiles`): either way no tribe's city. The 45 reach civ2 distance 4, so a hut 4 from a city can
    //  be inside them.
    fertility: cities.some((city: City): boolean => inCityArea(tile, city))
      ? 0
      : fertility(tile, dependencies.terrainFeatureRegistry),
    knowsInvention: dependencies.playerResearchRegistry
      .getByPlayer(player)
      .completed(Invention),
    explosivesKnown: knownByAnyone(
      Explosives,
      dependencies.playerResearchRegistry
    ),
    trailsTheHumans: !human && trailsTheHumans(dependencies, player),
    level: levelOf(dependencies.gameDifficultyRegistry),
    barbarians: dependencies.ruleRegistry.get(BarbariansRule).length > 0,
    pickAdvance: (rand: () => number): number =>
      hutAdvance(rand, (index: number): boolean => canResearch.has(index)),
  };
};

export default hutFacts;
