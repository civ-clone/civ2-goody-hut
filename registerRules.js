"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.dependenciesOf = void 0;
const core_game_1 = require("@civ-clone/core-game");
const action_performed_1 = require("./Rules/GoodyHut/action-performed");
const discovered_1 = require("./Rules/GoodyHut/discovered");
const unit_1 = require("./Rules/GoodyHut/unit");
const moved_1 = require("./Rules/Unit/moved");
const dependenciesOf = (game) => ({
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
exports.dependenciesOf = dependenciesOf;
// Huts are placed by civ2-world (its `Distribution` and `Built` rules); these are what happens when one is opened.
const register = (game) => {
    const dependencies = (0, exports.dependenciesOf)(game);
    game.rules.register(...(0, action_performed_1.default)(game.engine), ...(0, discovered_1.default)(dependencies, game.goodyHuts, game.engine, game.rng), ...(0, unit_1.default)(dependencies, game.rng), ...(0, moved_1.default)(game.goodyHuts));
};
exports.register = register;
// The plugin loader imports each package for this side effect, as civ1-goody-hut's.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map