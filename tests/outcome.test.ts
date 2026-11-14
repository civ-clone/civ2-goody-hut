import outcome, { HutFacts, MAX_STEPS, Outcome } from '../lib/outcome';
import { expect } from 'chai';

// C's `rand()` as a script: each value in turn, and a failure if the chain asks for more.
const script = (...values: number[]) => {
  const asked: number[] = [];

  return {
    asked,
    rand: (): number => {
      if (values.length === 0) {
        throw new Error('asked for one roll too many');
      }

      const value = values.shift()!;

      asked.push(value);

      return value;
    },
  };
};

// A computer player with cities on this land mass, far from any city, mid-game: no redirect applies.
const facts = (overrides: Partial<HutFacts> = {}): HutFacts => ({
  human: false,
  cities: 3,
  citiesOnLandMass: 1,
  othersOnLandMass: false,
  nearestCity: 6,
  turn: 100,
  homelessSettlers: 0,
  ownHomelessSettlers: 0,
  fertility: 12,
  knowsInvention: false,
  explosivesKnown: false,
  trailsTheHumans: false,
  level: 3,
  barbarians: true,
  pickAdvance: () => 17,
  ...overrides,
});

const run = (hut: HutFacts, ...rolls: number[]): Outcome => {
  const { rand } = script(...rolls);

  return outcome(hut, rand).outcome;
};

