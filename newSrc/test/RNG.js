import assert from 'power-assert'
import {is, gt, lt, gte, lte} from 'ramda'

import RNG from '../rng'

// getUniform
{
  const value = RNG.getUniform()
  assert(is(Number, value), 'should return a number')
  assert(gt(value, 0) && lt(value, 1), 'should return a number 0..1')
}

// getUniformint
{
  const lowerBound = 5
  const upperBound = 10
  assert(is(Number, RNG.getUniformInt(lowerBound, upperBound)), 'should return a number')
  const testSeed = Math.round(Math.random() * 1000000)
  RNG.seed = testSeed
  const result1 = RNG.getUniformInt(lowerBound, upperBound)
  RNG.seed = testSeed
  const result2 = RNG.getUniformInt(lowerBound, upperBound)
  assert(result1 === result2, 'should not care which number is larger in the arguments')
  {
    const result1 = RNG.getUniformInt(lowerBound, upperBound);
    const result2 = RNG.getUniformInt(upperBound, lowerBound);
    assert(
      lte(result1, upperBound) && gte(result1, lowerBound) &&
      lte(result2, upperBound) && gte(result2, lowerBound),
      'should only return a number in the desired range',
    )
  }
}

// seeding
{
  assert(is(Number, RNG.seed), 'should return a seed number')

  const testSeed = Math.round(Math.random() * 1000000)
  RNG.seed = testSeed
  const result1 = RNG.getUniform()
  RNG.seed = testSeed
  const result2 = RNG.getUniform()
  assert(result1 === result2, 'should return the same value for a given seed')

  RNG.seed = 12345
  const result = RNG.getUniform()
  assert(result === 0.01198604702949524, 'should return a precomputed value for a given seed')
}

// state manipulation
{
  RNG.getUniform()
  const testState = RNG.state
  const result1 = RNG.getUniform()
  RNG.state = testState
  const result2 = RNG.getUniform()
  assert(result1 === result2, 'should return identical values after setting identical states')
}

//cloning
{
  {
    const clone = RNG.clone()
    assert(is(Object, clone), 'should be able to clone a RNG')
  }
  {
    const clone = RNG.clone()
    const num = clone.getUniform()
    assert(is(Number, num), 'should clone a working RNG')
  }
  {
    const clone = RNG.clone()
    const num1 = RNG.getUniform()
    const num2 = clone.getUniform()
    assert(num1 === num2, 'should clone maintaining its state')
  }
}
