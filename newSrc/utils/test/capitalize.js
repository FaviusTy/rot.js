import assert from 'power-assert'
import capitalize from '../capitalize'

assert(
  (capitalize('abc') === 'Abc' && capitalize('Abc') === 'Abc'),
  'should capitalize first letter'
)
