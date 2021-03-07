import * as diffJS from '../';

function indexArray(data) {
  return Array.from({ length: data.length }).map((_, i) => i);
}

// TODO test tolerance

test('finds minimum in middle of array', () => {
  const array = [5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [], "minima": [[5, 5]]});
});

test('finds maximum in middle of array', () => {
  const array = [5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[5, 5]], "minima": []});
});

test('finds max + min + max', () => {
  const array = [5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[5, 5], [15, 15]], "minima": [[10, 10]]});
});

test('finds min + max + min', () => {
  const array = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[10, 10]], "minima": [[5, 5], [15, 15]]});
});

test('finds high plateau at start of array', () => {
  const array = [10, 10, 10, 10, 10, 9, 8, 7, 6, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[0, 4]], "minima": []});
});

test('finds high plateau in middle of array', () => {
  const array = [5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 9, 8, 7, 6, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[5, 9]], "minima": []});
});

test('finds high plateau at end of array', () => {
  const array = [5, 6, 7, 8, 9, 10, 10, 10, 10, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[5, 9]], "minima": []});
});

test('finds high plateau at start and end of array', () => {
  const array = [10, 10, 10, 10, 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[0, 4], [14, 18]], "minima": [[9, 9]]});
});

test('finds high plateau at start and middle and end of array', () => {
  const array = [10, 10, 10, 10, 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[0, 4], [14, 18], [28, 32]], "minima": [[9, 9], [23, 23]]});
});

test('finds low plateau at start of array', () => {
  const array = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [], "minima": [[0, 4]]});
});

test('finds low plateau in middle of array', () => {
  const array = [10, 9, 8, 7, 6, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [], "minima": [[5, 9]]});
});

test('finds low plateau at end of array', () => {
  const array = [10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [], "minima": [[5, 9]]});
});

test('finds low plateau at start and end of array', () => {
  const array = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[9, 9]], "minima": [[0, 4], [14, 18]]});
});

test('finds low plateau at start and middle and end of array', () => {
  const array = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const res = diffJS.localExtrema(array);
  expect(res).toStrictEqual({"maxima": [[9, 9], [23, 23]], "minima": [[0, 4], [14, 18], [28, 32]]});
});

test('supports custom data format 1', () => {
  const values = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const data = {
    keys: Array.from({ length: values.length }).map((_, i) => i),
    values,
  };
  const res = diffJS.localExtrema(
    data, {
    getX: (data, idx) => data.keys[idx],
    getY: (data, idx) => data.values[idx],
    getLength: (data) => data.values.length,
  });
  expect(res).toStrictEqual({"maxima": [[9, 9], [23, 23]], "minima": [[0, 4], [14, 18], [28, 32]]});
});

test('supports custom data format 2', () => {
  const values = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const data = [
    Array.from({ length: values.length }).map((_, i) => i),
    values,
  ];
  const res = diffJS.localExtrema(
    data, {
    getX: (data, idx) => data[0][idx],
    getY: (data, idx) => data[1][idx],
    getLength: (data) => data[1].length,
  });
  expect(res).toStrictEqual({"maxima": [[9, 9], [23, 23]], "minima": [[0, 4], [14, 18], [28, 32]]});
});

test('supports custom data format 3', () => {
  const values = [5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 5, 5, 5, 5];
  const data = values.map((val, idx) => [idx, val]);
  const res = diffJS.localExtrema(
    data, {
    getX: (data, idx) => data[idx][0],
    getY: (data, idx) => data[idx][1],
    getLength: (data) => data.length,
  });
  expect(res).toStrictEqual({"maxima": [[9, 9], [23, 23]], "minima": [[0, 4], [14, 18], [28, 32]]});
});
