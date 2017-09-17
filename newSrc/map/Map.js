import DISPLAY from '../constants/DISPLAY'
const {DEFAULT_WIDTH, DEFAULT_HEIGHT} = DISPLAY
/**
 * @class Base map generator
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 */
export default class Map {
	constructor(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    this._width = width
    this._height = height
  }

  create(callback) {};

  _fillMap(value) {
    var map = []
    for (var i=0;i<this._width;i++) {
      map.push([])
      for (var j=0;j<this._height;j++) { map[i].push(value) }
    }
    return map
  }
}
