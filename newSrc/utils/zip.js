import range from './range'

export default (leftArray, rightArray) =>
  range(leftArray.length >= rightArray.length ? leftArray.length : rightArray.length).map(index => [
    leftArray[index],
    rightArray[index],
  ])
