import Scheduler from './Scheduler'
/**
 * @class Speed-based scheduler
 * @augments ROT.Scheduler
 */
export default class SpeedScheduler extends Scheduler {
	constructor() {
		super()
	}

  /**
   * @param {object} item anything with "getSpeed" method
   * @param {boolean} repeat
   * @param {number} [time=1/item.getSpeed()]
   * @see ROT.Scheduler#add
   */
  add(item, repeat, time) {
    this._queue.add(item, time !== undefined ? time : 1/item.getSpeed())
    return super.add(item, repeat)
  }

  /**
   * @see ROT.Scheduler#next
   */
  next() {
    if (this._current && this._repeat.indexOf(this._current) !== -1) {
      this._queue.add(this._current, 1 / this._current.getSpeed())
    }
    return super.next()
  }
}
