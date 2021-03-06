import { Stat, IVRange, IVRangeNatureSet } from '../reference';

export function formatDamageRange(values: number[]): string {
  const firstValue = values[0];
  const secondValue = values[1];
  const secondToLastValue = values[values.length - 2];
  const lastValue = values[values.length - 1];

  if (firstValue === lastValue) return `${firstValue}`;

  const lowExtreme = firstValue !== secondValue && firstValue;
  const highExtreme = secondToLastValue !== lastValue && lastValue;

  return `${lowExtreme ? `(${lowExtreme}) / ` : ''}${secondValue === secondToLastValue ? secondValue : `${secondValue}–${secondToLastValue}`}${highExtreme ? ` / (${highExtreme})` : ''}`;
}

export function formatIVRange(value: IVRange | undefined): string {
  if (!value || value.from === -1 || value.to === -1) return 'x';
  if (value.from === 0 && value.to === 31) return '0+';

  if (value.from === 0) return `${value.to}${value.to === 0 ? '' : '-'}`;
  if (value.to === 31) return `${value.from}${value.from === 31 ? '' : '+'}`;

  if (value.from === value.to) return `${value.from}`;

  return `${value.from}–${value.to}`;
}

export function formatIVRangeSet(values: IVRangeNatureSet): string {
  return `${formatIVRange(values.negative)} / ${formatIVRange(values.neutral)} / ${formatIVRange(values.positive)}`;
}

export function formatStatRange(from: number, to: number): string {
  return from === to ? `${from}` : `${from}–${to}`;
}

export function formatStatName(stat: Stat, shortForm = false): string {
  switch (stat) {
    case 'hp':
      return 'HP';

    case 'attack':
      return shortForm ? 'ATK' : 'Attack';

    case 'defense':
      return shortForm ? 'DEF' : 'Defense';

    case 'spAttack':
      return shortForm ? 'SP ATK' : 'Sp. Attack';

    case 'spDefense':
      return shortForm ? 'SP DEF' : 'Sp. Defense';
    
    case 'speed':
      return shortForm ? 'SPE' : 'Speed';

    default:
      return '<Unknown Stat>';
  }
}

export function capitalize(value: string): string {
  if (!value.length) return '';

  return value.charAt(0).toUpperCase() + value.substr(1);
}
