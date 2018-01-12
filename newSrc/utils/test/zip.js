import assert from 'power-assert'
import zip from '../zip'

function check(result) {
  return (v, i) => {
    assert(v[0] === result[i][0])
    assert(v[1] === result[i][1])
  }
}

zip([1, 2, 3], [2, 3, 4]).forEach(check([[1, 2], [2, 3], [3, 4]]))
zip([1, 2, 3], [2, 3]).forEach(check([[1, 2], [2, 3], [3, undefined]]))
zip([1, 2], [2, 3, 4]).forEach(check([[1, 2], [2, 3], [undefined, 4]]))
