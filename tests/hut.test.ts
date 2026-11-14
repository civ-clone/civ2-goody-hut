import {
  Advance,
  Barbarians,
  Gold,
  Nomads,
  Unit as Mercenaries,
} from '../GoodyHuts';
import { Desert, Grassland } from '@civ-clone/civ2-world/Terrains';
import {
  Horseman,
  Settlers,
  Trireme,
  Warrior,
} from '@civ-clone/civ2-unit/Units';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import ActionPerformed from '@civ-clone/core-goody-hut/Rules/ActionPerformed';
import BarbariansRule from '@civ-clone/base-goody-hut-barbarians/Rules/Barbarians';
import Created from '@civ-clone/core-unit/Rules/Created';
import Dependencies from '../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import GoldYield from '@civ-clone/base-city-yield-gold/Gold';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import GoodyHutAction from '@civ-clone/core-goody-hut/Action';
import Loader from '@civ-clone/simple-world-generator/tests/lib/Loader';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import Year from '@civ-clone/core-game-year/Year';
import actionPerformed from '../Rules/GoodyHut/action-performed';
import { advanceAt } from '@civ-clone/civ2-science/lib/advanceIndex';
import discovered from '../Rules/GoodyHut/discovered';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import unitRule from '../Rules/GoodyHut/unit';
import { unitTypes } from '@civ-clone/civ2-unit/lib/unitTable';

// `rand()` values as the [0, 1) numbers that give them (`cRand` floors × 32768).
const asRolls = (...values: number[]) => {
  const left = values.map((value: number) => (value + 0.5) / 32768);

  return (): number => {
    if (left.length === 0) {
      throw new Error('asked for one roll too many');
    }

    return left.shift()!;
  };
};

// A 9 by 9 island of `TerrainType` in a game of its own, one computer player with research and gold, a hut in the
//  middle, and the hut rules with `rolls` as their numbers.
const setUp = async (TerrainType: typeof Terrain, ...rolls: number[]) => {
  const game = new Game(),
    world = await new World(
      new Loader(
        9,
        9,
        Array.from({ length: 81 }, () => [new TerrainType(game.rules)]) as [
          Terrain
        ][],
        game.terrainFeatures
      ),
      game.rules,
      game.landMasses
    ).build(),
    player = new Player(game.rules),
    tile = world.get(4, 4),
    goodyHut = new GoodyHut(tile, game.rules),
    performed: GoodyHutAction[] = [],
    created: Unit[] = [],
    rng = asRolls(...rolls),
    dependencies: Dependencies = {
      cityRegistry: game.cities,
      clientRegistry: game.clients,
      gameDifficultyRegistry: game.difficulty,
      landMassRegistry: game.landMasses,
      playerRegistry: game.players,
      playerResearchRegistry: game.playerResearch,
      playerTreasuryRegistry: game.playerTreasuries,
      ruleRegistry: game.rules,
      terrainFeatureRegistry: game.terrainFeatures,
      turn: game.turn,
      unitRegistry: game.units,
      year: { value: () => -1000 } as unknown as Year,
    };

  game.players.register(player);
  game.playerResearch.register(
    new PlayerResearch(player, game.advances, game.rules)
  );
  game.playerTreasuries.register(
    new PlayerTreasury(player, GoldYield, game.cityBuilds, game.rules)
  );
  game.goodyHuts.register(goodyHut);
  game.rules.register(
    ...actionPerformed(game.engine),
    ...discovered(dependencies, game.goodyHuts, game.engine, rng),
    ...unitRule(dependencies, rng),
    ...moved(game.goodyHuts),
    new ActionPerformed(
      new Effect((hut: GoodyHut, action: GoodyHutAction): void => {
        performed.push(action);
      })
    ),
    new Created(
      new Effect((unit: Unit): void => {
        created.push(unit);
        game.units.register(unit);
      })
    )
  );

  // Advance the turn past 0, where an advance is gold.
  game.turn.increment();

  const enter = (UnitType: typeof Unit = Warrior, owner: Player = player) => {
    const unit = new UnitType(null, owner, tile, game.rules);

    game.rules.process(Moved, unit, null);

    return unit;
  };

  return {
    created,
    enter,
    game,
    goodyHut,
    performed,
    player,
    tile,
  };
};

