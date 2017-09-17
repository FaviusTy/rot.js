import Map from './Map'

/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
export default class Arena extends Map {
  constructor(width, height) {
    super(width, height);
  }


  create(callback) {
    var w = this._width-1
    var h = this._height-1
    for (var i=0;i<=w;i++) {
      for (var j=0;j<=h;j++) {
        var empty = (i && j && i<w && j<h)
        callback(i, j, empty ? 0 : 1)
      }
    }
    return this
  }
}
