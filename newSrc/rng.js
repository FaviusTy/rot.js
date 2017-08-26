/**
 * @namespace
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
class RNG {

  constructor() {
    this._s0 = 0
    this._s1 = 0
    this._s2 = 0
    this._c = 0
    this._frac = 2.3283064365386963e-10 /* 2^-32 */
    this.seed = Date.now()
  }

  /**
   * @returns {number}
   */
  get seed() {
    return this._seed;
  }

  /**
   * @param {number} seed Seed the number generator
   */
  set seed(seed) {
    seed = (seed < 1 ? 1/seed : seed);

    this._seed = seed;
    this._s0 = (seed >>> 0) * this._frac;

    seed = (seed*69069 + 1) >>> 0;
    this._s1 = seed * this._frac;

    seed = (seed*69069 + 1) >>> 0;
    this._s2 = seed * this._frac;

    this._c = 1;
    return this;
  }

  /**
   * @returns {float} Pseudorandom value [0,1), uniformly distributed
   */
  getUniform() {
    const t = 2091639 * this._s0 + this._c * this._frac;
    this._s0 = this._s1;
    this._s1 = this._s2;
    this._c = t | 0;
    this._s2 = t - this._c;
    return this._s2;
  }

  /**
   * @param {int} lowerBound The lower end of the range to return a value from, inclusive
   * @param {int} upperBound The upper end of the range to return a value from, inclusive
   * @returns {int} Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
   */
  getUniformInt(lowerBound, upperBound) {
    const max = Math.max(lowerBound, upperBound);
    const min = Math.min(lowerBound, upperBound);
    return Math.floor(this.getUniform() * (max - min + 1)) + min;
  }

  /**
   * @param {float} [mean=0] Mean value
   * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
   * @returns {float} A normally distributed pseudorandom value
   */
  getNormal(mean, stddev) {
    let u = null
    let r = null

    do {
      const u = 2 * this.getUniform() - 1
      const v = 2 * this.getUniform() - 1
      r = u * u + v * v
    } while (r > 1 || r === 0)

    const gauss = u * Math.sqrt( -2 * Math.log(r) / r)
    return (mean || 0) + gauss * (stddev || 1)
  }

  /**
   * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
   */
  getPercentage() {
    return 1 + Math.floor(this.getUniform() * 100)
  }

  /**
   * @param {object} data key=whatever, value=weight (relative probability)
   * @returns {string} whatever
   */
  getWeightedValue(data) {
    const total = data.reduce((total, value) => total + value, 0)
    const random = this.getUniform() * total

    let part = 0

    for (var id in data) {
      part += data[id];
      if (random < part) return id
    }

    // If by some floating-point annoyance we have
    // random >= total, just return the last id.
    return id
  }

  /**
   * Get RNG state. Useful for storing the state and re-setting it via setState.
   * @returns {?} Internal state
   */
  get state() {
    return [this._s0, this._s1, this._s2, this._c];
  }

  /**
   * Set a previously retrieved state.
   * @param {?} state
   */
  set state(state) {
    this._s0 = state[0];
    this._s1 = state[1];
    this._s2 = state[2];
    this._c  = state[3];
    return this;
  }

  /**
   * Returns a cloned RNG
   */
  clone() {
    const clone = Object.create(this)
    clone.state = this.state
    return clone
  }
}
const instance = new RNG()
export default instance
