"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const facts_1 = require("../../lib/facts");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Unit_1 = require("@civ-clone/base-goody-hut-unit/Rules/Unit");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const rewards_1 = require("../../lib/rewards");
const core_random_1 = require("@civ-clone/core-random");
const unitTable_1 = require("@civ-clone/civ2-unit/lib/unitTable");
// The mercenaries a hut gives (`hut_mercenaries`): one unit of the type `mercenaryType` picks, on the entering unit's
//  square, with no home city.
const getRules = (dependencies, randomNumberGenerator = core_random_1.instance) => [
    new Unit_1.default('civ2-goody-hut:goody-hut/unit/mercenaries', new Effect_1.default((goodyHut, unit) => {
        const UnitType = unitTable_1.unitTypes[(0, rewards_1.mercenaryType)(() => (0, pickResearch_1.cRand)(randomNumberGenerator), (0, facts_1.mercenaryKnowledge)(dependencies.playerResearchRegistry))];
        return new UnitType(null, unit.player(), unit.tile(), dependencies.ruleRegistry);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=unit.js.map