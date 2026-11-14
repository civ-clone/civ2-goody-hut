"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hutAction = void 0;
const GoodyHuts_1 = require("../GoodyHuts");
const Units_1 = require("@civ-clone/civ2-unit/Units");
const advanceIndex_1 = require("@civ-clone/civ2-science/lib/advanceIndex");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const facts_1 = require("./facts");
const rewards_1 = require("./rewards");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const outcome_1 = require("./outcome");
/**
 * The action a hut entered by `unit` performs: Civilization II's outcome (`outcome`), as the shared goody-hut
 *  actions. A tribe's city is a size 1 city with no improvements, at any date.
 */
const hutAction = (dependencies, goodyHut, unit, randomNumberGenerator) => {
    const rand = () => (0, pickResearch_1.cRand)(randomNumberGenerator), result = (0, outcome_1.default)((0, facts_1.hutFacts)(dependencies, goodyHut.tile(), unit), rand);
    switch (result.outcome) {
        case 'tribe-city':
            return new GoodyHuts_1.City(goodyHut, unit, dependencies.cityRegistry);
        case 'gold':
            return new GoodyHuts_1.Gold(goodyHut, unit, dependencies.playerTreasuryRegistry, (0, rewards_1.hutGold)(rand, (0, level_1.levelOf)(dependencies.gameDifficultyRegistry), dependencies.year.value()));
        case 'barbarians':
            return new GoodyHuts_1.Barbarians(goodyHut, unit, dependencies.ruleRegistry);
        case 'advance':
            return new GoodyHuts_1.Advance(goodyHut, unit, dependencies.playerResearchRegistry, randomNumberGenerator, (0, advanceIndex_1.advanceAt)(result.advance));
        case 'nomads':
            return new GoodyHuts_1.Nomads(goodyHut, unit, Units_1.Settlers, dependencies.ruleRegistry);
        case 'mercenaries':
        default:
            return new GoodyHuts_1.Unit(goodyHut, unit, randomNumberGenerator, dependencies.ruleRegistry);
    }
};
exports.hutAction = hutAction;
exports.default = exports.hutAction;
//# sourceMappingURL=action.js.map