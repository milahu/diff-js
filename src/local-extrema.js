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
 * @option result, y, getLength: getter functions for custom data format
 * @option nonextrema: also return non-extreme intervals
 * @returns { extrema: interval[], minima: interval[], maxima: interval[], nonextrema: interval[] }
 * @type interval = [xStart, xEnd]
 */

export function localExtrema(data, options) {

  // TODO better way to find start of x intervals (detect plateaus) (avoid looping back)
  // TODO also return plateaus who are not min plateaus and not max plateaus

  const defaultOptions = {
    yTolerance: 0.1,
    y: (data, idx) => data[idx],
    result: (data, idx) => idx,
    length: (data) => data.length,
    nonextrema: true,
  };
  options = Object.assign(defaultOptions, options);
  const dataLength = options.length(data);
  if (dataLength < 3) {
    // we need at least three points to analyze extreme points:
    // first derivation is zero and second derivation is nonzero
    return { extrema: [], maxima: [], minima: [], plateaus: [], nonextrema: [] };
  }
  const { yTolerance } = options;
  const result = (idx) => options.result(data, idx);
  const y = (idx) => options.y(data, idx);
  const lastIndex = dataLength - 1;
  let lastSlope; // -1: falling, +1: rising
  const extrema = [];
  const maxima = [];
  const minima = [];
  const plateaus = [];
  let lastMin = y(0);
  let lastMax = y(0);
  let lastY = y(0);
  let thisY = y(1);

  //console.log(`localExtrema: data ${JSON.stringify(data)}`);
  //console.log(`localExtrema: i 0 + y ${y(0)} + lastSlope ?? + lastMin ${lastMin} + lastMax ${lastMax}`);
  //console.log(`localExtrema: i 1 + y ${y(1)} + lastSlope ?? + lastMin ${lastMin} + lastMax ${lastMax}`);

  let i = 2; // next point
  let plateauLength = 0;
  const addMaximum = (...ab) => (maxima.push(ab), extrema.push(ab));
  const addMinimum = (...ab) => (minima.push(ab), extrema.push(ab));
  const addPlateau = (...ab) => (plateaus.push(ab), extrema.push(ab));

  // start of array
  if (thisY < (lastMax - yTolerance)) {
    // falling
    lastSlope = -1;
    lastMin = thisY;
  }
  else if (thisY > (lastMin + yTolerance)) {
    // rising
    lastSlope = 1;
    lastMax = thisY;
  }
  else {
    // plateau at start of array
    // seek to end of plateau
    for (; i < dataLength; i++) {
      thisY = y(i);
      //console.log(`localExtrema: i ${i} + y ${thisY} + lastSlope ${lastSlope == 1 ? '+1' : lastSlope} + lastMin ${lastMin} + lastMax ${lastMax}`);
      if (thisY < (lastMax - yTolerance)) {
        // maximum plateau + falling
        if (i > 1) {
          addMaximum(result(0), result(i - 1));
        }
        else {
          addMaximum(result(0), result(i));
        }
        lastSlope = -1;
        lastMin = thisY;
        break;
      }
      else if (thisY > (lastMin + yTolerance)) {
        // minimum plateau + rising
        if (i > 1) {
          addMinimum(result(0), result(i - 1));
        }
        else {
          addMinimum(result(0), result(i));
        }
        lastSlope = 1;
        lastMax = thisY;
        break;
      }
    }
    i++; // needed after break-ing out of the for-loop
  }
  //console.log(`localExtrema: i ${i}: done start of array`);

  for (; i < dataLength; i++) {
    thisY = y(i);
    //console.log(`localExtrema: i ${i} + y ${thisY} + lastSlope ${lastSlope == 1 ? '+1' : lastSlope} + lastMin ${lastMin} + lastMax ${lastMax}`);
    if (lastSlope == 1) {
      // was rising
      if (thisY >= lastMax - yTolerance) {
        // still rising
        // detect high plateau
        if (thisY < lastMax + yTolerance) {
          // thisY is inside the tolerance bands
          //console.log(`localExtrema: i ${i}: y ${thisY} is near lastMax ${lastMax}. plateauLength -> ${plateauLength + 1} `);
          plateauLength++;
        }
        else {
          if (plateauLength > 0) {
            addPlateau(result(i - plateauLength - 1), result(i - 1));
            //console.log(`localExtrema: i ${i}: found rising plateau: plateauLength ${plateauLength} + start ${i - plateauLength-1} + end ${i-1}`);
          }
          plateauLength = 0;
        }
        lastMax = Math.max(lastMax, thisY); // thisY can be smaller than lastMax
      }
      else {
        // stopped rising
        plateauLength = 0;
        // find x interval of last maximum
        let iStart = i - 1;
        while (y(iStart) >= lastMax - yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2) {
          addMaximum(result(iStart + 1), result(i - 1));
        }
        else {
          addMaximum(result(iStart), result(i));
        }
        // (plateau or) falling
        lastSlope = -1;
        lastMin = thisY;
      }
    }
    //else if (lastSlope == -1) {
    else {
      // was falling
      if(thisY <= lastMin + yTolerance) {
        // still falling
        // detect low plateau
        if (thisY > lastMin - yTolerance) {
          // thisY is inside the tolerance bands
          plateauLength++;
        }
        else {
          if (plateauLength > 0) {
            addPlateau(result(i - plateauLength - 1), result(i - 1));
            //console.log(`localExtrema: found falling plateau: plateauLength ${plateauLength} + i-1 ${i-1} + i-pl-1 ${i - plateauLength-1}`);
          }
          plateauLength = 0;
        }
        lastMin = Math.min(lastMin, thisY); // thisY can be bigger than lastMin
      }
      else {
        // stopped falling
        plateauLength = 0;
        // find x interval of last minimum
        let iStart = i - 1;
        while (y(iStart) <= lastMin + yTolerance) {
          iStart--;
        }
        if ((i - iStart) >= 2) {
          addMinimum(result(iStart + 1), result(i - 1));
        }
        else {
          addMinimum(result(iStart), result(i));
        }
        // (plateau or) rising
        lastSlope = 1;
        lastMax = thisY;
      }
    }
  }
  //console.log(`localExtrema: done middle of array`);

  // end of array
  i = lastIndex;
  if (plateauLength > 0) {
    // plateau at end of array
    // plateauLength is already minimal, no need to minimize
    if (thisY > lastMax - yTolerance) {
      // maximum plateau
      addMaximum(result(i - plateauLength), result(i));
    }
    else {
      // minimum plateau
      addMinimum(result(i - plateauLength), result(i));
    }
  }

  if (options.nonextrema) {
    // find complementary intervals, where data is not extreme
    // use the same interval delimiters as in the extrema array (xStart, xEnd)
    const nonextrema = [];
    if (extrema.length == 0) {
      // all values are non-extreme
      nonextrema.push([result(0), result(lastIndex)]);
    }
    else {
      var a = result(0);
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
      var b = result(lastIndex);
      if (a != b) {
        // data end is no plateau
        nonextrema.push([a, b]);
      }
    }
    return { extrema, maxima, minima, plateaus, nonextrema }
  }

  return { extrema, maxima, minima, plateaus };
}
