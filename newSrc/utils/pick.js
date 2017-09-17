import RNG from '../rng'

export default function pick(array) {
  if (!array.length || array.length <= 0) return null
  return array[Math.floor(RNG.getUniform() * array.length)]
}
