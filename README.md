# relicalc

[![CI](https://github.com/Corvimae/relicalc/actions/workflows/main.yml/badge.svg)](https://github.com/Corvimae/relicalc/actions/workflows/main.yml)
[![npm](https://img.shields.io/npm/v/relicalc)](https://www.npmjs.com/package/relicalc)

![dr relicanth, phd in mathematics](/relicalc_small.png)

relicalc is [Ranger](https://github.com/corvimae/pokemon-ranger)'s Pokémon math calculation code as a standalone Node (12+) library. It has all the math-y stuff from Ranger without any of that pesky UI nonsense, including:

- Calculating possible damage rolls for a move across all possible IVs.
- Determining possible IVs given the value of a stat at previous levels.
- Calculating experience gained from an encounter.
- Determining possible Hidden Power base damage and type based on possible IVs.
- Building combined type defensive typing tables.

...for all generations including Let's Go<sup>[1](#f1)</sup>.

Logo by [@limeadenectar](https://twitter.com/limeadenectar).

## Installation

```bash
npm install relicalc
```

or

```bash
yarn add relicalc
```

## Usage

The full documentation is available [here](https://docs.ranger.maybreak.com/#/relicalc).

## License

[GNU GPU v3](LICENSE)

---
<a id="f1">1</a>: Gen 1-2 support is less tested.