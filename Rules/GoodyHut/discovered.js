"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const GoodyHutRegistry_1 = require("@civ-clone/core-goody-hut/GoodyHutRegistry");
const entering_1 = require("@civ-clone/base-goody-hut/lib/entering");
const Discovered_1 = require("@civ-clone/core-goody-hut/Rules/Discovered");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const action_1 = require("../../lib/action");
const core_random_1 = require("@civ-clone/core-random");
// A hut opened: it goes, Civilization II's outcome is performed (`lib/outcome`), and the engine's listeners are told.
const getRules = (dependencies, goodyHutRegistry = GoodyHutRegistry_1.instance, engine = Engine_1.instance, randomNumberGenerator = core_random_1.instance) => [
    new Discovered_1.default('civ2-goody-hut:goody-hut/discovered/remove', new Effect_1.default((0, entering_1.removeHut)(goodyHutRegistry))),
    new Discovered_1.default('civ2-goody-hut:goody-hut/discovered/outcome', new Effect_1.default((goodyHut, unit) => goodyHut.action((0, action_1.default)(dependencies, goodyHut, unit, randomNumberGenerator)))),
    new Discovered_1.default('civ2-goody-hut:goody-hut/discovered/emit', new Effect_1.default((0, entering_1.emitHutDiscovered)(engine))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=discovered.js.map