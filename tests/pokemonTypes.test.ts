import { calculateCombinedDefensiveEffectivenesses, calculateMoveEffectiveness, getDefensiveEffectivenesses } from '../src/pokemonTypes';

describe('getDefensiveEffectiveness', () => {
  test('gen 6 flying', () => {
    expect(getDefensiveEffectivenesses('flying', 6)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'bug', 'grass'],
      x0: ['ground'],
      x2: ['rock', 'electric', 'ice'],
      x4: [],
    });
  });

  test('gen 5 steel', () => {
    expect(getDefensiveEffectivenesses('steel', 5)).toStrictEqual({
      fourth: [],
      half: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy', 'ghost', 'dark'],
      x0: ['poison'],
      x2: ['fighting', 'ground', 'fire'],
      x4: [],
    });
  });

  test('gen 6 steel', () => {
    expect(getDefensiveEffectivenesses('steel', 6)).toStrictEqual({
      fourth: [],
      half: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
      x0: ['poison'],
      x2: ['fighting', 'ground', 'fire'],
      x4: [],
    });
  });

  test('gen 1 poison', () => {
    expect(getDefensiveEffectivenesses('poison', 1)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'poison', 'grass', 'fairy'],
      x0: [],
      x2: ['ground', 'psychic', 'bug'],
      x4: [],
    });
  });

  test('gen 2 poison', () => {
    expect(getDefensiveEffectivenesses('poison', 2)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'poison', 'bug', 'grass', 'fairy'],
      x0: [],
      x2: ['ground', 'psychic'],
      x4: [],
    });
  });

  test('gen 2 bug', () => {
    expect(getDefensiveEffectivenesses('bug', 2)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'ground', 'grass'],
      x0: [],
      x2: ['flying', 'rock', 'fire'],
      x4: [],
    });
  });

  test('gen 1 bug', () => {
    expect(getDefensiveEffectivenesses('bug', 1)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'ground', 'grass'],
      x0: [],
      x2: ['flying', 'rock', 'fire', 'poison'],
      x4: [],
    });
  });

  test('gen 1 psychic', () => {
    expect(getDefensiveEffectivenesses('psychic', 1)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'psychic'],
      x0: ['ghost'],
      x2: ['bug', 'dark'],
      x4: [],
    });
  });

  test('gen 2 psychic', () => {
    expect(getDefensiveEffectivenesses('psychic', 2)).toStrictEqual({
      fourth: [],
      half: ['fighting', 'psychic'],
      x0: [],
      x2: ['bug', 'ghost', 'dark'],
      x4: [],
    });
  });

  test('gen 1 fire', () => {
    expect(getDefensiveEffectivenesses('fire', 1)).toStrictEqual({
      fourth: [],
      half: ['bug', 'steel', 'fire', 'grass', 'fairy'],
      x0: [],
      x2: ['ground', 'rock', 'water'],
      x4: [],
    });
  });

  test('gen 2 fire', () => {
    expect(getDefensiveEffectivenesses('fire', 2)).toStrictEqual({
      fourth: [],
      half: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'],
      x0: [],
      x2: ['ground', 'rock', 'water'],
      x4: [],
    });
  });
});

describe('calculateCombinedDefensiveEffectivenesses', () => {
  test('gen 6 water/flying', () => {
    expect(calculateCombinedDefensiveEffectivenesses(6, 'water', 'flying')).toStrictEqual({
      fourth: [],
      half: ['fighting', 'bug', 'steel', 'fire', 'water'],
      x0: ['ground'],
      x2: ['rock'],
      x4: ['electric'],
    });
  });

  test('gen 6 dark/ghost', () => {
    expect(calculateCombinedDefensiveEffectivenesses(6, 'dark', 'ghost')).toStrictEqual({
      fourth: [],
      half: ['poison'],
      x0: ['normal', 'fighting', 'psychic'],
      x2: ['fairy'],
      x4: [],
    });
  });
  
  test('gen 6 flying/ghost', () => {
    expect(calculateCombinedDefensiveEffectivenesses(6, 'flying', 'ghost')).toStrictEqual({
      fourth: ['bug'],
      half: ['poison', 'grass'],
      x0: ['normal', 'fighting', 'ground'],
      x2: ['rock', 'ghost', 'electric', 'ice', 'dark'],
      x4: [],
    });
  });
});

describe('calculateMoveEffectiveness', () => {
  test('gen 6 electric vs water/flying', () => {
    expect(calculateMoveEffectiveness('electric', 6, 'water', 'flying')).toBe(4);
  });

  test('gen 6 electric vs flying', () => {
    expect(calculateMoveEffectiveness('electric', 6, 'flying')).toBe(2);
  });

  test('gen 6 flying vs electric', () => {
    expect(calculateMoveEffectiveness('flying', 6, 'electric')).toBe(0.5);
  });
  
  test('gen 6 bug vs ghost/flying', () => {
    expect(calculateMoveEffectiveness('bug', 6, 'ghost', 'flying')).toBe(0.25);
  });
  
  test('gen 6 normal vs ghost', () => {
    expect(calculateMoveEffectiveness('normal', 6, 'ghost')).toBe(0);
  });
});
