import { Generation } from './reference';
import { gamefreakPowerOfTwoPointFive, integerMultiply, multiplyAllForGeneration, multiplyForGeneration } from './utils/math';

export type GrowthRate = 'fast' | 'medium-fast' | 'medium-slow' | 'slow' | 'erratic' | 'fluctuating';

/**
 * Calculate the total amount of experience a Pokémon needs to reach a specific level.
 *
 * @param level - The target level.
 * @param growthRate - The name of Pokémon's growth rate formula.
 * @returns The total amount of experience required to reach the level.
 */
export function calculateExperienceRequiredForLevel(level: number, growthRate: GrowthRate): number {
  if (level <= 1) return 0;
  if (level > 100) return -1;

  switch (growthRate) {
    case 'fast':
      return Math.floor((level ** 3) * 0.8);

    case 'medium-fast':
      return level ** 3;
    
    case 'medium-slow':
      return Math.floor(1.2 * (level ** 3) - 15 * (level ** 2) + 100 * level - 140);

    case 'slow':
      return Math.floor(1.25 * (level ** 3));

    case 'erratic':
      if (level < 50) return Math.floor(((level ** 3) * (100 - level)) / 50);
      if (level < 68) return Math.floor(((level ** 3) * (150 - level)) / 100);
      if (level < 98) return Math.floor(((level ** 3) * Math.floor((1911 - (10 * level)) / 3)) / 500);
    
      return Math.floor(((level ** 3) * (160 - level)) / 100);

    case 'fluctuating':
      if (level < 15) return Math.floor((level ** 3) * ((Math.floor((level + 1) / 3) + 24) / 50));
      if (level < 36) return Math.floor((level ** 3) * ((level + 14) / 50));

      return Math.floor((level ** 3) * ((Math.floor(level / 2) + 32) / 50));
    default:
      throw new Error(`Unsupported growth rate: ${growthRate}.`);
  }
}

/**
 * Determine the experience share multiplier factor.
 *
 * @param generation - The generation formula to use.
 * @param expShareEnabled - Is the Exp. Share enabled?
 * @param participated - Did the Pokémon participate in the battle?
 * @param otherParticipantCount - The number of other participants in the battle.
 * @param otherPokemonHoldingExperienceShare - The number of other Pokémon holding an Exp. Share.
 * @param partySize - The total number of Pokémon in the party.
 * @returns The experience share multiplier factor.
 */
function calculateExperienceShareMultiplier(
  generation: Generation,
  expShareEnabled: boolean,
  participated: boolean,
  otherParticipantCount: number,
  otherPokemonHoldingExperienceShare: number,
  partySize: number,
): number {
  const participantCount = otherParticipantCount + 1;
  const expShareCount = otherPokemonHoldingExperienceShare + (expShareEnabled ? 1 : 0);

  if (generation === 1) {
    if (!expShareEnabled) return participantCount;

    if (participated) return 2 * participantCount;

    return 2 * participantCount * partySize;
  }
  
  if (generation <= 5) {
    if (expShareCount === 0) return participantCount;

    if (participated) return 2 * participantCount;
      
    return 2 * expShareCount;
  }
  
  if (expShareEnabled || generation === 'lgpe') return 2;

  if (participated) return 1;

  return 1;
}

function getInternationalTradeMultiplier(generation: Generation) {
  if (generation < 4) return 1.5;
  if (generation === 5) return 6963 / 4096;
  
  return 1.7;
}

export interface ExperienceGainOptions {
  /** Is the Exp. Share enabled? */
  expShareEnabled?: boolean,
  /** Did the Pokémon gaining experience participate in the fight? */
  participated?: boolean,
  /** The number of other un-fainted participants in the fight. */
  otherParticipantCount?: number,
  /** The number of other Pokémon in the party that are holding an Exp. Share. */
  otherPokemonHoldingExperienceShare?: number,
  /** The number of Pokémon in the party. */
  partySize?: number,
  /** Was this Pokémon received in a domestic trade? */
  isDomesticTrade?: boolean,
  /** Was this Pokémon receieved in an international trade? */
  isInternationalTrade?: boolean,
  /** Is this Pokémon holding a Lucky Egg? */
  hasLuckyEgg?: boolean,
  /** Is this Pokémon affected by the high affection experience boost? */
  hasAffectionBoost?: boolean,
  /** Was the defeated Pokémon a wild Pokémon? */
  isWild?: boolean,
  /** Is the Pokémon past the level it would normally evolve? */
  isPastEvolutionPoint?: boolean,
}

