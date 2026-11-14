import { Game, defaultGame } from '@civ-clone/core-game';
import Dependencies from './lib/Dependencies';
import goodyHutActionPerformed from './Rules/GoodyHut/action-performed';
import goodyHutDiscovered from './Rules/GoodyHut/discovered';
import goodyHutUnit from './Rules/GoodyHut/unit';
import unitMoved from './Rules/Unit/moved';

export const dependenciesOf = (game: Game): Dependencies => ({
  cityRegistry: game.cities,
  clientRegistry: game.clients,
  gameDifficultyRegistry: game.difficulty,
  landMassRegistry: game.landMasses,
  playerRegistry: game.players,
  playerResearchRegistry: game.playerResearch,
  playerTreasuryRegistry: game.playerTreasuries,
  ruleRegistry: game.rules,
  terrainFeatureRegistry: game.terrainFeatures,
  turn: game.turn,
  unitRegistry: game.units,
  year: game.year,
});

// Huts are placed by civ2-world (its `Distribution` and `Built` rules); these are what happens when one is opened.
export const register = (game: Game): void => {
  const dependencies = dependenciesOf(game);

  game.rules.register(
    ...goodyHutActionPerformed(game.engine),
    ...goodyHutDiscovered(dependencies, game.goodyHuts, game.engine, game.rng),
    ...goodyHutUnit(dependencies, game.rng),
    ...unitMoved(game.goodyHuts)
  );
};

// The plugin loader imports each package for this side effect, as civ1-goody-hut's.
register(defaultGame);

export default register;
