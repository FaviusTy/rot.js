import Runner from 'eater/lib/runner'
import assert from 'power-assert'
import EventQueue from '../EventQueue'

const test = Runner.test

test('should return added event', () => {
  const q = new EventQueue()
  q.add('a', 100)
  assert(q.get() === 'a')
})

test('should return null when no events are available', () => {
  const q = new EventQueue()
  assert(!q.get())
})

test('should remove returned events', () => {
  const q = new EventQueue()
  q.add(0, 0)
  q.get()
  assert(!q.get())
})

test('should look up time of events', () => {
  const q = new EventQueue()
  q.add(123, 187)
  q.add(456, 42)
  assert(q.getEventTime(123) === 187)
  assert(q.getEventTime(456) === 42)
})

test('should look up correct times after events removed', () => {
  const q = new EventQueue()
  q.add(123, 187)
  q.add(456, 42)
  q.add(789, 411)
  q.get()
  assert(!q.getEventTime(456))
  assert(q.getEventTime(123) === 187 - 42)
  assert(q.getEventTime(789) === 411 - 42)
})

test('should remove events', () => {
  const q = new EventQueue()
  q.add(123, 0)
  q.add(456, 0)
  const result = q.remove(123)
  assert(result)
  assert(q.get() === 456)
})

test('should survive removal of non-existant events', () => {
  const q = new EventQueue()
  q.add(0, 0)
  const result = q.remove(1)
  assert(!result)
  assert(q.get() === 0)
})

test('should return events sorted', () => {
  const q = new EventQueue()
  q.add(456, 10)
  q.add(123, 5)
  q.add(789, 15)
  assert(q.get() === 123)
  assert(q.get() === 456)
  assert(q.get() === 789)
})

test('should compute elapsed time', () => {
  const q = new EventQueue()
  q.add(456, 10)
  q.add(123, 5)
  q.add(789, 15)
  q.get()
  q.get()
  q.get()
  assert(q.time === 15)
})

test('should maintain event order for same timestamps', () => {
  const q = new EventQueue()
  q.add(456, 10)
  q.add(123, 10)
  q.add(789, 10)
  assert(q.get() === 456)
  assert(q.get() === 123)
  assert(q.get() === 789)
  assert(q.time === 10)
})
