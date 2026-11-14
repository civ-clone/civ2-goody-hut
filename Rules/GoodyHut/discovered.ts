import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  GoodyHutRegistry,
  instance as goodyHutRegistryInstance,
} from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import {
  emitHutDiscovered,
  removeHut,
} from '@civ-clone/base-goody-hut/lib/entering';
import Dependencies from '../../lib/Dependencies';
import Discovered from '@civ-clone/core-goody-hut/Rules/Discovered';
import Effect from '@civ-clone/core-rule/Effect';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import Unit from '@civ-clone/core-unit/Unit';
import hutAction from '../../lib/action';
import { instance as rngInstance } from '@civ-clone/core-random';

// A hut opened: it goes, Civilization II's outcome is performed (`lib/outcome`), and the engine's listeners are told.
export const getRules = (
  dependencies: Dependencies,
  goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance,
  engine: Engine = engineInstance,
  randomNumberGenerator: () => number = rngInstance
): Discovered[] => [
  new Discovered(
    'civ2-goody-hut:goody-hut/discovered/remove',
    new Effect(removeHut(goodyHutRegistry))
  ),
  new Discovered(
    'civ2-goody-hut:goody-hut/discovered/outcome',
    new Effect((goodyHut: GoodyHut, unit: Unit): void =>
      goodyHut.action(
        hutAction(dependencies, goodyHut, unit, randomNumberGenerator)
      )
    )
  ),
  new Discovered(
    'civ2-goody-hut:goody-hut/discovered/emit',
    new Effect(emitHutDiscovered(engine))
  ),
];

export default getRules;
