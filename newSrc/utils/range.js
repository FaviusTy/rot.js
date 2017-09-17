export default function range(length = 0) {
  return Array.from(new Array(length), (_, index) => index)
}
