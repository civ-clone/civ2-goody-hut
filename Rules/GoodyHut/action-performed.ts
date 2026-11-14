import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import ActionPerformed from '@civ-clone/core-goody-hut/Rules/ActionPerformed';
import Effect from '@civ-clone/core-rule/Effect';
import { emitHutActionPerformed } from '@civ-clone/base-goody-hut/lib/entering';

export const getRules = (
  engine: Engine = engineInstance
): ActionPerformed[] => [
  new ActionPerformed(
    'civ2-goody-hut:goody-hut/action-performed/emit',
    new Effect(emitHutActionPerformed(engine))
  ),
];

export default getRules;
