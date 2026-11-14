import Dependencies from './Dependencies';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import GoodyHutAction from '@civ-clone/core-goody-hut/Action';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * The action a hut entered by `unit` performs: Civilization II's outcome (`outcome`), as the shared goody-hut
 *  actions. A tribe's city is a size 1 city with no improvements, at any date.
 */
export declare const hutAction: (
  dependencies: Dependencies,
  goodyHut: GoodyHut,
  unit: Unit,
  randomNumberGenerator: () => number
) => GoodyHutAction;
export default hutAction;
