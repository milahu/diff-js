import { getArray } from './shared.js';

/**
 * Calculate differences of a vector.
 *
 * Takes an object or array Y with m numbers and returns an array
 * dY with m-1 numbers that constitutes the differences:
 * dY = [Y(2)-Y(1) Y(3)-Y(2) ... Y(m)-Y(m-1)]
 * If Y are function values f(1), f(2), ... with a step size of 1,
 * then dY constitutes the approximate derivative of f. For a different
 * step size use diffXY.
 * NOTE: For a step size other than 1, the differences do NOT constitute
 * the approximate derivative and thus in those cases use diffXY if you
 * want to get the derivative.
 *
 * If as second parameter a number n is given, the returned array
 * dY will be the n-th differential, thus above step applied n-times.
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param values
 * @param n
 * @returns Array
 */
export function differentiate(values, n) {
  // make yArray enumerated and define xArray = 1, 2, 3, ...
  var xArray, yArray;
  yArray = getArray(values);
  xArray = Object.keys(yArray).map(Math.floor);
  // call diffXY version
  return diffXY(xArray, yArray, n);
}

/**
 * Calculate approximate derivative of a vector Y, assuming
 * that Y=f(X) with given vector X.
 *
 * Takes objects or arrays X and Y with m numbers and returns
 * an array dY with m-1 numbers that constitutes the approximate
 * derivative:
 * dY = [(Y(2)-Y(1))/(X(2)-X(1))  (Y(3)-Y(2)/(X(3)-X(2)) ...
 *       (Y(m)-Y(m-1))/((X(m)-X(m-1))]
 *
 * If as second parameter a number n is given, the returned array
 * dY will be the n-th differential, thus above step applied n-times.
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param xArray
 * @param yArray
 * @param n
 * @returns Array
 */
export function differentiateXY(xArray, yArray, n) {
  // recursive calls to get n-th diff
  if(n > 1) {
    yArray = diffXY(xArray, yArray, n-1);
    xArray.pop();
  }
  // loop through 1,...,m-1 entries of values to get diff
  var keysX = Object.keys(xArray);
  var keysY = Object.keys(yArray);
  var len = Math.min(keysX.length-1, keysY.length-1);
  for (var k = 0; k < len; k++) {
    yArray[k] = (yArray[keysY[k+1]]-yArray[keysY[k]]) /
         (xArray[keysX[k+1]]-xArray[keysX[k]]);
  }
  yArray.pop(); // last element is old value, delete it

  return yArray;
}
