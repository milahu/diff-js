import { localExtremaTest } from './local-extrema.helper.js';

import { test } from 'zora';

// TODO test option yTolerance

test('finds minimum in middle of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [2, 1, 0, 1, 2];
  const minima = [[2, 2]];
  localExtremaTest(t, values, {}, { minima });
});

test('finds maximum in middle of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [2, 3, 4, 3, 2];
  const maxima = [[2, 2]];
  localExtremaTest(t, values, {}, { maxima });
});

test('finds max + min + max', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2];
  const maxima = [[2, 2], [10, 10]];
  const minima = [[6, 6]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('finds min + max + min', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2];
  const minima = [[2, 2], [10, 10]];
  const maxima = [[6, 6]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('finds high plateau at start of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 4, 3];
  const maxima = [[0, 3]];
  localExtremaTest(t, values, {}, { maxima });
});

test('finds high plateau in middle of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [3, 4, 5, 5, 5, 5, 4, 3];
  const maxima = [[2, 5]];
  localExtremaTest(t, values, {}, { maxima });
});

test('finds high plateau at end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [3, 4, 5, 5, 5, 5];
  const maxima = [[2, 5]];
  localExtremaTest(t, values, {}, { maxima });
});

test('finds high plateau at start and end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 4, 3, 4, 5, 5, 5, 5];
  const minima = [[5, 5]];
  const maxima = [[0, 3], [7, 10]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('finds high plateau at start and middle and end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 4, 3, 4, 5, 5, 5, 5, 4, 3, 4, 5, 5, 5, 5];
  const minima = [[5, 5], [12, 12]];
  const maxima = [[0, 3], [7, 10], [14, 17]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('finds low plateau at start of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 6, 7, 8];
  const minima = [[0, 3]];
  localExtremaTest(t, values, {}, { minima });
});

test('finds low plateau in middle of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [7, 6, 5, 5, 5, 5, 6, 7];
  const minima = [[2, 5]];
  localExtremaTest(t, values, {}, { minima });
});

test('finds low plateau at end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [7, 6, 5, 5, 5, 5];
  const minima = [[2, 5]];
  localExtremaTest(t, values, {}, { minima });
});

test('finds low plateau at start and end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 6, 7, 6, 5, 5, 5, 5];
  const minima = [[0, 3], [7, 10]];
  const maxima = [[5, 5]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('finds low plateau at start and middle and end of values', t => {
  //              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
  const values = [5, 5, 5, 5, 6, 7, 6, 5, 5, 5, 5, 6, 7, 6, 5, 5, 5, 5];
  const minima = [[0, 3], [7, 10], [14, 17]];
  const maxima = [[5, 5], [12, 12]];
  localExtremaTest(t, values, {}, { minima, maxima });
});

test('supports custom data format 1', t => {
  //              0  1  2  3  4  5
  const values = [7, 6, 5, 5, 5, 5];
  const minima = [[2, 5]];
  const data = {
    keys: Array.from({ length: values.length }).map((_, i) => i),
    values,
  };
  const options = {
    getX: (data, idx) => data.keys[idx],
    getY: (data, idx) => data.values[idx],
    getLength: (data) => data.values.length,
  };
  localExtremaTest(t, data, options, { minima });
});

test('supports custom data format 2', t => {
  //              0  1  2  3  4  5
  const values = [7, 6, 5, 5, 5, 5];
  const minima = [[2, 5]];
  const data = [
    Array.from({ length: values.length }).map((_, i) => i),
    values,
  ];
  const options = {
    getX: (data, idx) => data[0][idx],
    getY: (data, idx) => data[1][idx],
    getLength: (data) => data[1].length,
  };
  localExtremaTest(t, data, options, { minima });
});

test('supports custom data format 3', t => {
  //              0  1  2  3  4  5
  const values = [7, 6, 5, 5, 5, 5];
  const minima = [[2, 5]];
  const data = values.map((val, idx) => [idx, val]);
  const options = {
    getX: (data, idx) => data[idx][0],
    getY: (data, idx) => data[idx][1],
    getLength: (data) => data.length,
  };
  localExtremaTest(t, data, options, { minima });
});
