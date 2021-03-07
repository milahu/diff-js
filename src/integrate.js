import { getArray } from './shared.js';

/**
 * Calculate reverse differences of a vector.
 *
 * Takes an object or array Y with m numbers and returns an array
 * IY with m numbers that constitutes the reverse differences:
 * [ ... -Y(m)-Y(m-1)-Y(m-2)  -Y(m)-Y(m-1)  -Y(m)]
 * If Y are function values f(1), f(2), ... with a step size of 1,
 * then IY constitutes the approximate integral of f. For a different
 * step size use integralXY.
 *
 * If as second parameter a number n is given, the returned array
 * Y will be the n-th integral, thus above step applied n-times.
 *
 * NOTE: the integral cannot determine the original set of values
 * before "diff" was applied, thus "integral(diff(values)) != values"
 * due to the nature of integration and differentiation. However the
 * shape of the result will be the same, the curve will only be
 * shifted by a constant value. ("translation")
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param values
 * @param n
 * @returns Array
 */
export function integrate(values, n) {
  // make yArray enumerated and define xArray = 1, 2, 3, ...
  var xArray, yArray;
  yArray = getArray(values);
  xArray = Object.keys(yArray).map(Math.floor);
  // call integralXY version
  return integralXY(xArray, yArray, n);
}

/**
 * Calculate approximate integral of a vector, assuming
 * that Y=f(X) with given vector X.
 *
 * Takes an object or array Y with m numbers and returns an array
 * X with m numbers that constitutes the integral:
 * [ ...
 *  -Y(m)*(X(m)-X(m-1)-Y(m-1)*(X(m)-X(m-1)-Y(m-2)*(X(m-1)-X(m-2)-Y(m-3)*(X(m-2)-X(m-3)
 *  -Y(m)*(X(m)-X(m-1)-Y(m-1)*(X(m)-X(m-1)-Y(m-2)*(X(m-1)-X(m-2)
 *  -Y(m)*(X(m)-X(m-1)-Y(m-1)*(X(m)-X(m-1)
 *  -Y(m)*(X(m)-X(m-1))
 * ]
 *
 * If as second parameter a number n is given, the returned array
 * X will be the n-th integral, thus above step applied n-times.
 *
 * NOTE: the integral cannot determine the original set of values
 * before "diff" was applied, thus "integral(diff(values)) != values"
 * due to the nature of integration and differentiation. However the
 * shape of the result will be the same, the curve will only be
 * shifted by a constant value. ("translation")
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param xArray
 * @param yArray
 * @param n
 * @returns Array
 */
export function integrateXY(xArray, yArray, n) {
  // recursive calls to get n-th diff
  if(n > 1) {
    yArray = integral(xArray, yArray, n-1);
  }
  // loop through m,...,1 entries of values to get integral
  var keysX = Object.keys(xArray);
  var keysY = Object.keys(yArray);
  var len = Math.min(keysX.length-1, keysY.length-1);
  // NOTE: below we would need X(len+1) & Y(len+1) but both are missing;
  // thus we assume "X(len+1)-X(len)=X(len)-X(len-1)" and "Y(len+1)=0"
  yArray[len] = -yArray[len]*(xArray[keysX[len]]-xArray[keysX[len-1]]);
  for (var k = len-1; k >= 0; k--) {
    yArray[k] = -yArray[keysY[k]]*(xArray[keysX[k+1]]-xArray[keysX[k]])+yArray[keysY[k+1]];
  }

  return yArray;
}
