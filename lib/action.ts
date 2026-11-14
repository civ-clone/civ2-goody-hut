import {
  Advance,
  Barbarians,
  City,
  Gold,
  Nomads,
  Unit as Mercenaries,
} from '../GoodyHuts';
import Dependencies from './Dependencies';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import GoodyHutAction from '@civ-clone/core-goody-hut/Action';
import { Settlers } from '@civ-clone/civ2-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';
import { advanceAt } from '@civ-clone/civ2-science/lib/advanceIndex';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { hutFacts } from './facts';
import { hutGold } from './rewards';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import outcome from './outcome';

/**
 * The action a hut entered by `unit` performs: Civilization II's outcome (`outcome`), as the shared goody-hut
 *  actions. A tribe's city is a size 1 city with no improvements, at any date.
 */
export const hutAction = (
  dependencies: Dependencies,
  goodyHut: GoodyHut,
  unit: Unit,
  randomNumberGenerator: () => number
): GoodyHutAction => {
  const rand = (): number => cRand(randomNumberGenerator),
    result = outcome(hutFacts(dependencies, goodyHut.tile(), unit), rand);

  switch (result.outcome) {
    case 'tribe-city':
      return new City(goodyHut, unit, dependencies.cityRegistry);

    case 'gold':
      return new Gold(
        goodyHut,
        unit,
        dependencies.playerTreasuryRegistry,
        hutGold(
          rand,
          levelOf(dependencies.gameDifficultyRegistry),
          dependencies.year.value()
        )
      );

    case 'barbarians':
      return new Barbarians(goodyHut, unit, dependencies.ruleRegistry);

    case 'advance':
      return new Advance(
        goodyHut,
        unit,
        dependencies.playerResearchRegistry,
        randomNumberGenerator,
        advanceAt(result.advance)
      );

    case 'nomads':
      return new Nomads(goodyHut, unit, Settlers, dependencies.ruleRegistry);

    case 'mercenaries':
    default:
      return new Mercenaries(
        goodyHut,
        unit,
        randomNumberGenerator,
        dependencies.ruleRegistry
      );
  }
};

export default hutAction;
