import range from '../utils/range'
import zip from '../utils/zip'
import DIRS from '../constants/DIRS'
import RNG from '../rng'
import Map from './Map'

/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
export default class Cellular extends Map {
  constructor(width, height, options = {}) {
    super(width, height)

    this._options = Object.assign(
      {
        born: [5, 6, 7, 8],
        survive: [4, 5, 6, 7, 8],
        topology: 8,
      },
      options,
    )

    this._dirs = DIRS[this._options.topology]
    this._map = this._fillMap(0)
  }

  /**
   * Fill the map with random values
   * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
   */
  randomize(probability) {
    zip(range(this._width), range(this._height)).forEach(([x, y]) => {
      this.map[x][y] = RNG.getUniform() < probability ? 1 : 0
    })

    return this
  }

  /**
   * Change options.
   * @see ROT.Map.Cellular
   */
  setOptions(options = {}) {
    this._options = Object.assign(this._options, options)
  }

  set(x, y, value) {
    this._map[x][y] = value
  }

  create(callback) {
    const newMap = this._fillMap(0)
    const { born, survive, topology } = this._options

    range(this._height).forEach(y => {
      const [widthStep, widthStart] = topology === 6 ? [2, y % 2] : [1, 0]

      for (var x = widthStart; x < this._width; x += widthStep) {
        const cur = this._map[x][y]
        const ncount = this._getNeighbors(x, y)

        /* survive */
        if (cur && survive.indexOf(ncount) !== -1) {
          newMap[x][y] = 1
          continue
        }

        /* born */
        if (!cur && born.indexOf(ncount) !== -1) {
          newMap[x][y] = 1
          continue
        }
      }
    })

    this._map = newMap
    this.serviceCallback(callback)
  }

  serviceCallback(callback) {
    if (!callback) return
    range(this._height).forEach(y => {
      const [widthStep, widthStart] = topology === 6 ? [2, y % 2] : [1, 0]
      for (var x = widthStart; x < this._width; x += widthStep) {
        callback(x, y, this._map[x][y])
      }
    })
  }

  /**
   * Get neighbor count at [i,j] in this._map
   */
  _getNeighbors(cx, cy) {
    var result = 0
    this._dirs.forEach(dir => {
      const x = cx + dir[0]
      const y = cy + dir[1]

      if (x < 0 || x >= this._width || y < 0 || y >= this._height) return
      result += this._map[x][y] == 1 ? 1 : 0
    })

    return result
  }

  /**
   * Make sure every non-wall space is accessible.
   * @param {function} callback to call to display map when do
   * @param {int} value to consider empty space - defaults to 0
   * @param {function} callback to call when a new connection is made
   */
  connect(callback, value, connectionCallback) {
    if (!value) value = 0

    const allFreeSpace = []
    const notConnected = {}
    // find all free space
    const [widthStep, widthStarts] = this._options.topology === 6 ? [2, [0, 1]] : [1, [0, 0]]

    range(this._height).forEach(y => {
      for (var x = widthStarts[y % 2]; x < this._width; x += widthStep) {
        if (this._freeSpace(x, y, value)) {
          const p = [x, y]
          notConnected[this._pointKey(p)] = p
          allFreeSpace.push([x, y])
        }
      }
    })

    const start = allFreeSpace[RNG.getUniformInt(0, allFreeSpace.length - 1)]

    const key = this._pointKey(start)
    const connected = {}
    connected[key] = start
    delete notConnected[key]

    // find what's connected to the starting point
    this._findConnected(connected, notConnected, [start], false, value)

    while (Object.keys(notConnected).length > 0) {
      // find two points from notConnected to connected
      const p = this._getFromTo(connected, notConnected)
      const from = p[0] // notConnected
      const to = p[1] // connected

      // find everything connected to the starting point
      const local = {}
      local[this._pointKey(from)] = from
      this._findConnected(local, notConnected, [from], true, value)

      // connect to a connected cell
      const tunnelFn = this._options.topology == 6 ? this._tunnelToConnected6 : this._tunnelToConnected
      tunnelFn.call(this, to, from, connected, notConnected, value, connectionCallback)

      // now all of local is connected
      for (var k in local) {
        const pp = local[k]
        this._map[pp[0]][pp[1]] = value
        connected[k] = pp
        delete notConnected[k]
      }
    }

    this.serviceCallback(callback)
  }