describe('a hut opened', function (): void {
  this.timeout(20000);

  it('goes, once only, for a land unit of a civilization', async (): Promise<void> => {
    const { enter, game, goodyHut, performed } = await setUp(Grassland, 2, 1);

    expect(game.goodyHuts.entries()).include(goodyHut);

    enter(Trireme);

    expect(game.goodyHuts.entries(), 'a ship').include(goodyHut);
    expect(performed).length(0);

    const barbarians = new Player(game.rules);

    barbarians.setCivilization(new Barbarian());
    enter(Warrior, barbarians);

    expect(game.goodyHuts.entries(), 'the barbarians').include(goodyHut);
    expect(performed).length(0);

    enter();

    expect(game.goodyHuts.entries()).not.include(goodyHut);
    expect(performed).length(1);
  });

  it("gives gold: 50 on rand() % 3, into the player's treasury", async (): Promise<void> => {
    const { enter, game, performed, player } = await setUp(Grassland, 2, 1);

    enter();

    expect(performed[0]).instanceOf(Gold);
    expect((performed[0] as Gold).amount()).equal(50);
    expect(
      game.playerTreasuries.getByPlayerAndType(player, GoldYield).value()
    ).equal(50);
  });

  it('gives mercenaries: an early type, on the square, with no home city', async (): Promise<void> => {
    // Mercenaries; then Horsemen (4 % 3), mounted (0 & 1).
    const { created, enter, performed, player, tile } = await setUp(
      Grassland,
      1,
      4,
      0
    );

    enter();

    expect(performed[0]).instanceOf(Mercenaries);

    const [mercenaries] = created.slice(-1);

    expect(mercenaries).instanceOf(Horseman);
    expect(mercenaries.player()).equal(player);
    expect(mercenaries.tile()).equal(tile);
    expect(mercenaries.city()).equal(null);
  });

  it('gives mercenaries in place of barbarians while the game has none, and barbarians once it has', async (): Promise<void> => {
    // Before turn 50 a player with no city meets mercenaries whatever the game has.
    const early = await setUp(Grassland, 3, 4, 0);

    early.enter();

    expect(early.performed[0]).instanceOf(Mercenaries);

    const raised: GoodyHut[] = [],
      withBarbarians = await setUp(Grassland, 3, 4, 0);

    withBarbarians.game.rules.register(
      new BarbariansRule(
        new Effect((hut: GoodyHut): void => {
          raised.push(hut);
        })
      )
    );
    // Turn 50, so a player with no city may meet them.
    for (let turn = 1; turn < 50; turn++) {
      withBarbarians.game.turn.increment();
    }

    withBarbarians.enter();

    expect(withBarbarians.performed[0]).instanceOf(Barbarians);
    expect(raised).eql([withBarbarians.goodyHut]);

    const withoutLate = await setUp(Grassland, 3, 4, 0);

    for (let turn = 1; turn < 50; turn++) {
      withoutLate.game.turn.increment();
    }

    withoutLate.enter();

    expect(withoutLate.performed[0]).instanceOf(Mercenaries);
  });

  it('gives the advance at the first researchable index from rand() % 100', async (): Promise<void> => {
    // An advance; index 0 (Advanced Flight) isn't researchable at the start, the first one up from 0 is.
    const { enter, game, performed, player } = await setUp(Grassland, 4, 0);

    enter();

    expect(performed[0]).instanceOf(Advance);

    const chosen = (performed[0] as Advance).chosen()!;

    expect(game.playerResearch.getByPlayer(player).completed(chosen)).true;
    // Alphabet, index 1, has no prerequisites.
    expect(chosen).equal(advanceAt(1));
  });

  it('gives a tribe city only on a fertile square: on Desert, nomads', async (): Promise<void> => {
    const { created, enter, performed, player } = await setUp(Desert, 0);

    enter();

    expect(performed[0]).instanceOf(Nomads);
    expect(created.slice(-1)[0]).instanceOf(Settlers);
    expect(created.slice(-1)[0].player()).equal(player);
    expect(created.slice(-1)[0].city()).equal(null);
  });

  it("names civ2-unit's Settlers for nomads", (): void => {
    expect(unitTypes[0]).equal(Settlers);
  });
});