/**
 * Calculate the amount of experience gained from an encounter.
 *
 * @param generation - The generation formula to use.
 * @param baseExperience - The base experience yield of the defeated Pokémon.
 * @param level - The level of the Pokémon gaining experience.
 * @param opponentLevel - The level of the defeated Pokémon.
 * @param options - Additional modifiers to apply to the experience gain event.
 * @returns The experience gained from the encounter.
 */
export function calculateExperienceGain(
  generation: Generation,
  baseExperience: number,
  level: number,
  opponentLevel: number,
  options: ExperienceGainOptions = {},
): number {
  const wildMultiplier = options.isWild ? 1 : 1.5;
  const luckyEggMultiplier = options.hasLuckyEgg ? 1.5 : 1;
  const affectionMultiplier = options.hasAffectionBoost ? 1.2 : 1;
  const expShareMultiplier = calculateExperienceShareMultiplier(
    generation,
    options.expShareEnabled ?? false,
    options.participated ?? true,
    options.otherParticipantCount ?? 0,
    options.otherPokemonHoldingExperienceShare ?? 0,
    options.partySize ?? 1,
  );
  // eslint-disable-next-line no-nested-ternary
  const tradeMultiplier = options.isInternationalTrade ? getInternationalTradeMultiplier(generation) : (options.isDomesticTrade ? 1.5 : 1);
  const evolutionMultiplier = generation >= 6 && options.isPastEvolutionPoint ? 1.2 : 1;
  
  if (generation === 5) {
    const multiplier1 = (multiplyForGeneration(baseExperience * opponentLevel, wildMultiplier, generation) / (Math.fround(5.0) * expShareMultiplier));
    const multiplier2 = gamefreakPowerOfTwoPointFive((Math.fround(2.0) * opponentLevel + Math.fround(10.0)) / (opponentLevel + level + Math.fround(10.0)));

    return multiplyAllForGeneration(Math.floor(multiplier1 * multiplier2) + Math.fround(1.0), [tradeMultiplier, luckyEggMultiplier], generation);
  }

  if (generation >= 7) {
    // I'm not sure if Gen 8 actually uses this formula...
    const multiplier1 = Math.floor(multiplyAllForGeneration(baseExperience * opponentLevel, [evolutionMultiplier], generation) / (Math.fround(5.0) * expShareMultiplier));
    const multiplier2 = gamefreakPowerOfTwoPointFive((Math.fround(2.0) * opponentLevel + Math.fround(10.0)) / (opponentLevel + level + Math.fround(10.0)));

    return multiplyAllForGeneration(Math.floor(multiplier1 * multiplier2), [tradeMultiplier, luckyEggMultiplier, affectionMultiplier], generation);
  }
  
  if (generation === 'bdsp') {
    const multiplier1 = Math.floor(multiplyAllForGeneration(baseExperience * opponentLevel, [evolutionMultiplier], generation) / (Math.fround(5.0) * expShareMultiplier));
    const multiplier2 = gamefreakPowerOfTwoPointFive((Math.fround(2.0) * opponentLevel + Math.fround(10.0)) / (opponentLevel + level + Math.fround(10.0)));

    return multiplyAllForGeneration(Math.floor(multiplier1 * multiplier2) + 1, [tradeMultiplier, luckyEggMultiplier, affectionMultiplier], generation);
  }

  if (generation === 'lgpe') {
    return Math.floor(multiplyAllForGeneration(
      Math.floor(baseExperience * opponentLevel) + 1,
      [
        1 / 15,
        wildMultiplier,
        tradeMultiplier,
        luckyEggMultiplier,
        affectionMultiplier,
        evolutionMultiplier,
      ],
      'lgpe',
    ));
  }

  return Math.floor(integerMultiply(
    Math.floor(baseExperience * opponentLevel),
    wildMultiplier,
    tradeMultiplier,
    luckyEggMultiplier,
    affectionMultiplier,
    evolutionMultiplier,
  ) / (7 * expShareMultiplier));
}