  /**
   * Find random points to connect. Search for the closest point in the larger space.
   * This is to minimize the length of the passage while maintaining good performance.
   */
  _getFromTo(connected, notConnected) {
    let from, to, d
    const connectedKeys = Object.keys(connected)
    const notConnectedKeys = Object.keys(notConnected)

    for (var i = 0; i < 5; i++) {
      if (connectedKeys.length < notConnectedKeys.length) {
        const keys = connectedKeys
        to = connected[keys[RNG.getUniformInt(0, keys.length - 1)]]
        from = this._getClosest(to, notConnected)
      } else {
        const keys = notConnectedKeys
        from = notConnected[keys[RNG.getUniformInt(0, keys.length - 1)]]
        to = this._getClosest(from, connected)
      }
      d = (from[0] - to[0]) * (from[0] - to[0]) + (from[1] - to[1]) * (from[1] - to[1])
      if (d < 64) break
    }
    // console.log(">>> connected=" + to + " notConnected=" + from + " dist=" + d);
    return [from, to]
  }

  _getClosest(point, space) {
    let minPoint = null
    let minDist = null
    for (k in space) {
      const p = space[k]
      const d = (p[0] - point[0]) * (p[0] - point[0]) + (p[1] - point[1]) * (p[1] - point[1])
      if (!minDist || d < minDist) {
        minDist = d
        minPoint = p
      }
    }
    return minPoint
  }

  _findConnected(connected, notConnected, stack, keepNotConnected, value) {
    while (stack.length > 0) {
      const p = stack.splice(0, 1)[0]
      const tests

      if (this._options.topology == 6) {
        tests = [
          [p[0] + 2, p[1]],
          [p[0] + 1, p[1] - 1],
          [p[0] - 1, p[1] - 1],
          [p[0] - 2, p[1]],
          [p[0] - 1, p[1] + 1],
          [p[0] + 1, p[1] + 1],
        ]
      } else {
        tests = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]]
      }

      range(tests.length).forEach((i) => {
        var key = this._pointKey(tests[i])
        if (connected[key] == null && this._freeSpace(tests[i][0], tests[i][1], value)) {
          connected[key] = tests[i]
          if (!keepNotConnected) delete notConnected[key]
          stack.push(tests[i])
        }
      }) 
    }
  }

  _tunnelToConnected(to, from, connected, notConnected, value, connectionCallback) {
    var key = this._pointKey(from)
    var a, b

    if (from[0] < to[0]) {
      a = from
      b = to
    } else {
      a = to
      b = from
    }

    for (var xx = a[0]; xx <= b[0]; xx++) {
      this._map[xx][a[1]] = value
      var p = [xx, a[1]]
      var pkey = this._pointKey(p)
      connected[pkey] = p
      delete notConnected[pkey]
    }
    if (connectionCallback && a[0] < b[0]) {
      connectionCallback(a, [b[0], a[1]])
    }

    // x is now fixed
    var x = b[0]

    if (from[1] < to[1]) {
      a = from
      b = to
    } else {
      a = to
      b = from
    }

    for (var yy = a[1]; yy < b[1]; yy++) {
      this._map[x][yy] = value
      var p = [x, yy]
      var pkey = this._pointKey(p)
      connected[pkey] = p
      delete notConnected[pkey]
    }
    if (connectionCallback && a[1] < b[1]) {
      connectionCallback([b[0], a[1]], [b[0], b[1]])
    }
  }

  _tunnelToConnected6(to, from, connected, notConnected, value, connectionCallback) {
    var a, b
    if (from[0] < to[0]) {
      a = from
      b = to
    } else {
      a = to
      b = from
    }

    // tunnel diagonally until horizontally level
    var xx = a[0]
    var yy = a[1]
    while (!(xx == b[0] && yy == b[1])) {
      var stepWidth = 2
      if (yy < b[1]) {
        yy++
        stepWidth = 1
      } else if (yy > b[1]) {
        yy--
        stepWidth = 1
      }
      if (xx < b[0]) {
        xx += stepWidth
      } else if (xx > b[0]) {
        xx -= stepWidth
      } else if (b[1] % 2) {
        // Won't step outside map if destination on is map's right edge
        xx -= stepWidth
      } else {
        // ditto for left edge
        xx += stepWidth
      }
      this._map[xx][yy] = value
      var p = [xx, yy]
      var pkey = this._pointKey(p)
      connected[pkey] = p
      delete notConnected[pkey]
    }

    if (connectionCallback) {
      connectionCallback(from, to)
    }
  }

  _freeSpace(x, y, value) {
    return x >= 0 && x < this._width && y >= 0 && y < this._height && this._map[x][y] === value
  }

  _pointKey(p) {
    return p[0] + '.' + p[1]
  }
}
