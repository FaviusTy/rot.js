import DIRS from '../../newSrc/constants/DIRS'
import KEYSET from '../../newSrc/constants/KEYSET'
import Display from '../../newSrc/display/Display'
import Engine from '../../newSrc/Engine'
import Scheduler from '../../newSrc/scheduler/SimpleScheduler'
import Digger from '../../newSrc/map/Digger'
import RNG from '../../newSrc/rng'
import range from '../../newSrc/utils/range'

class Player {
  constructor(x = 0, y = 0, game) {
    this.x = x
    this.y = y
    this._game = game
    this.KEY_MAP = {
      [KEYSET.VK_UP]: 0,
      [KEYSET.VK_PAGE_UP]: 1,
      [KEYSET.VK_RIGHT]: 2,
      [KEYSET.VK_PAGE_DOWN]: 3,
      [KEYSET.VK_DOWN]: 4,
      [KEYSET.VK_END]: 5,
      [KEYSET.VK_LEFT]: 6,
      [KEYSET.VK_HOME]: 7,
    }
    this._draw()
  }

  _draw() {
    this._game.display.draw(this.x, this.y, '@', '#ff0')
  }

  act() {
    this._game.engine.lock()
    window.addEventListener('keydown', this)
  }

  _checkBox() {
    const key = `${this.x},${this.y}`
    if (this._game.map[key] !== '*') return
    if (this._game.ananas === key) {
      alert('Hooray! You found an ananas and won this Game!')
      this._game.engine.lock()
      return window.removeEventListener('keydown', this)
    }

    alert('This box is empty :-(')
  }

  handleEvent(e) {
    const code = e.keyCode
    if (code === KEYSET.VK_SPACE || code === KEYSET.VK_ENTER) {
      this._checkBox()
      return
    }
    if (!Object.keys(this.KEY_MAP).includes(`${code}`)) return
    console.log('includes')

    const [diffX, diffY] = DIRS[8][this.KEY_MAP[code]]
    const newX = this.x + diffX
    const newY = this.y + diffY
    if (!Object.keys(this._game.map).includes(`${newX},${newY}`)) return

    this._game.display.draw(this.x, this.y, this._game.map[`${this.x},${this.y}`])
    this.x = newX
    this.y = newY
    this._draw()
    window.removeEventListener('keydown', this)
    this._game.engine.unlock()
  }
}

class Pedro extends Player {
  _draw() {
    this._game.display.draw(this.x, this.y, 'P', 'red')
  }

  act() {}

  handleEvent() {}
}

class Game {
  constructor() {
    this.display = new Display()
    this.player = null
    this.freeCells = []
    this.map = {}
    document.body.appendChild(this.display.getContainer())
    this._generateMap()
    this._generateBoxes()
    this._drawWholeMap()
    this.player = this._createBeing(Player, this.freeCells)
    this.pedro = this._createBeing(Pedro, this.freeCells)
    const scheduler = new Scheduler()
    scheduler.add(this.player, true)
    scheduler.add(this.pedro, true)
    this.engine = new Engine(scheduler)
    this.engine.start()
  }

  _createBeing(what, freeCells = []) {
    const index = Math.floor(RNG.getUniform() * freeCells.length)
    const keys = freeCells.splice(index, 1)[0]
    const [x, y] = keys.split(',')
    return new what(+x, +y, this)
  }

  _generateMap() {
    const digger = new Digger()
    digger.create((x, y, value) => {
      if (value) return
      const key = `${x},${y}`
      this.freeCells.push(key)
      this.map[key] = '.'
    })
  }

  _drawWholeMap() {
    Object.keys(this.map).forEach(vector => {
      const [x, y] = vector.split(',')
      this.display.draw(parseInt(x), parseInt(y), this.map[vector])
    })
  }

  _generateBoxes() {
    range(10).forEach(i => {
      const index = Math.floor(RNG.getUniform() * this.freeCells.length)
      const key = this.freeCells.splice(index, 1)[0]
      this.map[key] = '*'
      if (i === 0) this.ananas = key
    })
  }
}

const game = new Game()
