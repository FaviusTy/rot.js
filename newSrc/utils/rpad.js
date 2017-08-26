/**
 * Right pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
export default (character = '0', count = 2) => {
  return (string) => {
    let s = ''
    while (s.length < (count - string.length)) { s += character }
    s = s.substring(0, count - string.length)
    return string + s
  }
}
