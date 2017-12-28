import Display from '../../newSrc/display/Display'
import Digger from '../../newSrc/map/Digger'

class Game {
  constructor() {
    this.display = new Display()
    this.map = {}
    document.body.appendChild(this.display.getContainer())
    this._generateMap()
    this._drawWholeMap()
  }

  _generateMap() {
    const digger = new Digger()
    digger.create((x, y, value) => {
      if (value) return
      this.map[`${x},${y}`] = '.'
    })
  }

  _drawWholeMap() {
    Object.keys(this.map).forEach(vector => {
      const [x, y] = vector
      this.display.draw(parseInt(x), parseInt(y), this.map[vector])
    })
  }
}

const game = new Game()