describe('outcome', (): void => {
  it('rolls one of five with rand() % 5', (): void => {
    expect(run(facts(), 0)).equal('tribe-city');
    expect(run(facts(), 1)).equal('mercenaries');
    expect(run(facts(), 2)).equal('gold');
    expect(run(facts(), 3)).equal('barbarians');
    expect(run(facts(), 9)).equal('advance');
  });

  it('gives the advance the pick chose, asking it with the same rand', (): void => {
    const { asked, rand } = script(4, 55);

    expect(outcome(facts({ pickAdvance: (r) => r() % 100 }), rand)).eql({
      outcome: 'advance',
      advance: 55,
      steps: 1,
    });
    expect(asked).eql([4, 55]);
  });

  describe('a city of its own wanted', (): void => {
    const lonely = { citiesOnLandMass: 0 };

    it('gives a computer player with no city on this land mass a tribe city, whatever it rolled', (): void => {
      expect(run(facts(lonely), 2)).equal('tribe-city');
    });

    it('gives a person one one time in three', (): void => {
      expect(run(facts({ ...lonely, human: true }), 2, 3)).equal('tribe-city');
      expect(run(facts({ ...lonely, human: true }), 2, 4)).equal('gold');
    });

    it('not without any city, nor with one on this land mass', (): void => {
      expect(run(facts({ ...lonely, cities: 0, turn: 60 }), 2)).equal('gold');
      expect(run(facts(), 2)).equal('gold');
    });

    it('with another player here, only beyond 12 from a city', (): void => {
      expect(
        run(facts({ ...lonely, othersOnLandMass: true, nearestCity: 12 }), 2)
      ).equal('gold');
      expect(
        run(facts({ ...lonely, othersOnLandMass: true, nearestCity: 13 }), 2)
      ).equal('tribe-city');
    });
  });

  describe('a tribe city', (): void => {
    it('needs fertility above 11, or the tribe are nomads', (): void => {
      expect(run(facts({ fertility: 11 }), 0)).equal('nomads');
      expect(run(facts({ fertility: 12 }), 0)).equal('tribe-city');
    });

    it('is mercenaries with a city nearer than 4', (): void => {
      expect(run(facts({ nearestCity: 3 }), 0)).equal('mercenaries');
      expect(run(facts({ nearestCity: 4 }), 0)).equal('tribe-city');
    });

    it('is mercenaries before turn 50 for a player with no city while more than one settlers wander', (): void => {
      const early = { cities: 0, turn: 49, nearestCity: Infinity };

      expect(run(facts({ ...early, homelessSettlers: 2 }), 0)).equal(
        'mercenaries'
      );
      expect(run(facts({ ...early, homelessSettlers: 1 }), 0)).equal(
        'tribe-city'
      );
      expect(run(facts({ ...early, turn: 50, homelessSettlers: 2 }), 0)).equal(
        'tribe-city'
      );
    });
  });

  describe('barbarians', (): void => {
    it('are mercenaries with a city nearer than 4, or early for a player with no city', (): void => {
      expect(run(facts({ nearestCity: 3 }), 3)).equal('mercenaries');
      expect(run(facts({ cities: 0, turn: 49 }), 3)).equal('mercenaries');
      expect(run(facts({ cities: 0, turn: 50 }), 3)).equal('barbarians');
    });

    it('are mercenaries while the game has no barbarians', (): void => {
      expect(run(facts({ barbarians: false }), 3)).equal('mercenaries');
    });

    it('may be a tribe city for a computer player trailing the humans: rand() & 7 below the level', (): void => {
      const trailing = { trailsTheHumans: true, level: 3 };

      expect(run(facts(trailing), 3, 2)).equal('tribe-city');
      expect(run(facts(trailing), 3, 3)).equal('barbarians');
      expect(run(facts(trailing), 3, 8 + 2)).equal('tribe-city');
      // A person, or a leader, rolls nothing.
      expect(run(facts({ ...trailing, human: true }), 3, 0)).equal(
        'barbarians'
      );
      expect(run(facts({ level: 3 }), 3)).equal('barbarians');
    });
  });

  describe('an advance', (): void => {
    it('is gold on turn 0 or once the player knows Invention', (): void => {
      expect(run(facts({ turn: 0 }), 4)).equal('gold');
      expect(run(facts({ knowsInvention: true }), 4)).equal('gold');
    });

    it('is a tribe city when there is none to learn', (): void => {
      expect(run(facts({ pickAdvance: () => -1 }), 4)).equal('tribe-city');
      expect(run(facts({ pickAdvance: () => -1, fertility: 0 }), 4)).equal(
        'nomads'
      );
    });
  });

  describe('nomads', (): void => {
    it("join while the player's wandering settlers are no more than its cities / 8", (): void => {
      const site = { fertility: 0, cities: 16 };

      expect(run(facts({ ...site, ownHomelessSettlers: 2 }), 0)).equal(
        'nomads'
      );
      expect(run(facts({ ...site, ownHomelessSettlers: 3 }), 0)).equal(
        'advance'
      );
    });

    it('give gold once anyone knows Explosives', (): void => {
      expect(run(facts({ fertility: 0, explosivesKnown: true }), 0)).equal(
        'gold'
      );
    });
  });

  it('always ends, within its steps, whatever it knows and rolls', (): void => {
    const bools = [false, true];
    let cases = 0;

    for (const human of bools)
      for (const cities of [0, 1, 16])
        for (const citiesOnLandMass of [0, 1])
          for (const othersOnLandMass of bools)
            for (const nearestCity of [1, 5, 20])
              for (const turn of [0, 40, 80])
                for (const homelessSettlers of [0, 5])
                  for (const ownHomelessSettlers of [0, 5])
                    for (const fertility of [0, 15])
                      for (const knowsInvention of bools)
                        for (const explosivesKnown of bools)
                          for (const trailsTheHumans of bools)
                            for (const barbarians of bools)
                              for (const advance of [-1, 3])
                                for (const roll of [0, 1, 2, 3, 4]) {
                                  // With nothing left to learn, the player knows Explosives too: the
                                  //  game never meets the other case (below).
                                  if (advance === -1 && !explosivesKnown) {
                                    continue;
                                  }

                                  const result = outcome(
                                    {
                                      human,
                                      cities,
                                      citiesOnLandMass,
                                      othersOnLandMass,
                                      nearestCity,
                                      turn,
                                      homelessSettlers,
                                      ownHomelessSettlers,
                                      fertility,
                                      knowsInvention,
                                      explosivesKnown,
                                      trailsTheHumans,
                                      level: 5,
                                      barbarians,
                                      pickAdvance: () => advance,
                                    },
                                    () => roll
                                  );

                                  expect(result.steps).below(MAX_STEPS);
                                  expect(result.outcome).a('string');
                                  cases++;
                                }

    expect(cases).above(100000);
  });

  it('gives gold if the chain could never end: nothing to learn, Explosives unknown, no site, settlers wandering', (): void => {
    expect(
      outcome(
        facts({ fertility: 0, ownHomelessSettlers: 9, pickAdvance: () => -1 }),
        () => 0
      )
    ).eql({ outcome: 'gold', advance: -1, steps: MAX_STEPS });
  });
});
