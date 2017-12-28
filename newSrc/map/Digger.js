import DIRS from '../constants/DIRS'
import RNG from '../rng'
import pick from '../utils/pick'

import Dungeon from './Dungeon'
import Room from './features/Room'
import Corridor from './features/Corridor'

/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
 * @augments ROT.Map.Dungeon
 */
export default class Digger extends Dungeon {
  constructor(width, height, options = {}) {
    super(width, height)

    this._options = Object.assign(
      {
        roomWidth: [3, 9] /* room minimum and maximum width */,
        roomHeight: [3, 5] /* room minimum and maximum height */,
        corridorLength: [3, 10] /* corridor minimum and maximum length */,
        dugPercentage: 0.2 /* we stop after this percentage of level area has been dug out */,
        timeLimit: 1000 /* we stop after this much time has passed (msec) */,
      },
      options,
    )

    this._features = {
      Room: 4,
      Corridor: 4,
    }
    this._featureAttempts = 20 /* how many times do we try to create a feature on a suitable wall */
    this._walls = {} /* these are available for digging */
  }

  /**
   * Create a map
   * @see ROT.Map#create
   */
  create(callback) {
    this._rooms = []
    this._corridors = []
    this._map = this._fillMap(1)
    this._walls = {}
    this._dug = 0
    var area = (this._width - 2) * (this._height - 2)

    this._firstRoom()

    var t1 = Date.now()

    do {
      var t2 = Date.now()
      if (t2 - t1 > this._options.timeLimit) break

      /* find a good wall */
      var wall = this._findWall()
      if (!wall) break /* no more walls */

      var parts = wall.split(',')
      var x = parseInt(parts[0])
      var y = parseInt(parts[1])
      var dir = this._getDiggingDirection(x, y)
      if (!dir) continue /* this wall is not suitable */

      /* try adding a feature */
      var featureAttempts = 0
      do {
        featureAttempts++
        if (this._tryFeature(x, y, dir[0], dir[1])) {
          /* feature added */
          //if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
          this._removeSurroundingWalls(x, y)
          this._removeSurroundingWalls(x - dir[0], y - dir[1])
          break
        }
      } while (featureAttempts < this._featureAttempts)

      var priorityWalls = 0
      for (var id in this._walls) {
        if (this._walls[id] > 1) priorityWalls++
      }
    } while (this._dug / area < this._options.dugPercentage || priorityWalls) /* fixme number of priority walls */

    this._addDoors()

    if (callback) {
      for (var i = 0; i < this._width; i++) {
        for (var j = 0; j < this._height; j++) {
          callback(i, j, this._map[i][j])
        }
      }
    }

    this._walls = {}
    this._map = null

    return this
  }

  _digCallback(x, y, value) {
    if (value === 0 || value === 2) {
      /* empty */
      this._map[x][y] = 0
      this._dug++
    } else {
      /* wall */
      this._walls[x + ',' + y] = 1
    }
  }

  _isWallCallback(x, y) {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) return false
    return this._map[x][y] === 1
  }

  _canBeDugCallback(x, y) {
    if (x < 1 || y < 1 || x + 1 >= this._width || y + 1 >= this._height) return false
    return this._map[x][y] === 1
  }

  _priorityWallCallback(x, y) {
    this._walls[x + ',' + y] = 2
  }

  _firstRoom() {
    var cx = Math.floor(this._width / 2)
    var cy = Math.floor(this._height / 2)
    var room = Room.createRandomCenter(cx, cy, this._options)
    this._rooms.push(room)
    room.create((...args) => this._digCallback(...args))
  }

  /**
   * Get a suitable wall
   */
  _findWall() {
    var prio1 = []
    var prio2 = []
    for (var id in this._walls) {
      var prio = this._walls[id]
      if (prio === 2) {
        prio2.push(id)
      } else {
        prio1.push(id)
      }
    }

    var arr = prio2.length ? prio2 : prio1
    if (!arr.length) return null /* no walls :/ */

    var id = pick(arr.sort()) // sort to make the order deterministic
    delete this._walls[id]

    return id
  }

  /**
   * Tries adding a feature
   * @returns {boolean} was this a successful try?
   */
  _tryFeature(x, y, dx, dy) {
    const featureType = RNG.getWeightedValue(this._features)
    const creator = featureType === 'Corridor' ? Corridor.createRandomAt : Room.createRandomAt
    const feature = creator(x, y, dx, dy, this._options)

    if (!feature.isValid((...args) => this._isWallCallback(...args), (...args) => this._canBeDugCallback(...args)))
      return false

    feature.create((...args) => this._digCallback(...args))

    if (feature instanceof Room) this._rooms.push(feature)
    if (feature instanceof Corridor) {
      feature.createPriorityWalls((...args) => this._priorityWallCallback(...args))
      this._corridors.push(feature)
    }

    return true
  }

  _removeSurroundingWalls(cx, cy) {
    var deltas = DIRS[4]

    for (var i = 0; i < deltas.length; i++) {
      var delta = deltas[i]
      var x = cx + delta[0]
      var y = cy + delta[1]
      delete this._walls[x + ',' + y]
      var x = cx + 2 * delta[0]
      var y = cy + 2 * delta[1]
      delete this._walls[x + ',' + y]
    }
  }

  /**
   * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
   */
  _getDiggingDirection(cx, cy) {
    if (cx <= 0 || cy <= 0 || cx >= this._width - 1 || cy >= this._height - 1) return null

    var result = null
    var deltas = DIRS[4]

    for (var i = 0; i < deltas.length; i++) {
      var delta = deltas[i]
      var x = cx + delta[0]
      var y = cy + delta[1]

      if (!this._map[x][y]) {
        /* there already is another empty neighbor! */
        if (result) return null
        result = delta
      }
    }

    /* no empty neighbor */
    if (!result) return null

    return [-result[0], -result[1]]
  }

  /**
   * Find empty spaces surrounding rooms, and apply doors.
   */
  _addDoors() {
    const data = this._map
    const isWallCallback = (x, y) => data[x][y] === 1
    for (var i = 0; i < this._rooms.length; i++) {
      var room = this._rooms[i]
      room.clearDoors()
      room.addDoors(isWallCallback)
    }
  }
}
