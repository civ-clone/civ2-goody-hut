import {
  GoodyHutRegistry,
  instance as goodyHutRegistryInstance,
} from '@civ-clone/core-goody-hut/GoodyHutRegistry';
import { enterHut, onHut } from '@civ-clone/base-goody-hut/lib/entering';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Land from '@civ-clone/base-unit-type-land/Land';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

// Only a land unit of a civilization opens a hut (`unit_enter_hut`): barbarians, ships and aircraft pass over it.
export const getRules = (
  goodyHutRegistry: GoodyHutRegistry = goodyHutRegistryInstance
): Moved[] => [
  new Moved(
    'civ2-goody-hut:unit/moved/enter-hut',
    new Criterion((unit: Unit): boolean => !isBarbarian(unit.player())),
    new Criterion((unit: Unit): boolean => unit instanceof Land),
    new Criterion(onHut(goodyHutRegistry)),
    new Effect(enterHut(goodyHutRegistry))
  ),
];

export default getRules;
