import {
  ARCHERS,
  CHARIOT,
  CRUSADERS,
  DRAGOONS,
  ELEPHANT,
  FANATICS,
  HORSEMEN,
  KNIGHTS,
  LEGION,
  MUSKETEERS,
  MercenaryKnowledge,
  RIFLEMEN,
  hutAdvance,
  hutGold,
  mercenaryType,
} from '../lib/rewards';
import {
  Archer,
  Chariot,
  Crusader,
  Dragoon,
  Elephant,
  Fanatic,
  Horseman,
  Knight,
  Musketman,
  Rifleman,
  Swordman,
} from '@civ-clone/civ2-unit/Units';
import { expect } from 'chai';
import { unitTypes } from '@civ-clone/civ2-unit/lib/unitTable';

const rolls = (...values: number[]) => {
  const asked: number[] = [];

  return {
    asked,
    rand: (): number => {
      if (values.length === 0) {
        throw new Error('asked for one roll too many');
      }

      asked.push(values[0]);

      return values.shift()!;
    },
  };
};

const nothing: MercenaryKnowledge = {
  chivalry: false,
  polytheism: false,
  monotheism: false,
  leadership: false,
  conscription: false,
  guerrillaWarfare: false,
  gunpowder: false,
  ironWorking: false,
};

describe('hutGold', (): void => {
  it('is 50, or one time in three 25 or 100 by rand() % 10 − level + 2 against 5', (): void => {
    expect(hutGold(rolls(1).rand, 3, -2000)).equal(50);
    // 6 − 3 + 2 = 5: not below 5.
    expect(hutGold(rolls(3, 6).rand, 3, -2000)).equal(100);
    // 5 − 3 + 2 = 4.
    expect(hutGold(rolls(3, 5).rand, 3, -2000)).equal(25);
    expect(hutGold(rolls(0, 0).rand, 0, -2000)).equal(25);
    expect(hutGold(rolls(0, 3).rand, 0, -2000)).equal(100);
  });

  it('is doubled after 1000 AD', (): void => {
    expect(hutGold(rolls(1).rand, 3, 1000)).equal(50);
    expect(hutGold(rolls(1).rand, 3, 1010)).equal(100);
    expect(hutGold(rolls(3, 5).rand, 3, 1010)).equal(50);
  });
});

describe('hutAdvance', (): void => {
  it('takes the first researchable index from rand() % 100 up, wrapping round', (): void => {
    const researchable = (index: number): boolean =>
      [3, 40, 88].includes(index);

    expect(hutAdvance(rolls(140).rand, researchable)).equal(40);
    expect(hutAdvance(rolls(40).rand, researchable)).equal(40);
    expect(hutAdvance(rolls(41).rand, researchable)).equal(88);
    expect(hutAdvance(rolls(89).rand, researchable)).equal(3);
  });

  it('is -1 with nothing to learn, after one roll', (): void => {
    const { asked, rand } = rolls(7);

    expect(hutAdvance(rand, () => false)).equal(-1);
    expect(asked).eql([7]);
  });
});

describe('mercenaryType', (): void => {
  it("names civ2-unit's rows", (): void => {
    expect(
      [
        ARCHERS,
        LEGION,
        MUSKETEERS,
        FANATICS,
        RIFLEMEN,
        HORSEMEN,
        CHARIOT,
        ELEPHANT,
        CRUSADERS,
        KNIGHTS,
        DRAGOONS,
      ].map((row: number) => unitTypes[row])
    ).eql([
      Archer,
      Swordman,
      Musketman,
      Fanatic,
      Rifleman,
      Horseman,
      Chariot,
      Elephant,
      Crusader,
      Knight,
      Dragoon,
    ]);
  });

  it('early: Chariot one time in three, else Horsemen; Archers on foot; an even roll mounts them', (): void => {
    expect(mercenaryType(rolls(3, 0).rand, nothing)).equal(CHARIOT);
    expect(mercenaryType(rolls(4, 0).rand, nothing)).equal(HORSEMEN);
    expect(mercenaryType(rolls(4, 1).rand, nothing)).equal(ARCHERS);
  });

  it('Elephants on an odd roll once anyone knows Polytheism', (): void => {
    const polytheism = { ...nothing, polytheism: true };

    expect(mercenaryType(rolls(4, 1, 0).rand, polytheism)).equal(ELEPHANT);
    expect(mercenaryType(rolls(4, 2, 0).rand, polytheism)).equal(HORSEMEN);
  });

  it('Knights with Chivalry, without the early rolls; Crusaders, Dragoons, Riflemen override in turn', (): void => {
    const { asked, rand } = rolls(0);

    expect(mercenaryType(rand, { ...nothing, chivalry: true })).equal(KNIGHTS);
    expect(asked).length(1);
    expect(
      mercenaryType(rolls(0).rand, {
        ...nothing,
        chivalry: true,
        monotheism: true,
      })
    ).equal(CRUSADERS);
    expect(
      mercenaryType(rolls(0).rand, {
        ...nothing,
        chivalry: true,
        monotheism: true,
        leadership: true,
      })
    ).equal(DRAGOONS);
    expect(
      mercenaryType(rolls(0).rand, {
        ...nothing,
        chivalry: true,
        leadership: true,
        conscription: true,
      })
    ).equal(RIFLEMEN);
  });

  it('on foot: Legion with Iron Working, Musketeers with Gunpowder, Fanatics with Guerrilla Warfare', (): void => {
    const known = { ...nothing, chivalry: true };

    expect(mercenaryType(rolls(1).rand, { ...known, ironWorking: true })).equal(
      LEGION
    );
    expect(
      mercenaryType(rolls(1).rand, {
        ...known,
        ironWorking: true,
        gunpowder: true,
      })
    ).equal(MUSKETEERS);
    expect(
      mercenaryType(rolls(1).rand, {
        ...known,
        ironWorking: true,
        gunpowder: true,
        guerrillaWarfare: true,
      })
    ).equal(FANATICS);
    // Each lack wins over what's known, the last first: no Iron Working is Archers whatever else.
    expect(
      mercenaryType(rolls(1).rand, {
        ...known,
        gunpowder: true,
        guerrillaWarfare: true,
      })
    ).equal(ARCHERS);
  });
});
