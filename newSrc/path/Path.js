import DIRS from '../constants/DIRS'

/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
export default class Path {
  constructor(toX, toY, passableCallback, options = {}) {
    this._toX = toX
    this._toY = toY
    this._fromX = null
    this._fromY = null
    this._passableCallback = passableCallback
    this._options = Object.assign({ topology: 8 }, options)
    this._dirs = DIRS[this._options.topology]
    if (this._options.topology === 8) {
      /* reorder dirs for more aesthetic result (vertical/horizontal first) */
      this._dirs = [
        this._dirs[0],
        this._dirs[2],
        this._dirs[4],
        this._dirs[6],
        this._dirs[1],
        this._dirs[3],
        this._dirs[5],
        this._dirs[7],
      ]
    }
  }

  /**
   * Compute a path from a given point
   * @param {int} fromX
   * @param {int} fromY
   * @param {function} callback Will be called for every path item with arguments "x" and "y"
   */
  compute(fromX, fromY, callback) {}

  _getNeighbors(cx, cy) {
    const result = []
    return this._dirs.reduce((result, dir) => {
      const [dirX, dirY] = dir
      const x = cx + dirX
      const y = cy + dirY
      if (!this._passableCallback(x, y)) return result
      result.push([x, y])
      return result
    }, [])
  }
}
