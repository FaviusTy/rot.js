import Runner from 'eater/lib/runner'
import assert from 'power-assert'

import SimpleScheduler from '../scheduler/SimpleScheduler'
import SpeedScheduler from '../scheduler/SpeedScheduler'
import ActionScheduler from '../scheduler/ActionScheduler'

const test = Runner.test

// Simple
{
  const A1 = "A1"
  const A2 = "A2"
  const A3 = "A3"

  test("should schedule actors evenly", () => {
    var S = new SimpleScheduler()
    S.add(A1, true)
    S.add(A2, true)
    S.add(A3, true)
    var result = []
    for (var i = 0; i < 6; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A2, A3, A1, A2, A3])
  })

  test("should schedule one-time events", () => {
    var S = new SimpleScheduler()
    S.add(A1, false)
    S.add(A2, true)
    var result = []
    for (var i = 0; i < 4; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A2, A2, A2])
  })

  test("should remove repeated events", () => {
    var S = new SimpleScheduler()
    S.add(A1, false)
    S.add(A2, true)
    S.add(A3, true)
    S.remove(A2)
    var result = []
    for (var i = 0; i < 4; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A3, A3, A3])
  })

  test("should remove one-time events", () => {
    var S = new SimpleScheduler()
    S.add(A1, false)
    S.add(A2, false)
    S.add(A3, true)
    S.remove(A2)
    var result = []
    for (var i = 0; i < 4; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A3, A3, A3])
  })
}

// Speed
{
  class Action {
    constructor(speed) {
      this._speed = speed
    }

    getSpeed() {
      return this._speed
    }
  }

  var A50 = new Action(50)
  var A100a = new Action(100)
  var A100b = new Action(100)
  var A200 = new Action(200)

  test("should schedule same speed evenly", () => {
    var S = new SpeedScheduler()
    S.add(A100a, true)
    S.add(A100b, true)
    var result = []
    for (var i = 0; i < 4; i++) {
      result.push(S.next())
    }

    assert.deepEqual(result, [A100a, A100b, A100a, A100b])
  })

  test("should schedule different speeds properly", () => {
    var S = new SpeedScheduler()
    S.add(A50, true)
    S.add(A100a, true)
    S.add(A200, true)
    var result = []
    for (var i = 0; i < 7; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A200, A100a, A200, A200, A50, A100a, A200])
  })

  test("should schedule with initial offsets", () => {
    var S = new SpeedScheduler()
    S.add(A50, true, 1 / 300)
    S.add(A100a, true, 0)
    S.add(A200, true)
    var result = []
    for (var i = 0; i < 9; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A100a, A50, A200, A100a, A200, A200, A100a, A200, A50])
  })

  test("should look up the time of an event", () => {
    var S = new SpeedScheduler()
    S.add(A100a, true)
    S.add(A50, true, 1 / 200)
    assert(S.getTimeOf(A50) === 1 / 200)
    assert(S.getTimeOf(A100a) === 1 / 100)
  })
}

// Action
{
  var A1 = "A1"
  var A2 = "A2"
  var A3 = "A3"

  test("should schedule evenly by default", () => {
    const S = new ActionScheduler()
    S.add(A1, true)
    S.add(A2, true)
    S.add(A3, true)
    var result = []
    for (var i = 0; i < 6; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A2, A3, A1, A2, A3])
  })

  test("should schedule with respect to extra argument", () => {
    const S = new ActionScheduler()
    S.add(A1, true)
    S.add(A2, true, 2)
    S.add(A3, true)
    var result = []
    for (var i = 0; i < 6; i++) {
      result.push(S.next())
    }
    assert.deepEqual(result, [A1, A3, A2, A1, A3, A2])
  })

  test("should schedule with respect to action duration", () => {
    const S = new ActionScheduler()
    S.add(A1, true)
    S.add(A2, true)
    S.add(A3, true)
    var result = []

    result.push(S.next())
    S.setDuration(10)

    result.push(S.next())
    S.setDuration(5)

    result.push(S.next())
    S.setDuration(1)
    assert(S.getTime() === 1)

    for (var i = 0; i < 3; i++) {
      result.push(S.next())
      S.setDuration(100)
      /* somewhere in the future */
    }

    assert.deepEqual(result, [A1, A2, A3, A3, A2, A1])
  })
}
