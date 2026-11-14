import { mercenaryKnowledge } from '../../lib/facts';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRule from '@civ-clone/base-goody-hut-unit/Rules/Unit';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { mercenaryType } from '../../lib/rewards';
import { instance as rngInstance } from '@civ-clone/core-random';
import { unitTypes } from '@civ-clone/civ2-unit/lib/unitTable';

// The mercenaries a hut gives (`hut_mercenaries`): one unit of the type `mercenaryType` picks, on the entering unit's
//  square, with no home city.
export const getRules = (
  dependencies: Dependencies,
  randomNumberGenerator: () => number = rngInstance
): UnitRule[] => [
  new UnitRule(
    'civ2-goody-hut:goody-hut/unit/mercenaries',
    new Effect((goodyHut: GoodyHut, unit: Unit): Unit => {
      const UnitType =
        unitTypes[
          mercenaryType(
            (): number => cRand(randomNumberGenerator),
            mercenaryKnowledge(dependencies.playerResearchRegistry)
          )
        ];

      return new UnitType(
        null,
        unit.player(),
        unit.tile(),
        dependencies.ruleRegistry
      );
    })
  ),
];

export default getRules;
