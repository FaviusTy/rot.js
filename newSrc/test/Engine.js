import Runner from 'eater/lib/runner'
import assert from 'power-assert'

import Engine from '../Engine'
import SpeedScheduler from '../scheduler/SpeedScheduler'

const test = Runner.test

let RESULT = 0
let S = new SpeedScheduler()
let E = new Engine(S)

const A50 = {
  getSpeed: () => 50, act: () => {
    RESULT++
  }
}
const A70 = {
  getSpeed: () => 70, act: () => {
    RESULT++;
    S.add(A100)
  }
}
const A100 = {
  getSpeed: () => 100, act: () => {
    E.lock()
  }
}

test("should stop when locked", () => {
  RESULT = 0
  S = new SpeedScheduler()
  E = new Engine(S)
  S.add(A50, true)
  S.add(A100, true)

  E.start()
  assert(RESULT === 0)
})

test("should run until locked", () => {
  RESULT = 0
  S = new SpeedScheduler()
  E = new Engine(S)
  S.add(A50, true)
  S.add(A70, true)

  E.start()
  assert(RESULT === 2)
})

test("should run only when unlocked", () => {
  RESULT = 0
  S = new SpeedScheduler()
  E = new Engine(S)
  S.add(A70, true)

  E.lock()
  E.start()
  assert(RESULT === 0)
  E.start()
  assert(RESULT === 1)
})
