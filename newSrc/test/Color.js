import assert from 'power-assert'
import Color from '../Color'

// add
assert.deepEqual(Color.add([1, 2, 3], [3, 4, 5]), [4, 6, 8], 'should add two colors')
assert.deepEqual(Color.add([1, 2, 3], [3, 4, 5], [100, 200, 300]), [104, 206, 308], 'should add three colors')
assert.deepEqual(Color.add([1, 2, 3]), [1, 2, 3], 'should add one color (noop)')
{
  const c1 = [1, 2, 3]
  Color.add(c1, [3, 4, 5])
  assert.deepEqual(c1, [1, 2, 3], 'should not modify first argument values')
}

// add_
assert.deepEqual(Color.add_([1, 2, 3], [3, 4, 5]), [4, 6, 8], 'should add two colors')
assert.deepEqual(Color.add_([1, 2, 3], [3, 4, 5], [100, 200, 300]), [104, 206, 308], 'should add three colors')
assert.deepEqual(Color.add_([1, 2, 3]), [1, 2, 3], 'should add one color (noop)')
{
  const c1 = [1, 2, 3]
  Color.add_(c1, [3, 4, 5])
  assert.deepEqual(c1, [4, 6, 8], 'should modify first argument values')
}
{
  const c1 = [1, 2, 3]
  const c3 = Color.add_(c1, [3, 4, 5])
  assert.deepEqual(c1, c3, 'should return first argument')
}

// multiply
assert.deepEqual(Color.multiply([100, 200, 300], [51, 51, 51]), [20, 40, 60], 'should multiply two colors')
assert.deepEqual(
  Color.multiply([100, 200, 300], [51, 51, 51], [510, 510, 510]),
  [40, 80, 120],
  'should multiply three colors',
)
assert.deepEqual(Color.multiply([1, 2, 3]), [1, 2, 3], 'should multiply one color (noop)')
{
  const c1 = [1, 2, 3]
  const c2 = [3, 4, 5]
  Color.multiply(c1, c2)
  assert.deepEqual(c1, [1, 2, 3], 'should not modify first argument values')
}
assert.deepEqual(Color.multiply([100, 200, 300], [10, 10, 10]), [4, 8, 12], 'should round values')

// multiply_
assert.deepEqual(Color.multiply_([100, 200, 300], [51, 51, 51]), [20, 40, 60], 'should multiply two colors')
assert.deepEqual(
  Color.multiply_([100, 200, 300], [51, 51, 51], [510, 510, 510]),
  [40, 80, 120],
  'should multiply three colors',
)
assert.deepEqual(Color.multiply_([1, 2, 3]), [1, 2, 3], 'should multiply one color (noop)')
{
  const c1 = [100, 200, 300]
  const c2 = [51, 51, 51]
  Color.multiply_(c1, c2)
  assert.deepEqual(c1, [20, 40, 60], 'should modify first argument values')
}
assert.deepEqual(Color.multiply_([100, 200, 300], [10, 10, 10]), [4, 8, 12], 'should round values')
{
  const c1 = [1, 2, 3]
  const c2 = [3, 4, 5]
  const c3 = Color.multiply_(c1, c2)
  assert.deepEqual(c1, c3, 'should return first argument')
}

// fromString
assert.deepEqual(Color.fromString('rgb(10, 20, 33)'), [10, 20, 33], 'should handle rgb() colors')
assert.deepEqual(Color.fromString('#1a2f3c'), [26, 47, 60], 'should handle #abcdef colors')
assert.deepEqual(Color.fromString('#ca8'), [204, 170, 136], 'should handle #abc colors')
assert.deepEqual(Color.fromString('red'), [255, 0, 0], 'should handle named colors')
assert.deepEqual(Color.fromString('lol'), [0, 0, 0], 'should not handle nonexistant colors')

// toRGB
assert(Color.toRGB([10, 20, 30]) === 'rgb(10,20,30)', 'should serialize to rgb')
assert(Color.toRGB([-100, 20, 2000]) === 'rgb(0,20,255)', 'should clamp values to 0..255')

// toHex
assert(Color.toHex([10, 20, 40]) === '#0a1428', 'should serialize to hex')
assert(Color.toHex([-100, 20, 2000]) === '#0014ff', 'should clamp values to 0..255')

// interpolate
assert.deepEqual(Color.interpolate([10, 20, 40], [100, 200, 300], 0.1), [19, 38, 66], 'should intepolate two colors')
assert.deepEqual(Color.interpolate([10, 20, 40], [15, 30, 53], 0.5), [13, 25, 47], 'should round values')
assert.deepEqual(Color.interpolate([10, 20, 40], [20, 30, 40]), [15, 25, 40], 'should default to 0.5 factor')

// interpolateHSL
assert.deepEqual(Color.interpolateHSL([10, 20, 40], [100, 200, 300], 0.1), [12, 33, 73], 'should intepolate two colors')

// randomize
{
  const c = Color.randomize([100, 100, 100], 100)
  assert(c[0] === c[1] && c[1] === c[2], 'should maintain constant diff when a number is used')
}

// rgb2hsl and hsl2rgb
{
  const rgb = [[255, 255, 255], [0, 0, 0], [255, 0, 0], [30, 30, 30], [100, 120, 140]]

  while (rgb.length) {
    const color = rgb.pop()
    const hsl = Color.rgb2hsl(color)
    const rgb2 = Color.hsl2rgb(hsl)
    assert.deepEqual(rgb2, color, 'should correctly convert to HSL and back')
  }
}
{
  const hsl = [0.5, 0, 0.3]
  const rgb = Color.hsl2rgb(hsl)
  rgb.forEach(rate => {
    assert(Math.round(rate) === rate, 'should round converted values')
  })
}
