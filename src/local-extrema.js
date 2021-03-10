// https://github.com/balint42/diff.js
// differentiation, integration, find local minima and maxima

// similar project:
// https://github.com/efekarakus/d3-peaks
// will only find local maxima (peaks)

import { getArray } from './shared.js';

/**
 * Find local maxima and minima in a list of values.
 *
 * For every extreme point, return one x interval.
 * The y values of the interval start and end
 * *can* be significantly different from the extreme point's y value.
 * This difference is minimized by the option `minimizeIntervals: true`.
 *
 * yTolerance depends on the data fluctuations:
 * smaller values mean greater reliability in finding extrema
 * but also greater chance of confusing noise
 * with a local minimum or maximum (false positives).
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param data
 * @param options
 * @option yTolerance
 * @option minimizeIntervals
 * @option getX, getY, getLength: getter functions for custom data format
 * @option nonextrema: also return non-extreme intervals
 * @returns { extrema: interval[], minima: interval[], maxima: interval[], nonextrema: interval[] }
 * @type interval = [xStart, xEnd]
 */
export function localExtrema(data, options) {
  const defaultOptions = {
    yTolerance: 0.1,
    minimizeIntervals: true,
    getX: (data, idx) => idx,
    getY: (data, idx) => data[idx],
    getLength: (data) => data.length,
    nonextrema: true,
  };
  options = Object.assign(defaultOptions, options);
  const { yTolerance, minimizeIntervals } = options;
  // TODO better way to find start of x intervals (detect plateaus) (avoid looping back)
  // TODO also return plateaus who are not min plateaus and not max plateaus
  const getLength = () => options.getLength(data);
  const getX = (idx) => options.getX(data, idx);
  const getY = (idx) => options.getY(data, idx);
  const dataLength = getLength();
  const lastIndex = dataLength - 1;
  if (dataLength < 3) {
    // we need at least three points to analyze extreme points:
    // first derivation is zero and second derivation is nonzero
    return { minima: [], maxima: [] };
  }
  let lastSlope; // -1: falling, +1: rising
  const extrema = [];
  const maxima = [];
  const minima = [];
  let lastMin = getY(0);
  let lastMax = getY(0);
  let lastY = getY(0);
  let x = getX(1);
  let y = getY(1);
  let i = 2; // next point
  let plateauLength = 0;

  const addMaximum = (x, y) => (maxima.push([x, y]), extrema.push([x, y]));
  const addMinimum = (x, y) => (minima.push([x, y]), extrema.push([x, y]));

  // init
  if (y < (lastMax - yTolerance)) {
    // falling
    lastSlope = -1;
    lastMin = y;
  }
  else if (y > (lastMin + yTolerance)) {
    // rising
    lastSlope = 1;
    lastMax = y;
  }
  else {
    // plateau at start of array
    // seek to end of plateau
    for (; i < dataLength; i++) {
      y = getY(i);
      if (y < (lastMax - yTolerance)) {
        // maximum plateau + falling
        if (i > 1 && minimizeIntervals) {
          addMaximum(getX(0), getX(i - 1));
        }
        else {
          addMaximum(getX(0), getX(i));
        }
        lastSlope = -1;
        lastMin = y;
        break;
      }
      else if (y > (lastMin + yTolerance)) {
        // minimum plateau + rising
        if (i > 1 && minimizeIntervals) {
          addMinimum(getX(0), getX(i - 1));
        }
        else {
          addMinimum(getX(0), getX(i));
        }
        lastSlope = 1;
        lastMax = y;
        break;
      }
    }
  }

  for (; i < dataLength; i++) {
    x = getX(i);
    y = getY(i);
    //console.log(`extremaXY: i ${i} + x ${x} + y ${y} + lastSlope ${lastSlope} + lastMin ${lastMin} + lastMax ${lastMax}`);
    if (lastSlope == 1) {
      // was rising
      if (y >= lastMax - yTolerance) {
        // still rising
        // detect high plateau
        if (y < lastMax + yTolerance) {
          // y is inside the tolerance bands
          plateauLength++;
        }
        else {
          plateauLength = 0;
        }
        lastMax = Math.max(lastMax, y); // y can be smaller than lastMax
      }
      else {
        // stopped rising
        plateauLength = 0;
        // find x interval of last maximum
        let iStart = i - 1;
        while (getY(iStart) >= lastMax - yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2 && minimizeIntervals) {
          addMaximum(getX(iStart + 1), getX(i - 1));
        }
        else {
          addMaximum(getX(iStart), getX(i));
        }
        // (plateau or) falling
        lastSlope = -1; // change
        lastMin = y;
      }
    }
    else if (lastSlope == -1) {
      // was falling
      if(y <= lastMin + yTolerance) {
        // still falling
        // detect low plateau
        if (y > lastMin - yTolerance) {
          // y is inside the tolerance bands
          plateauLength++;
        }
        else {
          plateauLength = 0;
        }
        lastMin = Math.min(lastMin, y); // y can be bigger than lastMin
      }
      else {
        // stopped falling
        plateauLength = 0;
        // find x interval of last minimum
        let iStart = i - 1;
        while (getY(iStart) <= lastMin + yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2 && minimizeIntervals) {
          addMinimum(getX(iStart + 1), getX(i - 1));
        }
        else {
          addMinimum(getX(iStart), getX(i));
        }
        // rising
        lastSlope = 1; // change
        lastMax = y;
      }
    }
  }
  // end of array
  i = lastIndex;
  if (plateauLength > 0) {
    // plateau at end of array
    // plateauLength is already minimal, no need to minimize
    if (y > lastMax - yTolerance) {
      // maximum plateau
      addMaximum(getX(i - plateauLength), getX(i));
    }
    else {
      // minimum plateau
      addMinimum(getX(i - plateauLength), getX(i));
    }
  }

  const result = { extrema, minima, maxima };

  if (options.nonextrema) {
    // find complementary intervals, where data is not extreme
    // use the same interval delimiters as in the extrema array (xStart, xEnd)
    const nonextrema = [];
    if (extrema.length == 0) {
      // all values are non-extreme
      nonextrema.push([getX(0), getX(lastIndex)]);
    }
    else {
      var a = getX(0);
      var b = extrema[0][0];
      if (a != b) {
        // data start is no plateau
        nonextrema.push([a, b]);
      }
      for (let i = 0; i < extrema.length - 1; i++) {
        nonextrema.push([
          extrema[i][1],
          extrema[i + 1][0]
        ]);
      }
      var a = extrema[extrema.length - 1][1];
      var b = getX(lastIndex);
      if (a != b) {
        // data end is no plateau
        nonextrema.push([a, b]);
      }
    }
    result.nonextrema = nonextrema;
  }

  return result;
}
