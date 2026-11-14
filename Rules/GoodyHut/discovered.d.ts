import { Engine } from '@civ-clone/core-engine/Engine';
import { GoodyHutRegistry } from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import Dependencies from '../../lib/Dependencies';
import Discovered from '@civ-clone/core-goody-hut/Rules/Discovered';
export declare const getRules: (
  dependencies: Dependencies,
  goodyHutRegistry?: GoodyHutRegistry,
  engine?: Engine,
  randomNumberGenerator?: () => number
) => Discovered[];
export default getRules;
