"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MersenneTwister = require('mersennetwister');
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 *
 * https://stackoverflow.com/a/1527820/25868
 */
function getRandomArbitrary(random, min, max) {
    return random.real() * (max - min) + min;
}
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 *
 * https://stackoverflow.com/a/1527820/25868
 */
function getRandomInt(random, min, max) {
    return Math.floor(random.real() * (max - min + 1)) + min;
}
class Random {
    constructor(seed) {
        this.random = new MersenneTwister(seed);
    }
    //
    // Get a random real number in the requested range.
    //
    getReal(min, max) {
        if (min === undefined) {
            min = Number.MIN_VALUE;
        }
        if (max === undefined) {
            max = Number.MAX_VALUE;
        }
        return getRandomArbitrary(this.random, min, max);
    }
    //
    // Get a random integer in the requested range.
    //
    getInt(min, max) {
        return getRandomInt(this.random, min, max);
    }
}
exports.Random = Random;
//# sourceMappingURL=random.js.map