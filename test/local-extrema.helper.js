import * as diffJS from '../src/index.js';

export function localExtremaTest(t, data, options = {}, expectedResult) {

  const defaultOptions = {
    getX: (data, idx) => idx,
    getY: (data, idx) => data[idx],
    getLength: (data) => data.length,
  };

  options = Object.assign(defaultOptions, options);

  const emptyResult = {
    extrema: [],
    minima: [],
    maxima: [],
    nonextrema: [],
  };

  expectedResult = Object.assign(emptyResult, expectedResult);

  if (expectedResult.extrema.length == 0) {
    expectedResult.extrema = (
      [...expectedResult.minima, ...expectedResult.maxima]
      .sort((a, b) => a[0] - b[0])
    );
  }

  if (expectedResult.nonextrema.length == 0) {
    const lastIndex = options.getLength(data) - 1;
    if (expectedResult.extrema.length == 0) {
      // all values are non-extreme
      expectedResult.nonextrema.push([options.getX(data, 0), options.getX(data, lastIndex)]);
    }
    else {
      var a = options.getX(data, 0);
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
      var b = options.getX(data, lastIndex);
      if (a != b) {
        // data end is no plateau
        expectedResult.nonextrema.push([a, b]);
      }
    }
  }

  const actualResult = diffJS.localExtrema(data, options);

  t.equal(actualResult, expectedResult);

}
