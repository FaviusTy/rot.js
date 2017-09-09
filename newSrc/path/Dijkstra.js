import Path from './Path'

/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
export default class Dijkstra extends Path {
  constructor(toX, toY, passableCallback, options) {
    super(toX, toY, passableCallback, options)

    this._computed = {}
    this._todo = []
    this._add(toX, toY, null)
  }

  /**
   * Compute a path from a given point
   * @see ROT.Path#compute
   */
  compute(fromX, fromY, callback) {
    var key = fromX+","+fromY
    if (!(key in this._computed)) this._compute(fromX, fromY)
    if (!(key in this._computed)) return

    var item = this._computed[key]
    while (item) {
      callback(item.x, item.y)
      item = item.prev
    }
  }

  /**
   * Compute a non-cached value
   */
  _compute(fromX, fromY) {
    while (this._todo.length) {
      var item = this._todo.shift()
      if (item.x === fromX && item.y === fromY) return

      var neighbors = this._getNeighbors(item.x, item.y)

      for (var i=0;i<neighbors.length;i++) {
        var neighbor = neighbors[i]
        var x = neighbor[0]
        var y = neighbor[1]
        var id = x+","+y
        if (id in this._computed) continue /* already done */
        this._add(x, y, item)
      }
    }
  }

  _add(x, y, prev) {
    var obj = {
      x: x,
      y: y,
      prev: prev,
    }
    this._computed[x+","+y] = obj
    this._todo.push(obj)
  }
}
