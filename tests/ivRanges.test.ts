/* eslint-disable no-multi-spaces, key-spacing, array-bracket-spacing, indent */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testCases = [
  {
    caseName: 'Mudkip: Alpha Sapphire Any% Route',
    baseStats: [
      [ 50,   70,   50,   50,   50,   40],
      [ 70,   85,   70,   60,   70,   50],
      [100,  110,   90,   85,   90,   60],
    ],
    previousLevelStats:[
      {
        5:   [0,    0,    0,    0,    0,    0],
        6:   [0,    1,    0,    0,    0,    1],
        7:   [0,    1,    0,    0,    0,    2],
        8:   [0,    2,    0,    0,    0,    2],
        9:   [0,    2,    1,    0,    0,    2],
        10:  [0,    2,    2,    0,    0,    2],
        11:  [0,    2,    3,    0,    0,    2],
        12:  [0,    2,    5,    0,    0,    2],
        13:  [0,    3,    5,    0,    0,    3],
        14:  [0,    4,    5,    0,    0,    3],
        15:  [0,    6,    5,    0,    0,    4],
        16:  [1,    7,    5,    0,    0,    5],
      }, {
        16:  [1,    7,    5,    0,    0,    5],
        17:  [1,    8,    5,    0,    0,    6],
        18:  [1,    8,    5,    1,    0,    7],
        19:  [1,    8,    5,    1,    0,    9],
        20:  [2,    8,    5,    3,    0,   11],
        21:  [2,    8,    5,    6,    0,   13],
        22:  [2,    8,    5,    6,    0,   15],
      },
    ],
    evs: {
      5:   [0,    0,    0,    0,    0,    0],
      6:   [0,    1,    0,    0,    0,    1],
      7:   [0,    1,    0,    0,    0,    2],
      8:   [0,    2,    0,    0,    0,    2],
      9:   [0,    2,    1,    0,    0,    2],
      10:  [0,    2,    2,    0,    0,    2],
      11:  [0,    2,    3,    0,    0,    2],
      12:  [0,    2,    5,    0,    0,    2],
      13:  [0,    3,    5,    0,    0,    3],
      14:  [0,    4,    5,    0,    0,    3],
      15:  [0,    6,    5,    0,    0,    4],
      16:  [1,    7,    5,    0,    0,    5],
      17:  [1,    8,    5,    0,    0,    6],
      18:  [1,    8,    5,    1,    0,    7],
      19:  [1,    8,    5,    1,    0,    9],
      20:  [2,    8,    5,    3,    0,   11],
      21:  [2,    8,    5,    6,    0,   13],
      22:  [2,    8,    5,    6,    0,   15],
    },
    generation: 6,
    expectedOutput: [
      {
        5:   [[[0, 0], [0, 0], [0, 0], [0, 0]],    0,    0,    0,    0,    0],
        6:   [0,    1,    0,    0,    0,    1],
        7:   [0,    1,    0,    0,    0,    2],
        8:   [0,    2,    0,    0,    0,    2],
        9:   [0,    2,    1,    0,    0,    2],
        10:  [0,    2,    2,    0,    0,    2],
        11:  [0,    2,    3,    0,    0,    2],
        12:  [0,    2,    5,    0,    0,    2],
        13:  [0,    3,    5,    0,    0,    3],
        14:  [0,    4,    5,    0,    0,    3],
        15:  [0,    6,    5,    0,    0,    4],
        16:  [1,    7,    5,    0,    0,    5],
      }, {
        16:  [1,    7,    5,    0,    0,    5],
        17:  [1,    8,    5,    0,    0,    6],
        18:  [1,    8,    5,    1,    0,    7],
        19:  [1,    8,    5,    1,    0,    9],
        20:  [2,    8,    5,    3,    0,   11],
        21:  [2,    8,    5,    6,    0,   13],
        22:  [2,    8,    5,    6,    0,   15],
      },
    ],
  },
];
/* eslint-enable no-multi-spaces, key-spacing, array-bracket-spacing, indent */