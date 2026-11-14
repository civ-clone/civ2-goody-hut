"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const GoodyHutRegistry_1 = require("@civ-clone/core-goody-hut/GoodyHutRegistry");
const entering_1 = require("@civ-clone/base-goody-hut/lib/entering");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Land_1 = require("@civ-clone/base-unit-type-land/Land");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
// Only a land unit of a civilization opens a hut (`unit_enter_hut`): barbarians, ships and aircraft pass over it.
const getRules = (goodyHutRegistry = GoodyHutRegistry_1.instance) => [
    new Moved_1.default('civ2-goody-hut:unit/moved/enter-hut', new Criterion_1.default((unit) => !(0, isBarbarian_1.default)(unit.player())), new Criterion_1.default((unit) => unit instanceof Land_1.default), new Criterion_1.default((0, entering_1.onHut)(goodyHutRegistry)), new Effect_1.default((0, entering_1.enterHut)(goodyHutRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map