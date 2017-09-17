import RNG from '../../rng'

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
export default class Corridor {
  constructor(startX, startY, endX, endY) {
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this._endsWithAWall = true;
  }

  static createRandomAt(x, y, dx, dy, options) {
    var min = options.corridorLength[0]
    var max = options.corridorLength[1]
    var length = RNG.getUniformInt(min, max)

    return new Corridor(x, y, x + dx*length, y + dy*length)
  }

  debug() {
    console.log("corridor", this._startX, this._startY, this._endX, this._endY)
  }

  isValid(isWallCallback, canBeDugCallback){
    var sx = this._startX
    var sy = this._startY
    var dx = this._endX-sx
    var dy = this._endY-sy
    var length = 1 + Math.max(Math.abs(dx), Math.abs(dy))

    if (dx) dx = dx/Math.abs(dx)
    if (dy) dy = dy/Math.abs(dy)
    var nx = dy
    var ny = -dx

    var ok = true
    for (var i=0; i<length; i++) {
      var x = sx + i*dx
      var y = sy + i*dy

      if (!canBeDugCallback(     x,      y)) ok = false
      if (!isWallCallback  (x + nx, y + ny)) ok = false
      if (!isWallCallback  (x - nx, y - ny)) ok = false

      if (!ok) {
        length = i
        this._endX = x-dx
        this._endY = y-dy
        break
      }
    }

    /**
     * If the length degenerated, this corridor might be invalid
     */

    /* not supported */
    if (length === 0) return false

    /* length 1 allowed only if the next space is empty */
    if (length === 1 && isWallCallback(this._endX + dx, this._endY + dy)) return false

    /**
     * We do not want the corridor to crash into a corner of a room;
     * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
     *
     * Situation:
     * #######1
     * .......?
     * #######2
     *
     * The corridor was dug from left to right.
     * 1, 2 - problematic corners, ? = N+1th cell (not dug)
     */
    var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny)
    var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny)
    this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy)
    return !((firstCornerBad || secondCornerBad) && this._endsWithAWall)
  }

  /**
   * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
   */
  create(digCallback) {
    var sx = this._startX
    var sy = this._startY
    var dx = this._endX-sx
    var dy = this._endY-sy
    var length = 1+Math.max(Math.abs(dx), Math.abs(dy))

    if (dx) dx = dx/Math.abs(dx)
    if (dy) dy = dy/Math.abs(dy)
    var nx = dy
    var ny = -dx

    for (var i=0; i<length; i++) {
      var x = sx + i*dx
      var y = sy + i*dy
      digCallback(x, y, 0)
    }

    return true
  }

  createPriorityWalls(priorityWallCallback) {
    if (!this._endsWithAWall) return

    var sx = this._startX
    var sy = this._startY

    var dx = this._endX-sx
    var dy = this._endY-sy
    if (dx) dx = dx/Math.abs(dx)
    if (dy) dy = dy/Math.abs(dy)
    var nx = dy
    var ny = -dx

    priorityWallCallback(this._endX + dx, this._endY + dy)
    priorityWallCallback(this._endX + nx, this._endY + ny)
    priorityWallCallback(this._endX - nx, this._endY - ny)
  }
}
