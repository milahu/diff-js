// https://github.com/balint42/diff.js
// differentiation, integration, find local minima and maxima

// similar project:
// https://github.com/efekarakus/d3-peaks
// will only find local maxima (peaks)

import { getArray } from './shared.js';

/**
 * Find local maxima and minima in a list of values.
 *
 * Javascript implementation of:
 * "A Linear-Time Algorithm That Locates Local Extrema
 * of a Function of One Variable From Interval Measurement
 * Results" - Karen Villaverde, Vladik Kreinovich
 * (Interval Computations 01/1993; 1993(4))
 *
 * Takes an object or array with numbers and returns an object
 * with two lists of indices: 'minima' with indices of values
 * that are local minima and 'maxlist' with indices of values that
 * are local maxima. Indices can be of any type.
 * Takes numbers as first parameter and an accuracy > 0 (yTolerance)
 * as second parameter. The accuracy has to be chosen depending
 * on the fluctuations in the data: smaller values mean greater
 * reliability in finding extrema but also greater chance of
 * confusing noise with a local minimum or maximum.
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param values
 * @param yTolerance
 * @returns { minima: Array, maxima: Array }
 */
export function localExtrema(values, yTolerance) {
  // make yArray enumerated and define xArray = 1, 2, 3, ...
  const valuesKeys = Object.keys(values);
  const xArray = Array.from({ length: valuesKeys.length }).map((_, i) => i);
  const yArray = getArray(values);
  // call extremaXY version
  const res = extremaXY(xArray, yArray, yTolerance);
  // find interval centers
  const centerKey = ([intervalStart, intervalEnd]) => (
    valuesKeys[Math.floor((intervalStart + intervalEnd) * 0.5)]
  );
  res.minima = res.minima.map(centerKey);
  res.maxima = res.maxima.map(centerKey);
  return res;
}

/**
 * Alternative version that takes vectors [x] and [y] instead of
 * [values] as input and returns intervals that contain local minima
 * and local maxima. [x] elements can be of any type.
 *
 * For every extreme point, return one x interval.
 * The y values of the interval start and end
 * *can* be significantly different from the extreme point's y value.
 * This difference is minimized by the option `minimizeIntervals: true`.
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param xArray
 * @param yArray
 * @param yTolerance
 * @returns { minima: Array, maxima: Array }
 */
export function localExtremaXY(xArray, yArray, options) {
  xArray = getArray(xArray);
  yArray = getArray(yArray);
  const defaultOptions = { yTolerance: 0.1, minimizeIntervals: true };
  options = Object.assign(defaultOptions, options);
  const { yTolerance, minimizeIntervals } = options;
  // TODO better way to find start of x intervals (detect plateaus) (avoid looping back)
  // TODO also return plateaus who are not min plateaus and not max plateaus
  // TODO xArray is not used in this function, remove function parameter, return x indices
  if (xArray.length < 3) {
    // we need at least three points to analyze extreme points:
    // first derivation is zero and second derivation is nonzero
    return { minima: [], maxima: [] };
  }
  let lastSlope; // -1: falling, +1: rising
  const maxima = [];
  const minima = [];
  let lastMin = yArray[0];
  let lastMax = yArray[0];
  let lastY = yArray[0];
  let x = xArray[1];
  let y = yArray[1];
  let i = 2; // next point
  let plateauLength = 0;

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
    for (; i < yArray.length; i++) {
      y = yArray[i];
      if (y < (lastMax - yTolerance)) {
        // maximum plateau + falling
        if (i > 1 && minimizeIntervals) {
          maxima.push([xArray[0], xArray[i - 1]]);
        }
        else {
          maxima.push([xArray[0], xArray[i]]);
        }
        lastSlope = -1;
        lastMin = y;
        break;
      }
      else if (y > (lastMin + yTolerance)) {
        // minimum plateau + rising
        if (i > 1 && minimizeIntervals) {
          minima.push([xArray[0], xArray[i - 1]]);
        }
        else {
          minima.push([xArray[0], xArray[i]]);
        }
        lastSlope = 1;
        lastMax = y;
        break;
      }
    }
  }

  for (; i < yArray.length; i++) {
    x = xArray[i];
    y = yArray[i];
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
        while (yArray[iStart] >= lastMax - yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2 && minimizeIntervals) {
          maxima.push([xArray[iStart + 1], xArray[i - 1]]);
        }
        else {
          maxima.push([xArray[iStart], xArray[i]]);
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
        while (yArray[iStart] <= lastMin + yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2 && minimizeIntervals) {
          minima.push([xArray[iStart + 1], xArray[i - 1]]);
        }
        else {
          minima.push([xArray[iStart], xArray[i]]);
        }
        // rising
        lastSlope = 1; // change
        lastMax = y;
      }
    }
  }
  // end of array
  i--; // go back to last index
  if (plateauLength > 2) {
    // plateau at end of array
    // plateauLength is already minimal, no need to minimize
    if (y > lastMax - yTolerance) {
      // maximum plateau
      maxima.push([xArray[i - plateauLength], xArray[i]]);
    }
    else {
      // minimum plateau
      minima.push([xArray[i - plateauLength], xArray[i]]);
    }
  }
  return { minima, maxima };
}
