import Advance from '@civ-clone/core-science/Advance';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Dependencies from './Dependencies';
import { HutFacts } from './outcome';
import { MercenaryKnowledge } from './rewards';
import Player from '@civ-clone/core-player/Player';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/** Civilization II's distance between two squares (`map_distance_diag`). */
export declare const distance: (from: Tile, to: Tile) => number;
/** How far the nearest city of anyone's is from `tile` (`city_find_nearest`), `Infinity` with none. */
export declare const nearestCity: (
  tile: Tile,
  cityRegistry: CityRegistry
) => number;
/** Whether anyone knows `AdvanceType` (the game's `advance_known_by`). */
export declare const knownByAnyone: (
  AdvanceType: typeof Advance,
  playerResearchRegistry: PlayerResearchRegistry
) => boolean;
/** What anyone knows that decides the mercenaries' type. */
export declare const mercenaryKnowledge: (
  playerResearchRegistry: PlayerResearchRegistry
) => MercenaryKnowledge;
/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank`
 *  rules. Barbarians have none.
 */
export declare const powerRanks: (
  dependencies: Dependencies
) => Map<Player, number>;
/**
 * Whether computer player `player` ranks below the lowest-ranked human. The game compares with the rank of the
 *  civilization whose number is that rank (`worst_human_rank` used as a civilization); here it is the rank itself.
 *  With no human, never.
 */
export declare const trailsTheHumans: (
  dependencies: Dependencies,
  player: Player
) => boolean;
/** The indices `player` could research next, as `civ_can_research_advance` answers. */
export declare const researchable: (
  dependencies: Dependencies,
  player: Player
) => Set<number>;
/** What a hut entered by `unit` on `tile` decides its outcome by. */
export declare const hutFacts: (
  dependencies: Dependencies,
  tile: Tile,
  unit: Unit
) => HutFacts;
export default hutFacts;
