import { Generation } from './reference';

export const TYPE_NAMES = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
] as const;

export type TypeName = typeof TYPE_NAMES[number];

interface TypeEffectivenessDefinition {
  double: TypeName[];
  half: TypeName[];
  immune: TypeName[];
}

const typeChart: Record<TypeName, TypeEffectivenessDefinition> = {
  normal: {
    double: [],
    half: ['rock', 'steel'],
    immune: ['ghost'],
  },
  fighting: {
    double: ['normal', 'rock', 'steel', 'ice', 'dark'],
    half: ['flying', 'poison', 'bug', 'psychic', 'fairy'],
    immune: ['ghost'],
  },
  flying: {
    double: ['fighting', 'bug', 'grass'],
    half: ['rock', 'steel', 'electric'],
    immune: [],
  },
  poison: {
    double: ['grass', 'fairy'],
    half: ['poison', 'ground', 'rock', 'ghost'],
    immune: ['steel'],
  },
  ground: {
    double: ['poison', 'rock', 'steel', 'fire', 'electric'],
    half: ['bug', 'grass'],
    immune: ['flying'],
  },
  rock: {
    double: ['flying', 'bug', 'fire', 'ice'],
    half: ['fighting', 'ground', 'steel'],
    immune: [],
  },
  bug: {
    double: ['grass', 'psychic', 'dark'],
    half: ['fighting', 'flying', 'poison', 'ghost', 'steel', 'fire'],
    immune: [],
  },
  ghost: {
    double: ['ghost', 'psychic'],
    half: ['dark'],
    immune: ['normal'],
  },
  steel: {
    double: ['rock', 'ice', 'fairy'],
    half: ['steel', 'fire', 'water', 'electric'],
    immune: [],
  },
  fire: {
    double: ['bug', 'steel', 'grass'],
    half: ['rock', 'fire', 'water', 'dragon'],
    immune: [],
  },
  water: {
    double: ['ground', 'rock', 'fire'],
    half: ['water', 'grass', 'dragon'],
    immune: [],
  },
  grass: {
    double: ['ground', 'rock', 'water'],
    half: ['flying', 'poison', 'bug', 'steel', 'fire', 'grass', 'dragon'],
    immune: [],
  },
  electric: {
    double: ['flying', 'water'],
    half: ['grass', 'electric', 'dragon'],
    immune: ['ground'],
  },
  psychic: {
    double: ['fighting', 'poison'],
    half: ['steel', 'psychic'],
    immune: ['dark'],
  },
  ice: {
    double: ['flying', 'ground', 'grass', 'dragon'],
    half: ['steel', 'fire', 'water', 'ice'],
    immune: [],
  },
  dragon: {
    double: ['dragon'],
    half: ['steel'],
    immune: ['fairy'],
  },
  dark: {
    double: ['ghost', 'psychic'],
    half: ['fighting', 'dark', 'fairy'],
    immune: [],
  },
  fairy: {
    double: ['fighting', 'dragon', 'dark'],
    half: ['poison', 'steel', 'fire'],
    immune: [],
  },
};

interface TypeEffectivenesses {
  x4: TypeName[];
  x2: TypeName[];
  x0: TypeName[];
  half: TypeName[];
  fourth: TypeName[];
}

function changeEffectivenessTo(block: TypeEffectivenesses, defensiveType: TypeName, location: keyof TypeEffectivenesses | null): TypeEffectivenesses {
  return Object.entries(block).reduce((acc, [key, value]) => {
    if (location === key) {
      return {
        ...acc,
        [key]: [...value, defensiveType],
      };
    }

    return {
      ...acc,
      [key]: (value as TypeName[]).filter(item => item !== defensiveType),
    };
  }, {} as TypeEffectivenesses);
}

/**
 * Get the defensive effectivenesses of an elemental type for a specific generation.
 *
 * @param type - The name of the type.
 * @param generation - The generation type chart to use.
 * @returns The list of weaknesses, resists, and immunities.
 */
