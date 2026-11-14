import { Grassland, Ocean } from '@civ-clone/civ2-world/Terrains';
import { Settlers, Warrior } from '@civ-clone/civ2-unit/Units';
import { hutFacts, powerRanks, trailsTheHumans } from '../lib/facts';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Dependencies from '../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Loader from '@civ-clone/simple-world-generator/tests/lib/Loader';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Rank from '@civ-clone/core-power/Rules/Rank';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import Year from '@civ-clone/core-game-year/Year';
import { expect } from 'chai';
import registerRules from '@civ-clone/civ2-unit/registerRules';

// Two islands, columns 0–3 and 5–7 of a 9 by 9 world that wraps east to west, with Ocean in columns 4 and 8.
const setUp = async () => {
  const game = new Game(),
    world = await new World(
      new Loader(
        9,
        9,
        Array.from({ length: 81 }, (value, index) => [
          new (index % 9 === 4 || index % 9 === 8 ? Ocean : Grassland)(
            game.rules
          ),
        ]) as [Terrain][],
        game.terrainFeatures
      ),
      game.rules,
      game.landMasses
    ).build(),
    [human, computer, other] = [1, 2, 3].map(() => new Player(game.rules)),
    scores = new Map<Player, number>([
      [human, 20],
      [computer, 10],
      [other, 30],
    ]),
    dependencies: Dependencies = {
      cityRegistry: game.cities,
      clientRegistry: {
        getBy: (key: string, player: Player) => (player === human ? [{}] : []),
      } as unknown as ClientRegistry,
      gameDifficultyRegistry: game.difficulty,
      landMassRegistry: game.landMasses,
      playerRegistry: game.players,
      playerResearchRegistry: game.playerResearch,
      playerTreasuryRegistry: game.playerTreasuries,
      ruleRegistry: game.rules,
      terrainFeatureRegistry: game.terrainFeatures,
      turn: game.turn,
      unitRegistry: game.units,
      year: {} as Year,
    };

  [human, computer, other].forEach((player: Player): void => {
    game.players.register(player);
    game.playerResearch.register(
      new PlayerResearch(player, game.advances, game.rules)
    );
  });
  game.rules.register(
    new Rank(new Effect((player: Player): number => scores.get(player)!))
  );
  // civ2-unit's rules, for the units' roles.
  registerRules(game);

  const place = (UnitType: typeof Unit, player: Player, x: number) => {
    const unit = new UnitType(null, player, world.get(x, 4), game.rules);

    game.units.register(unit);

    return unit;
  };

  return { computer, dependencies, game, human, other, place, scores, world };
};

describe('hutFacts', function (): void {
  this.timeout(60000);

  it('ranks the players 7 down by their Rank rules, and finds a computer player below the worst human', async (): Promise<void> => {
    const { computer, dependencies, human, other, scores } = await setUp(),
      ranks = powerRanks(dependencies);

    expect([other, human, computer].map((player) => ranks.get(player))).eql([
      7, 6, 5,
    ]);
    expect(trailsTheHumans(dependencies, computer)).true;
    expect(trailsTheHumans(dependencies, other)).false;

    scores.set(computer, 25);

    expect(trailsTheHumans(dependencies, computer)).false;
  });

  it("counts wandering settlers, everyone's and the player's, and others on the hut's land mass", async (): Promise<void> => {
    const { computer, dependencies, human, place, world } = await setUp(),
      entering = place(Warrior, computer, 1);

    place(Settlers, computer, 2);
    place(Settlers, human, 6);

    let facts = hutFacts(dependencies, world.get(1, 4), entering);

    expect(facts.homelessSettlers).equal(2);
    expect(facts.ownHomelessSettlers).equal(1);
    // The human's Settlers are on the other island.
    expect(facts.othersOnLandMass).false;
    expect(facts.human).false;
    expect(facts.trailsTheHumans).true;
    expect(facts.nearestCity).equal(Infinity);
    expect(facts.fertility).within(8, 15);

    place(Warrior, human, 3);

    facts = hutFacts(dependencies, world.get(1, 4), entering);

    expect(facts.othersOnLandMass).true;
  });

  it("reads no fertility within a city's 45 squares, 4 away included, and the map's beyond them", async (): Promise<void> => {
    const { computer, dependencies, place } = await setUp(),
      game = new Game(),
      world = await new World(
        new Loader(
          20,
          20,
          Array.from({ length: 400 }, () => [new Grassland(game.rules)]) as [
            Terrain
          ][],
          game.terrainFeatures
        ),
        game.rules,
        game.landMasses
      ).build(),
      cityTile = world.get(10, 10),
      city = {
        destroyed: () => false,
        player: () => null,
        tile: () => cityTile,
      },
      onWorld = {
        ...dependencies,
        cityRegistry: { entries: () => [city] } as any,
        landMassRegistry: game.landMasses,
        terrainFeatureRegistry: game.terrainFeatures,
      },
      unit = place(Warrior, computer, 1),
      factsAt = (x: number, y: number) =>
        hutFacts(onWorld, world.get(x, y), unit);

    // Five rows down, half a square across: (1, 5) in Civ2's coordinates, 4 away and one of the 45.
    expect(factsAt(10, 15).nearestCity).equal(4);
    expect(factsAt(10, 15).fertility).equal(0);
    // Three squares along the row: (6, 0), also 4 away, but beyond the 45.
    expect(factsAt(13, 10).nearestCity).equal(4);
    expect(factsAt(13, 10).fertility).equal(15);
    // Within the 21.
    expect(factsAt(11, 10).fertility).equal(0);
  });

  it("finds a city's 45 squares across the east-west wrap", async (): Promise<void> => {
    const { computer, dependencies, place } = await setUp(),
      game = new Game(),
      world = await new World(
        new Loader(
          20,
          20,
          Array.from({ length: 400 }, () => [new Grassland(game.rules)]) as [
            Terrain
          ][],
          game.terrainFeatures
        ),
        game.rules,
        game.landMasses
      ).build(),
      // On the west edge.
      cityTile = world.get(0, 10),
      city = {
        destroyed: () => false,
        player: () => null,
        tile: () => cityTile,
      },
      onWorld = {
        ...dependencies,
        cityRegistry: { entries: () => [city] } as any,
        landMassRegistry: game.landMasses,
        terrainFeatureRegistry: game.terrainFeatures,
      },
      unit = place(Warrior, computer, 1),
      factsAt = (x: number, y: number) =>
        hutFacts(onWorld, world.get(x, y), unit);

    // The last square of the row, one square west across the wrap: (-2, 0), one of the 45.
    expect(factsAt(19, 10).fertility).equal(0);
    // The next row down, half a square west across the wrap: (-1, 1).
    expect(factsAt(19, 11).fertility).equal(0);
    // Four squares west across the wrap, (-8, 0), is beyond the 45.
    expect(factsAt(16, 10).fertility).equal(15);
  });
});
