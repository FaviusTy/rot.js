import RNG from '../../rng'

/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
export default class Room {
  constructor(x1, y1, x2, y2, doorX, doorY) {
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
    this._doors = {};
    if (doorX && doorY) this.addDoor(doorX, doorY)
  }

  /**
   * Room of random size, with a given doors and direction
   */
  static createRandomAt(x, y, dx, dy, options) {
    var min = options.roomWidth[0]
    var max = options.roomWidth[1]
    var width = RNG.getUniformInt(min, max)

    var min = options.roomHeight[0]
    var max = options.roomHeight[1]
    var height = RNG.getUniformInt(min, max)

    if (dx === 1) { /* to the right */
      var y2 = y - Math.floor(RNG.getUniform() * height)
      return new Room(x+1, y2, x+width, y2+height-1, x, y)
    }

    if (dx === -1) { /* to the left */
      var y2 = y - Math.floor(RNG.getUniform() * height)
      return new Room(x-width, y2, x-1, y2+height-1, x, y)
    }

    if (dy === 1) { /* to the bottom */
      var x2 = x - Math.floor(RNG.getUniform() * width)
      return new Room(x2, y+1, x2+width-1, y+height, x, y)
    }

    if (dy === -1) { /* to the top */
      var x2 = x - Math.floor(RNG.getUniform() * width)
      return new Room(x2, y-height, x2+width-1, y-1, x, y)
    }

    throw new Error("dx or dy must be 1 or -1")
  }

  /**
   * Room of random size, positioned around center coords
   */
  static createRandomCenter(cx, cy, options) {
    var min = options.roomWidth[0]
    var max = options.roomWidth[1]
    var width = RNG.getUniformInt(min, max)

    var min = options.roomHeight[0]
    var max = options.roomHeight[1]
    var height = RNG.getUniformInt(min, max)

    var x1 = cx - Math.floor(RNG.getUniform()*width)
    var y1 = cy - Math.floor(RNG.getUniform()*height)
    var x2 = x1 + width - 1
    var y2 = y1 + height - 1

    return new Room(x1, y1, x2, y2)
  }

  /**
   * Room of random size within a given dimensions
   */
  static createRandom(availWidth, availHeight, options) {
    var min = options.roomWidth[0]
    var max = options.roomWidth[1]
    var width = RNG.getUniformInt(min, max)

    var min = options.roomHeight[0]
    var max = options.roomHeight[1]
    var height = RNG.getUniformInt(min, max)

    var left = availWidth - width - 1
    var top = availHeight - height - 1

    var x1 = 1 + Math.floor(RNG.getUniform()*left)
    var y1 = 1 + Math.floor(RNG.getUniform()*top)
    var x2 = x1 + width - 1
    var y2 = y1 + height - 1

    return new Room(x1, y1, x2, y2)
  }

  addDoor(x, y) {
    this._doors[x+","+y] = 1
    return this
  }

  /**
   * @param {function}
   */
  getDoors(callback) {
    for (var key in this._doors) {
      var parts = key.split(",")
      callback(parseInt(parts[0]), parseInt(parts[1]))
    }
    return this
  }

  clearDoors() {
    this._doors = {}
    return this
  }

  addDoors(isWallCallback) {
    var left = this._x1-1
    var right = this._x2+1
    var top = this._y1-1
    var bottom = this._y2+1

    for (var x=left; x<=right; x++) {
      for (var y=top; y<=bottom; y++) {
        if (x !== left && x !== right && y !== top && y !== bottom) continue
        if (isWallCallback(x, y)) continue

        this.addDoor(x, y)
      }
    }

    return this
  }

  debug() {
    console.log("room", this._x1, this._y1, this._x2, this._y2)
  }

  isValid(isWallCallback, canBeDugCallback) {
    var left = this._x1-1;
    var right = this._x2+1;
    var top = this._y1-1;
    var bottom = this._y2+1;

    for (var x=left; x<=right; x++) {
      for (var y=top; y<=bottom; y++) {
        if (x === left || x === right || y === top || y === bottom) {
          if (!isWallCallback(x, y)) return false
        }
        else {
          if (!canBeDugCallback(x, y)) return false
        }
      }
    }

    return true
  }

  /**
   * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
   */
  create(digCallback) {
    var left = this._x1-1
    var right = this._x2+1
    var top = this._y1-1
    var bottom = this._y2+1

    var value = 0
    for (var x=left; x<=right; x++) {
      for (var y=top; y<=bottom; y++) {
        if (x+","+y in this._doors) {
          value = 2;
        }
        else if (x === left || x === right || y === top || y === bottom) {
          value = 1;
        }
        else {
          value = 0;
        }
        digCallback(x, y, value)
      }
    }
  }

  getCenter() {
    return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)]
  }

  getLeft() {
    return this._x1
  }

  getRight() {
    return this._x2
  }

  getTop() {
    return this._y1
  }

  getBottom() {
    return this._y2
  }
}
