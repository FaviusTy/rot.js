import Display from '../../newSrc/display/Display'

class Game {
  constructor() {
    this.display = new Display()
    document.body.appendChild(this.display.getContainer())
  }
}

const game = new Game()
