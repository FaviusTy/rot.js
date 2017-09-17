import Runner from 'eater/lib/runner'
import assert from 'power-assert'
import Dijkstra from '../path/Dijkstra'
import AStar from '../path/AStar'

const test = Runner.test

/**
 * ........
 * A###.###
 * ..B#.#X#
 * .###.###
 * ....Z...
 */
const MAP48 = [/* transposed */
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 1, 1, 0],
]

const PASSABLE_CALLBACK_48 = (x, y) => {
  if (x < 0 || y < 0 || x >= MAP48.length || y >= MAP48[0].length) return false
  return MAP48[x][y] === 0
}

const A = [0, 1]
const B = [2, 2]
const Z = [4, 4]
const X = [6, 2]
let PATH = []
const PATH_CALLBACK = (x, y) => PATH.push(x, y)

/*
 * . . A # . B
 *  . # # . .
 * . . # . . .
 *  # . . # .
 * X # # # Z .
 */
const MAP6 = [/* transposed */
  [0, null, 0, null, 0],
  [null, 0, null, 1, null],
  [0, null, 0, null, 1],
  [null, 1, null, 0, null],
  [0, null, 1, null, 1],
  [null, 1, null, 0, null],
  [1, null, 0, null, 1],
  [null, 0, null, 1, null],
  [0, null, 0, null, 0],
  [null, 0, null, 0, null],
  [0, null, 0, null, 0],
]

const A6 = [4, 0]
const B6 = [10, 0]
const Z6 = [8, 4]
const X6 = [0, 4]

const PASSABLE_CALLBACK_6 = (x, y) => {
  if (x < 0 || y < 0 || x >= MAP6.length || y >= MAP6[0].length) return false
  return MAP6[x][y] === 0
}

let VISITS = 0
const PASSABLE_CALLBACK_VISIT = () => {
  VISITS++;
  return true;
}

const beforeEach = () => {
  PATH = []
  VISITS = 0
}

/* dijkstra */
{
  /* 8-topology */
  {
    const PATH_A = [0, 1, 0, 2, 0, 3, 1, 4, 2, 4, 3, 4, 4, 4]
    const PATH_B = [2, 2, 1, 2, 0, 3, 1, 4, 2, 4, 3, 4, 4, 4]
    const dijkstra = new Dijkstra(Z[0], Z[1], PASSABLE_CALLBACK_48, {topology: 8})

    test("should compute correct path A", () => {
      beforeEach()
      dijkstra.compute(A[0], A[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      dijkstra.compute(B[0], B[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      dijkstra.compute(X[0], X[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })
  }
  /* 4-topology */
  {
    const PATH_A = [0, 1, 0, 2, 0, 3, 0, 4, 1, 4, 2, 4, 3, 4, 4, 4]
    const PATH_B = [2, 2, 1, 2, 0, 2, 0, 3, 0, 4, 1, 4, 2, 4, 3, 4, 4, 4]
    const dijkstra = new Dijkstra(Z[0], Z[1], PASSABLE_CALLBACK_48, {topology: 4})

    test("should compute correct path A", () => {
      beforeEach()
      dijkstra.compute(A[0], A[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      dijkstra.compute(B[0], B[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      dijkstra.compute(X[0], X[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })
  }
  /* 6-topology */
  {
    const PATH_A = [4, 0, 2, 0, 1, 1, 2, 2, 3, 3, 5, 3, 6, 2, 8, 2, 9, 3, 8, 4]
    const PATH_B = [10, 0, 9, 1, 8, 2, 9, 3, 8, 4]
    const dijkstra = new Dijkstra(Z6[0], Z6[1], PASSABLE_CALLBACK_6, {topology: 6})

    test("should compute correct path A", () => {
      beforeEach()
      dijkstra.compute(A6[0], A6[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      dijkstra.compute(B6[0], B6[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      dijkstra.compute(X6[0], X6[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })
  }
}

/* A* */
{
  /* 8-topology */
  {
    const PATH_A = [0, 1, 0, 2, 0, 3, 1, 4, 2, 4, 3, 4, 4, 4]
    const PATH_B = [2, 2, 1, 2, 0, 3, 1, 4, 2, 4, 3, 4, 4, 4]
    const astar = new AStar(Z[0], Z[1], PASSABLE_CALLBACK_48, {topology: 8})

    test("should compute correct path A", () => {
      beforeEach()
      astar.compute(A[0], A[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      astar.compute(B[0], B[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      astar.compute(X[0], X[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })

    test("should efficiently compute path", () => {
      beforeEach()
      const open_astar = new AStar(0, 0, PASSABLE_CALLBACK_VISIT)
      open_astar.compute(50, 0, PATH_CALLBACK)
      assert(VISITS === 400)
    })
  }
  /* 4-topology */
  {
    const PATH_A = [0, 1, 0, 2, 0, 3, 0, 4, 1, 4, 2, 4, 3, 4, 4, 4]
    const PATH_B = [2, 2, 1, 2, 0, 2, 0, 3, 0, 4, 1, 4, 2, 4, 3, 4, 4, 4]
    const astar = new AStar(Z[0], Z[1], PASSABLE_CALLBACK_48, {topology: 4})

    test("should compute correct path A", () => {
      beforeEach()
      astar.compute(A[0], A[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      astar.compute(B[0], B[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      astar.compute(X[0], X[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })
  }
  /* 6-topology */
  {
    const PATH_A = [4, 0, 2, 0, 1, 1, 2, 2, 3, 3, 5, 3, 6, 2, 8, 2, 9, 3, 8, 4]
    const PATH_B = [10, 0, 9, 1, 8, 2, 9, 3, 8, 4]
    const astar = new AStar(Z6[0], Z6[1], PASSABLE_CALLBACK_6, {topology: 6})

    test("should compute correct path A", () => {
      beforeEach()
      astar.compute(A6[0], A6[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_A.toString())
    })

    test("should compute correct path B", () => {
      beforeEach()
      astar.compute(B6[0], B6[1], PATH_CALLBACK)
      assert(PATH.toString() === PATH_B.toString())
    })

    test("should survive non-existant path X", () => {
      beforeEach()
      astar.compute(X6[0], X6[1], PATH_CALLBACK)
      assert(PATH.length === 0)
    })
  }
}