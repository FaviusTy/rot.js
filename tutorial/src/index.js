import Display from '../../newSrc/display/Display'
import Digger from '../../newSrc/map/Digger'
import RNG from '../../newSrc/rng'

class Game {
  constructor() {
    this.display = new Display()
    this.map = {}
    document.body.appendChild(this.display.getContainer())
    this._generateMap()
    this._generateBoxes([])
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
      const [x, y] = vector.split(',')
      this.display.draw(parseInt(x), parseInt(y), this.map[vector])
    })
  }

  _generateBoxes(freeCells) {
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(RNG.getUniform() * freeCells.length)
      const key = freeCells.splice(index, 1)[0]
      this.map[key] = '*'
    }
  }
}

const game = new Game()
