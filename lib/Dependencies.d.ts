import CityRegistry from '@civ-clone/core-city/CityRegistry';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TerrainFeatureRegistry from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Year from '@civ-clone/core-game-year/Year';
/** The game's registries a hut reads. */
export interface Dependencies {
  cityRegistry: CityRegistry;
  clientRegistry: ClientRegistry;
  gameDifficultyRegistry: GameDifficultyRegistry;
  landMassRegistry: LandMassRegistry;
  playerRegistry: PlayerRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  playerTreasuryRegistry: PlayerTreasuryRegistry;
  ruleRegistry: RuleRegistry;
  terrainFeatureRegistry: TerrainFeatureRegistry;
  turn: Turn;
  unitRegistry: UnitRegistry;
  year: Year;
}
export default Dependencies;
