import Runner from 'eater/lib/runner'
import assert from 'power-assert'
import FOV from '../fov/FOV'
import DiscreteShadowcasting from '../fov/DiscreteShadowcasting'
import PreciseShadowcasting from '../fov/PreciseShadowcasting'
import RecursiveShadowcasting from '../fov/RecursiveShadowcasting'

const test = Runner.test

test('FOV', () => {
  const MAP8_RING0 = ['#####', '#####', '##@##', '#####', '#####']

  const RESULT_MAP8_RING0 = ['     ', ' ... ', ' ... ', ' ... ', '     ']

  const RESULT_MAP8_RING0_90_NORTH = ['     ', ' ... ', '  .  ', '     ', '     ']

  const RESULT_MAP8_RING0_90_SOUTH = ['     ', '     ', '  .  ', ' ... ', '     ']

  const RESULT_MAP8_RING0_90_EAST = ['     ', '   . ', '  .. ', '   . ', '     ']

  const RESULT_MAP8_RING0_90_WEST = ['     ', ' .   ', ' ..  ', ' .   ', '     ']

  const RESULT_MAP8_RING0_180_NORTH = ['     ', ' ... ', ' ... ', '     ', '     ']

  const RESULT_MAP8_RING0_180_SOUTH = ['     ', '     ', ' ... ', ' ... ', '     ']

  const RESULT_MAP8_RING0_180_EAST = ['     ', '  .. ', '  .. ', '  .. ', '     ']

  const RESULT_MAP8_RING0_180_WEST = ['     ', ' ..  ', ' ..  ', ' ..  ', '     ']

  const MAP8_RING1 = ['#####', '#...#', '#.@.#', '#...#', '#####']

  const MAP8_PARTIAL = ['#####', '##..#', '#.@.#', '#...#', '#####']

  const RESULT_MAP8_RING1 = ['.....', '.....', '.....', '.....', '.....']

  const buildLightCallback = map => {
    let center = [0, 0]
    /* locate center */
    for (var j = 0; j < map.length; j++) {
      for (var i = 0; i < map[j].length; i++) {
        if (map[j].charAt(i) === '@') {
          center = [i, j]
        }
      }
    }

    const result = function(x, y) {
      const ch = map[y].charAt(x)
      return ch !== '#'
    }
    result.center = center
    return result
  }

  const checkResult = (fov, center, result) => {
    const used = {}
    const callback = (x, y) => {
      assert(result[y].charAt(x) === '.')
      used[`${x},${y}`] = 1
    }

    fov.compute(center[0], center[1], 2, callback)

    for (let j = 0; j < result.length; j++) {
      for (let i = 0; i < result[j].length; i++) {
        if (result[j].charAt(i) !== '.') continue
        assert(i + ',' + j in used)
      }
    }
  }

  const checkResult90Degrees = (fov, dir, center, result) => {
    const used = {}
    const callback = (x, y) => {
      assert(result[y].charAt(x) === '.')
      used[x + ',' + y] = 1
    }

    fov.compute90(center[0], center[1], 2, dir, callback)
    for (let j = 0; j < result.length; j++) {
      for (let i = 0; i < result[j].length; i++) {
        if (result[j].charAt(i) !== '.') continue
        assert(i + ',' + j in used)
      }
    }
  }

  const checkResult180Degrees = (fov, dir, center, result) => {
    const used = {}
    const callback = (x, y) => {
      assert(result[y].charAt(x) === '.')
      used[x + ',' + y] = 1
    }

    fov.compute180(center[0], center[1], 2, dir, callback)
    for (let j = 0; j < result.length; j++) {
      for (let i = 0; i < result[j].length; i++) {
        if (result[j].charAt(i) !== '.') continue
        assert(i + ',' + j in used)
      }
    }
  }

  test('Discrete Shadowcasting', () => {
    test('8-topology', () => {
      test('should compute visible ring0', () => {
        const lightPasses = buildLightCallback(MAP8_RING0)
        const fov = new DiscreteShadowcasting(lightPasses, { topology: 8 })
        checkResult(fov, lightPasses.center, RESULT_MAP8_RING0)
      })
      test('should compute visible ring1', () => {
        const lightPasses = buildLightCallback(MAP8_RING1)
        const fov = new DiscreteShadowcasting(lightPasses, { topology: 8 })
        checkResult(fov, lightPasses.center, RESULT_MAP8_RING1)
      })
    })
  })

  test('Precise Shadowcasting', () => {
    test('8-topology', () => {
      const topology = 8
      test('should compute visible ring0', () => {
        const lightPasses = buildLightCallback(MAP8_RING0)
        const fov = new PreciseShadowcasting(lightPasses, { topology: topology })
        checkResult(fov, lightPasses.center, RESULT_MAP8_RING0)
      })
      test('should compute visible ring1', () => {
        const lightPasses = buildLightCallback(MAP8_RING1)
        const fov = new PreciseShadowcasting(lightPasses, { topology: topology })
        checkResult(fov, lightPasses.center, RESULT_MAP8_RING1)
      })
      // xit("should compute single visible target", function() {
      //   var lightPasses = buildLightCallback(MAP8_RING1);
      //   var fov = new PreciseShadowcasting(lightPasses, {topology:topology});
      //   var result = fov.computeSingle(lightPasses.center[0], lightPasses.center[1], 2, 0, 1);
      //   expect(result).toBe(1);
      // });
      // xit("should compute single invisible target", function() {
      //   var lightPasses = buildLightCallback(MAP8_RING0);
      //   var fov = new PreciseShadowcasting(lightPasses, {topology:topology});
      //   var result = fov.computeSingle(lightPasses.center[0], lightPasses.center[1], 2, 0, 1);
      //   expect(result).toBe(0);
      // });
      // xit("should compute single partially visible target", function() {
      //   var lightPasses = buildLightCallback(MAP8_PARTIAL);
      //   var fov = new PreciseShadowcasting(lightPasses, {topology:topology});
      //   var result = fov.computeSingle(lightPasses.center[0], lightPasses.center[1], 2, 0, 1);
      //   expect(result).toBe(0.5);
      // });
    })
  })

  test('Recursive Shadowcasting', () => {
    test('8-topology', () => {
      test('360-degree view', () => {
        test('should compute visible ring0 in 360 degrees', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult(fov, lightPasses.center, RESULT_MAP8_RING0)
        })
        test('should compute visible ring1 in 360 degrees', () => {
          const lightPasses = buildLightCallback(MAP8_RING1)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult(fov, lightPasses.center, RESULT_MAP8_RING1)
        })
      })
      test('180-degree view', () => {
        test('should compute visible ring0 180 degrees facing north', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult180Degrees(fov, 0, lightPasses.center, RESULT_MAP8_RING0_180_NORTH)
        })
        test('should compute visible ring0 180 degrees facing south', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult180Degrees(fov, 4, lightPasses.center, RESULT_MAP8_RING0_180_SOUTH)
        })
        test('should compute visible ring0 180 degrees facing east', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult180Degrees(fov, 2, lightPasses.center, RESULT_MAP8_RING0_180_EAST)
        })
        test('should compute visible ring0 180 degrees facing west', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult180Degrees(fov, 6, lightPasses.center, RESULT_MAP8_RING0_180_WEST)
        })
      })
      test('90-degree view', () => {
        test('should compute visible ring0 90 degrees facing north', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult90Degrees(fov, 0, lightPasses.center, RESULT_MAP8_RING0_90_NORTH)
        })
        test('should compute visible ring0 90 degrees facing south', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult90Degrees(fov, 4, lightPasses.center, RESULT_MAP8_RING0_90_SOUTH)
        })
        test('should compute visible ring0 90 degrees facing east', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult90Degrees(fov, 2, lightPasses.center, RESULT_MAP8_RING0_90_EAST)
        })
        test('should compute visible ring0 90 degrees facing west', () => {
          const lightPasses = buildLightCallback(MAP8_RING0)
          const fov = new RecursiveShadowcasting(lightPasses, { topology: 8 })
          checkResult90Degrees(fov, 6, lightPasses.center, RESULT_MAP8_RING0_90_WEST)
        })
      })
    })
  })
}) /* FOV */
