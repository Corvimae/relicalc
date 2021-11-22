import { Generation, StatLine } from './reference';

/**
 * Convert an ordered list of stats into an object mapped from stat name to value
 */
export function createStatLine(hp: number, attack: number, defense: number, spAttack: number, spDefense: number, speed: number): StatLine {
  return { hp, attack, defense, spAttack, spDefense, speed };
}

/**
 * Calculate a stat using the Gen 1 formula.
 *
 * @param level - The current level of the Pokémon.
 * @param base - The Pokémon's base stat value.
 * @param dv - The Pokémon's individual value for the stat.
 * @param ev - The Pokémon's effort value for the stat.
 * @return The calculated stat.
 */
export function calculateGen1Stat(level: number, base: number, dv: number, ev: number): number {
  return Math.floor((Math.floor(((2 * (base + dv) + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level) / 100) + 5));
}

/**
 * Calculate a stat using the Gen 3+ formula.
 *
 * @param level - The current level of the Pokémon.
 * @param base - The Pokémon's base stat value.
 * @param iv - The Pokémon's individual value for the stat.
 * @param ev - The Pokémon's effort value for the stat.
 * @param modifier - The nature modifier (1.1 for a positive nature, 0.9 for a negative nature) for the stat.
 * @return The calculated stat.
 */
export function calculateStat(level: number, base: number, iv: number, ev: number, modifier: number): number {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
}

/**
 * Calculate a stat using the Let's Go formula.
 *
 * @param level - The current level of the Pokémon.
 * @param base - The Pokémon's base stat value.
 * @param iv - The Pokémon's individual value for the stat.
 * @param av - The Pokémon's awakening value for the stat.
 * @param modifier - The nature modifier (1.1 for a positive nature, 0.9 for a negative nature) for the stat.
 * @param friendship - The Pokémon's friendship value.
 * @return The calculated stat.
 */
export function calculateLGPEStat(level: number, base: number, iv: number, av: number, modifier: number, friendship: number): number {
  const friendshipModifier = 1 + Math.floor(10 * (friendship / 255)) / 100;

  return Math.floor(Math.floor((Math.floor(((2 * base + iv) * level) / 100) + 5) * modifier) * friendshipModifier) + av;
}

/**
 * Calculate a Pokémon's total HP.
 *
 * @param level - The current level of the Pokémon.
 * @param base - The Pokémon's base stat value.
 * @param iv - The Pokémon's individual value for the stat.
 * @param ev - The Pokémon's effort value for the stat.
 * @param generation - The generation formula to use.
 * @return The calculated total HP.
 */
export function calculateHP(level: number, base: number, iv: number, ev: number, generation: Generation): number {
  if (generation <= 2) {
    return Math.floor((Math.floor(((2 * (base + iv) + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level) / 100) + level + 10));
  }

  if (generation === 'lgpe') {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10 + ev;
  }

  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10));
}

/**
 * Determine a stat value after applying combat stages.
 *
 * @param stat - The stat for the Pokémon at 0 combat stages.
 * @param combatStages - The number of combat stages to apply, from -6 to 6.
 */
export function applyCombatStages(stat: number, combatStages: number): number {
  if (combatStages === 0) return stat;

  if (combatStages > 0) return Math.floor(stat * ((combatStages + 2) / 2));

  return Math.floor(stat * (2 / (Math.abs(combatStages) + 2)));
}
