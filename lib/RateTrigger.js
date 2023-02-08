/**
 * A class that counts the number of events that occur in a given time period.
 * It will trigger a callback when the number of events exceeds a given limit.
 */
export default class RateTrigger {
  constructor(duration, limit) {
    this._count = 0;
    this._duration = duration;
    this._limit = limit;
    this._callbacks = [];
  }

  increment() {
    this._count++;
    if (this._count >= this._limit) {
      this._callbacks.forEach(callback => callback());
    }
    setTimeout(() => this._count--, this._duration);
  }

  get count() {
    return this._count;
  }

  onTrigger(callback) {
    this._callbacks.push(callback);
  }
}