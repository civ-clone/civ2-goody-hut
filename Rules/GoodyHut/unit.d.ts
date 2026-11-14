import Dependencies from '../../lib/Dependencies';
import UnitRule from '@civ-clone/base-goody-hut-unit/Rules/Unit';
export declare const getRules: (
  dependencies: Dependencies,
  randomNumberGenerator?: () => number
) => UnitRule[];
export default getRules;