export function getDefensiveEffectivenesses(type: TypeName | null, generation: Generation): TypeEffectivenesses {
  if (!type || !typeChart[type]) {
    return {
      x4: [],
      x2: [],
      x0: [],
      half: [],
      fourth: [],
    };
  }

  let chart = {
    x4: [],
    x2: Object.entries(typeChart).filter(([_key, rules]) => rules.double.indexOf(type) !== -1).map(([key]) => key as TypeName),
    x0: Object.entries(typeChart).filter(([_key, rules]) => rules.immune.indexOf(type) !== -1).map(([key]) => key as TypeName),
    half: Object.entries(typeChart).filter(([_key, rules]) => rules.half.indexOf(type) !== -1).map(([key]) => key as TypeName),
    fourth: [],
  } as TypeEffectivenesses;

  // Apply type chart patches.
  if (generation < 6) {
    if (type === 'steel') {
      chart = changeEffectivenessTo(changeEffectivenessTo(chart, 'ghost', 'half'), 'dark', 'half');
    }

    if (generation < 2) {
      if (type === 'poison') chart = changeEffectivenessTo(chart, 'bug', 'x2');
      if (type === 'bug') chart = changeEffectivenessTo(chart, 'poison', 'x2');
      if (type === 'psychic') chart = changeEffectivenessTo(chart, 'ghost', 'x0');
      if (type === 'fire') chart = changeEffectivenessTo(chart, 'ice', null);
    }
  }

  return chart;
}

function exclusiveOr(a: boolean, b: boolean): boolean {
  return (a && !b) || (b && !a);
}

function is4x(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return type1.x2.indexOf(type) !== -1 && type2.x2.indexOf(type) !== -1;
}

function is2x(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return exclusiveOr(type1.x2.indexOf(type) !== -1, type2.x2.indexOf(type) !== -1)
    && type1.half.indexOf(type) === -1 && type2.half.indexOf(type) === -1;
}

function isHalf(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return exclusiveOr(type1.half.indexOf(type) !== -1, type2.half.indexOf(type) !== -1)
    && type1.x2.indexOf(type) === -1 && type2.x2.indexOf(type) === -1;
}

function isFourth(type: TypeName, type1: TypeEffectivenesses, type2: TypeEffectivenesses): boolean {
  return type1.half.indexOf(type) !== -1 && type2.half.indexOf(type) !== -1;
}

/**
 * Get the combined defensive effectivenesses of one or two elemental type for a specific generation.
 *
 * @param generation - The generation type chart to use.
 * @param pokemonTypes - The types of the defending Pokémon.
 * @returns The list of weaknesses, resists, and immunities.
 */
export function calculateCombinedDefensiveEffectivenesses(generation: Generation, ...pokemonTypes: TypeName[]): TypeEffectivenesses {
  const type1 = getDefensiveEffectivenesses(pokemonTypes[0] as TypeName, generation);
  const type2 = getDefensiveEffectivenesses(pokemonTypes[1] as TypeName, generation);

  const allImmunities = [...type1.x0, ...type2.x0];

  return {
    x4: TYPE_NAMES.filter(type => is4x(type, type1, type2) && allImmunities.indexOf(type) === -1),
    x2: TYPE_NAMES.filter(type => is2x(type, type1, type2) && allImmunities.indexOf(type) === -1),
    x0: TYPE_NAMES.filter(type => type1.x0.indexOf(type) !== -1 || type2.x0.indexOf(type) !== -1 || allImmunities.indexOf(type) !== -1),
    half: TYPE_NAMES.filter(type => isHalf(type, type1, type2) && allImmunities.indexOf(type) === -1),
    fourth: TYPE_NAMES.filter(type => isFourth(type, type1, type2) && allImmunities.indexOf(type) === -1),
  };
}

/**
 * Calculate the effectiveness of a move against an opponent's typing.
 *
 * @param moveType - The type of the move being used.
 * @param generation - The generation type chart to use.
 * @param pokemonTypes - The types of the defending Pokémon.
 * @returns The effectiveness multiplier of the move against the defender.
 */
export function calculateMoveEffectiveness(moveType: TypeName, generation: Generation, ...pokemonTypes: TypeName[]): number {
  const combinedEffectivness = calculateCombinedDefensiveEffectivenesses(generation, ...pokemonTypes);

  if (combinedEffectivness.x4.indexOf(moveType) !== -1) return 4;
  if (combinedEffectivness.x2.indexOf(moveType) !== -1) return 2;
  if (combinedEffectivness.x0.indexOf(moveType) !== -1) return 0;
  if (combinedEffectivness.half.indexOf(moveType) !== -1) return 0.5;
  if (combinedEffectivness.fourth.indexOf(moveType) !== -1) return 0.25;

  return 1;
}
