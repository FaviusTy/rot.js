import pick from './pick'

export default function shuffle(array) {
  const result = []
  while (array.length) {
    const index = array.indexOf(pick(array))
    result.push(array.splice(index, 1)[0])
  }
  return result
}
