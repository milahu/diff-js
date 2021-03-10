// just a helper tool for development
// run with `npm run benchmark`

import Race from 'exacta';

// base version
import { localExtrema as localExtrema_1 } from '../src/local-extrema.js';

// new versions
import { localExtrema as localExtrema_2 } from '../src/local-extrema.2.js';
import { localExtrema as localExtrema_3 } from '../src/local-extrema.3.js';

const data = (
	Array.from({ length: 100 })
	.map(_ => 1000*Math.random())
);

const options = {};

new Race()
  .setRuns(10000)
  .setSamples(20)
  .setWarmup(1000)
  .addFn(localExtrema_1)
  .addFn(localExtrema_2)
  .addFn(localExtrema_3)
  .setParams(data, options)
  .run()
