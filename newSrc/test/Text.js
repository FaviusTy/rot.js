import Runner from 'eater/lib/runner'
import assert from 'power-assert'
import Text from '../Text'

const test = Runner.test

const A100 = new Array(101).join('A')
const B100 = new Array(101).join('B')

test('should not break when not requested', () => {
  const size = Text.measure(A100)
  assert(size.width === A100.length)
  assert(size.height === 1)
})

test('should break when max length requested', () => {
  const size = Text.measure(A100, 30)
  assert(size.height === 4)
})

test('should break at explicit newlines', () => {
  const size = Text.measure('a\nb\nc')
  assert(size.height === 3)
})

test('should break at explicit newlines AND max length', () => {
  assert(Text.measure(A100 + B100, 30).height === 7)
  assert(Text.measure(A100 + '\n' + B100, 30).height === 8)
})

test('should break at space', () => {
  assert(Text.measure(A100 + ' ' + B100, 30).height === 8)
})

test('should not break at nbsp', () => {
  assert(Text.measure(A100 + String.fromCharCode(160) + B100, 30).height === 7)
})

test('should not break when text is short', () => {
  const size = Text.measure('aaa bbb', 7)
  assert(size.width === 7)
  assert(size.height === 1)
})

test('should adjust resulting width', () => {
  const size = Text.measure('aaa bbb', 6)
  assert(size.width === 3)
  assert(size.height === 2)
})

test('should adjust resulting width even without breaks', () => {
  const size = Text.measure('aaa ', 6)
  assert(size.width === 3)
  assert(size.height === 1)
})

test('should remove unnecessary spaces around newlines', () => {
  const size = Text.measure('aaa  \n  bbb')
  assert(size.width === 3)
  assert(size.height === 2)
})

test('should remove unnecessary spaces at the beginning', () => {
  const size = Text.measure('   aaa    bbb', 3)
  assert(size.width === 3)
  assert(size.height === 2)
})

test('should remove unnecessary spaces at the end', () => {
  const size = Text.measure('aaa    \nbbb', 3)
  assert(size.width === 3)
  assert(size.height === 2)
})

test('should not break with formatting part', () => {
  assert(Text.measure('aaa%c{x}bbb').height === 1)
})

test('should correctly remove formatting', () => {
  assert(Text.measure('aaa%c{x}bbb').width === 6)
})

test('should break independently on formatting - forced break', () => {
  const size = Text.measure('aaa%c{x}bbb', 3)
  assert(size.width === 3)
  assert(size.height === 2)
})

test('should break independently on formatting - forward break', () => {
  const size = Text.measure('aaa%c{x}b bb', 5)
  assert(size.width === 4)
  assert(size.height === 2)
})

test('should break independently on formatting - backward break', () => {
  const size = Text.measure('aa a%c{x}bbb', 5)
  assert(size.width === 4)
  assert(size.height === 2)
})
