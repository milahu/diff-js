import * as diffJS from '../src/index.js';

export function localExtremaTest(t, data, options = {}, expectedResult) {

  const defaultOptions = {
    y: (data, idx) => data[idx],
    result: (data, idx) => idx,
    length: (data) => data.length,
  };

  options = Object.assign(defaultOptions, options);

  const emptyResult = {
    extrema: [],
    minima: [],
    maxima: [],
    nonextrema: [],
    plateaus: [],
  };

  expectedResult = Object.assign(emptyResult, expectedResult);

  if (options.length(data) >= 3) {

    if (expectedResult.extrema.length == 0) {
      expectedResult.extrema = (
        [...expectedResult.minima, ...expectedResult.maxima, ...expectedResult.plateaus]
        .sort((a, b) => a[0] - b[0]) // only works if `options.result` returns index or x-value
      );
    }

    if (expectedResult.nonextrema.length == 0) {
      const lastIndex = options.length(data) - 1;
      if (expectedResult.extrema.length == 0) {
        // all values are non-extreme
        expectedResult.nonextrema.push([options.result(data, 0), options.result(data, lastIndex)]);
      }
      else {
        var a = options.result(data, 0);
        var b = expectedResult.extrema[0][0];
        if (a != b) {
          // data start is no plateau
          expectedResult.nonextrema.push([a, b]);
        }
        for (let i = 0; i < expectedResult.extrema.length - 1; i++) {
          expectedResult.nonextrema.push([
            expectedResult.extrema[i][1],
            expectedResult.extrema[i + 1][0]
          ]);
        }
        var a = expectedResult.extrema[expectedResult.extrema.length - 1][1];
        var b = options.result(data, lastIndex);
        if (a != b) {
          // data end is no plateau
          expectedResult.nonextrema.push([a, b]);
        }
      }
    }
  }

  const actualResult = diffJS.localExtrema(data, options);

  t.equal(actualResult, expectedResult);
}
